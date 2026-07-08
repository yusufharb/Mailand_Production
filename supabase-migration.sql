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
-- with price copied from the product's own price column and stock set to 0
-- (you will need to manually correct stock values for existing products
--  via the Admin Dashboard after running this migration).

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
    -- Each old string like "100ml" becomes {"name":"100ml","price":0,"stock":0}
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
-- STEP 3: Create or replace the place_order RPC function
-- ============================================================
-- This function:
--   1. Creates an order row
--   2. Locks each product row with FOR UPDATE (prevents overselling)
--   3. Finds the requested size in the JSONB array
--   4. Validates sufficient stock
--   5. Deducts stock atomically
--   6. Inserts order_items rows with a full product snapshot
--   7. Returns the new order's UUID
--
-- If ANY step fails, the entire transaction is rolled back automatically.

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name  TEXT,
  p_phone          TEXT,
  p_address        TEXT,
  p_city           TEXT,
  p_notes          TEXT,
  p_total_price    NUMERIC,
  p_payment_method TEXT,
  p_items          JSONB   -- Array of { product_id, name, size, quantity, price }
)
RETURNS JSONB               -- Returns { order_id, order_number }
LANGUAGE plpgsql
SECURITY DEFINER            -- Runs with owner privileges (bypasses RLS for stock update)
AS $$
DECLARE
  v_order_id     UUID;
  v_order_number TEXT;
  v_item         JSONB;
  v_product      RECORD;
  v_new_sizes    JSONB;
  v_size_obj     JSONB;
  v_size_idx     INT;
  v_has_size     BOOLEAN;
  v_qty          INT;
BEGIN
  -- ── 1. Generate a human-readable order number ──────────────
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                   UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));

  -- ── 2. Insert the order header ─────────────────────────────
  INSERT INTO public.orders (
    customer_name, phone, address, city, notes,
    total_price, payment_method, order_number
  )
  VALUES (
    p_customer_name, p_phone, p_address, p_city, p_notes,
    p_total_price, p_payment_method, v_order_number
  )
  RETURNING id INTO v_order_id;

  -- ── 3. Process each line item ──────────────────────────────
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INT;

    -- Lock the product row to prevent concurrent overselling
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', (v_item->>'product_id');
    END IF;

    -- ── 4. Find the requested size in the JSONB array ────────
    v_new_sizes := v_product.sizes;
    v_has_size  := false;

    FOR v_size_idx IN 0 .. jsonb_array_length(v_new_sizes) - 1
    LOOP
      v_size_obj := v_new_sizes->v_size_idx;

      IF v_size_obj->>'name' = (v_item->>'size') THEN
        v_has_size := true;

        -- ── 5. Validate stock ──────────────────────────────
        IF (v_size_obj->>'stock')::INT < v_qty THEN
          RAISE EXCEPTION
            'Insufficient stock for "%" size "%". Requested: %, Available: %',
            v_product.name,
            (v_item->>'size'),
            v_qty,
            (v_size_obj->>'stock')::INT;
        END IF;

        -- ── 6. Deduct stock from this size ─────────────────
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
        EXIT; -- found and processed, stop looping
      END IF;
    END LOOP;

    IF NOT v_has_size THEN
      RAISE EXCEPTION
        'Size "%" not found for product "%"',
        (v_item->>'size'), v_product.name;
    END IF;

    -- ── 7. Persist the updated sizes + total stock ────────────
    UPDATE public.products
    SET
      sizes = v_new_sizes,
      stock = stock - v_qty   -- keep the top-level stock in sync
    WHERE id = v_product.id;

    -- ── 8. Insert order item with full snapshot ───────────────
    INSERT INTO public.order_items (
      order_id, product_id, name, size, quantity, price
    )
    VALUES (
      v_order_id,
      v_product.id,
      v_item->>'name',
      v_item->>'size',
      v_qty,
      (v_item->>'price')::NUMERIC
    );

  END LOOP;

  -- ── 9. Return order details ────────────────────────────────
  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_number
  );

END;
$$;


-- ============================================================
-- STEP 4: Grant execute permission so the anon/service role can call it
-- ============================================================
GRANT EXECUTE ON FUNCTION public.place_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB
) TO anon, authenticated, service_role;


-- ============================================================
-- DONE
-- ============================================================
-- Verify by running:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'products' AND column_name = 'sizes';
--   -- Expected: data_type = 'jsonb'
--
--   \df public.place_order
--   -- Expected: function listed
-- ============================================================
