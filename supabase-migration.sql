-- ============================================================
-- MAILAND COSMETICS — SUPABASE MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
-- This migration MUST be run AFTER the initial schema (supabase-schema.sql)
-- It is safe to run multiple times (idempotent).
-- ============================================================


-- ============================================================
-- STEP 1: Convert products.sizes from TEXT[] to JSONB
-- ============================================================
-- Each size is now an object: { name, price, discountPrice?, stock }
-- Old TEXT[] rows are converted to JSONB objects using their name only,
-- with price copied from the product's own price column and stock set to 0.
-- (Correct stock values for existing products via the Admin Dashboard.)

DO $$
BEGIN
  -- Only run the column type change if sizes is still TEXT[]
  IF (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'products'
      AND column_name  = 'sizes'
  ) = 'ARRAY' THEN

    -- Drop the default first (required before TYPE change)
    ALTER TABLE public.products ALTER COLUMN sizes DROP DEFAULT;

    -- Convert TEXT[] → JSONB
    -- Each old string like "100ml" becomes {"name":"100ml","price":<product.price>,"stock":0}
    ALTER TABLE public.products
      ALTER COLUMN sizes TYPE JSONB
      USING (
        CASE
          WHEN sizes IS NULL OR array_length(sizes, 1) IS NULL THEN '[]'::jsonb
          ELSE (
            SELECT jsonb_agg(
              jsonb_build_object(
                'name',  s,
                'price', price,
                'stock', 0
              )
            )
            FROM unnest(sizes) AS s
          )
        END
      );

    -- Restore a safe JSONB default
    ALTER TABLE public.products ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;

    RAISE NOTICE 'Migration complete: products.sizes converted from TEXT[] to JSONB';
  ELSE
    RAISE NOTICE 'Skipped: products.sizes is already JSONB';
  END IF;
END;
$$;


-- ============================================================
-- STEP 2: Add order_number column for human-readable Order IDs
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'orders'
      AND column_name  = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT;

    -- Back-fill any existing orders with a generated number
    UPDATE public.orders
    SET order_number = 'ORD-' || UPPER(SUBSTRING(id::TEXT, 1, 8))
    WHERE order_number IS NULL;

    RAISE NOTICE 'Migration complete: orders.order_number column added';
  ELSE
    RAISE NOTICE 'Skipped: orders.order_number already exists';
  END IF;
END;
$$;


-- ============================================================
-- STEP 3: Drop old function signature if it exists
-- ============================================================
-- The old signature accepted p_total_price from the client.
-- We drop it so the new signature (without p_total_price) takes effect cleanly.
DROP FUNCTION IF EXISTS public.place_order(TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB);


-- ============================================================
-- STEP 4: Create the hardened place_order RPC function
-- ============================================================
--
-- Security improvements over the original:
--   1. Quantity > 0 validated before any DB work
--   2. Price is read from the DB (JSONB size object), never trusted from client
--   3. Total is calculated server-side from DB prices × quantities
--   4. Top-level stock is recalculated as SUM of all size stocks after each update
--   5. SET search_path = public prevents search-path-injection attacks
--
-- Behaviour:
--   • Creates an order header row
--   • FOR UPDATE locks each product row (prevents concurrent overselling)
--   • Finds the requested size in the JSONB array
--   • Validates quantity > 0 and sufficient stock
--   • Deducts stock from the size object
--   • Recalculates the top-level stock from the JSONB array
--   • Inserts order_items with the DB price (snapshot)
--   • Calculates total from DB prices and writes it to the order
--   • Returns { order_id, order_number }
--   • Any failure rolls back the entire transaction automatically
--
-- p_items: JSONB array of { product_id UUID, name TEXT, size TEXT, quantity INT }
--   NOTE: "price" from the client is intentionally ignored.

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name  TEXT,
  p_phone          TEXT,
  p_address        TEXT,
  p_city           TEXT,
  p_notes          TEXT,
  p_payment_method TEXT,
  p_items          JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public          -- ← prevents search-path injection
AS $$
DECLARE
  v_order_id       UUID;
  v_order_number   TEXT;
  v_item           JSONB;
  v_product        RECORD;
  v_new_sizes      JSONB;
  v_size_obj       JSONB;
  v_size_idx       INT;
  v_has_size       BOOLEAN;
  v_qty            INT;
  v_db_price       NUMERIC;       -- price read from the DB, not the client
  v_db_discount    NUMERIC;       -- discountPrice from the DB (may be NULL)
  v_unit_price     NUMERIC;       -- effective price (discount if set, else price)
  v_total_price    NUMERIC := 0;  -- server-calculated order total
  v_computed_stock INT;           -- stock recalculated from JSONB sizes
