import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items } = body;

    // ── Validation ─────────────────────────────────────────────
    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { error: "Missing required customer fields (fullName, phone, address)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.product_id || !item.size || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Each item must have product_id, size, and quantity ≥ 1" },
          { status: 400 }
        );
      }
    }

    // ── Calculate total server-side ────────────────────────────
    // We trust the price passed from the cart (already validated on product select).
    // For extra security, you could re-fetch prices from the DB here.
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // ── Call the atomic place_order RPC ───────────────────────
    const { data, error } = await supabase.rpc("place_order", {
      p_customer_name:  customer.fullName,
      p_phone:          customer.phone,
      p_address:        customer.address,
      p_city:           customer.city || "",
      p_notes:          customer.notes || "",
      p_total_price:    totalPrice,
      p_payment_method: "Cash On Delivery",
      p_items:          items,
    });

    if (error) {
      console.error("[place_order RPC error]", error.message);
      // Surface meaningful errors from the RPC (e.g. "Insufficient stock")
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // data = { order_id, order_number }
    return NextResponse.json({
      orderId:     data.order_id,
      orderNumber: data.order_number,
    });

  } catch (err: any) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