BEGIN

  -- ── 0. Basic input guard ────────────────────────────────────
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- ── 1. Validate quantities before touching any rows ─────────
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF (v_item->>'quantity')::INT <= 0 THEN
      RAISE EXCEPTION
        'Quantity must be greater than zero (got % for product %)',
        (v_item->>'quantity'),
        (v_item->>'product_id');
    END IF;
  END LOOP;

  -- ── 2. Generate a human-readable order number ───────────────
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                    UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));

  -- ── 3. Insert order header (total_price filled in at step 7) ─
  INSERT INTO orders (
    customer_name, phone, address, city, notes,
    total_price, payment_method, order_number
  )
  VALUES (
    p_customer_name, p_phone, p_address, p_city, p_notes,
    0,              -- placeholder; updated after items are processed
    p_payment_method, v_order_number
  )
  RETURNING id INTO v_order_id;

  -- ── 4. Process each line item ───────────────────────────────
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INT;

    -- Lock the product row to prevent concurrent overselling
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', (v_item->>'product_id');
    END IF;

    -- ── 5. Find the requested size in the DB ──────────────────
    v_new_sizes := v_product.sizes;
    v_has_size  := false;
    v_db_price  := NULL;
    v_db_discount := NULL;

    FOR v_size_idx IN 0 .. jsonb_array_length(v_new_sizes) - 1
    LOOP
      v_size_obj := v_new_sizes->v_size_idx;

      IF v_size_obj->>'name' = (v_item->>'size') THEN
        v_has_size := true;

        -- ── 6. Read price from the DB (ignore client price) ───
        v_db_price    := (v_size_obj->>'price')::NUMERIC;
        v_db_discount := NULLIF(v_size_obj->>'discountPrice', '')::NUMERIC;
        v_unit_price  := COALESCE(v_db_discount, v_db_price);

        -- ── 7. Validate stock ──────────────────────────────────
        IF (v_size_obj->>'stock')::INT < v_qty THEN
          RAISE EXCEPTION
            'Insufficient stock for "%" size "%". Requested: %, Available: %',
            v_product.name,
            (v_item->>'size'),
            v_qty,
            (v_size_obj->>'stock')::INT;
        END IF;

        -- ── 8. Deduct stock from this size ─────────────────────
        v_size_obj := jsonb_set(
          v_size_obj,
          '{stock}',
          to_jsonb((v_size_obj->>'stock')::INT - v_qty)
        );
        v_new_sizes := jsonb_set(
          v_new_sizes,
          ARRAY[v_size_idx::TEXT],
          v_size_obj
        );
        EXIT;
      END IF;
    END LOOP;

    IF NOT v_has_size THEN
      RAISE EXCEPTION
        'Size "%" not found for product "%"',
        (v_item->>'size'), v_product.name;
    END IF;

    -- ── 9. Recalculate top-level stock as SUM of all size stocks
    SELECT COALESCE(SUM((s->>'stock')::INT), 0)
    INTO v_computed_stock
    FROM jsonb_array_elements(v_new_sizes) AS s;

    -- ── 10. Persist updated sizes and recalculated stock ────────
    UPDATE products
    SET
      sizes = v_new_sizes,
      stock = v_computed_stock        -- derived from JSONB, never decremented directly
    WHERE id = v_product.id;

    -- ── 11. Accumulate server-side total ────────────────────────
    v_total_price := v_total_price + (v_unit_price * v_qty);

    -- ── 12. Insert order item snapshot (DB price, not client) ───
    INSERT INTO order_items (
      order_id, product_id, name, size, quantity, price
    )
    VALUES (
      v_order_id,
      v_product.id,
      COALESCE(v_item->>'name', v_product.name),  -- fallback to DB name
      v_item->>'size',
      v_qty,
      v_unit_price                                 -- DB-sourced price
    );

  END LOOP;

  -- ── 13. Write the server-calculated total back to the order ──
  UPDATE orders
  SET total_price = v_total_price
  WHERE id = v_order_id;

  -- ── 14. Return order details ─────────────────────────────────
  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_number,
    'total_price',  v_total_price
  );

END;
$$;


-- ============================================================
-- STEP 5: Grant execute permission
-- ============================================================
GRANT EXECUTE ON FUNCTION public.place_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO anon, authenticated, service_role;


-- ============================================================
-- DONE
-- ============================================================
-- Verify with:
--
--   -- 1. Check sizes column type
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_name = 'products' AND column_name = 'sizes';
--   -- Expected: data_type = 'jsonb'
--
--   -- 2. Check function exists with correct signature
--   SELECT proname, prosrc
--   FROM pg_proc
--   WHERE proname = 'place_order';
--
--   -- 3. Smoke-test (replace UUIDs with real values from your products table):
--   -- SELECT public.place_order(
--   --   'Test Customer', '+201234567890', '123 Test St', 'Cairo', '',
--   --   'Cash On Delivery',
--   --   '[{"product_id":"<UUID>","name":"Test Product","size":"100ml","quantity":1}]'::jsonb
--   -- );
-- ============================================================
