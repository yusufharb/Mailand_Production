import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/admin/products - Incoming body:", body);
    
    // Map frontend structure to DB structure
    const dbPayload = {
      name: body.name,
      description: body.description,
      category: body.category || "Standard",
      price: body.price,
      discount_price: body.discountPrice,
      images: body.images || [],
      sizes: body.sizes || ["Standard"],
      stock: body.stock,
      is_featured: body.isFeatured ?? false,
      is_visible: body.isVisible ?? true,
    };
    
    console.log("Mapped DB payload:", dbPayload);

    console.log("Checking Environment Variables:");
    console.log("NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw error;
    }

    console.log("Supabase Insert Success:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Caught Exception in POST /api/admin/products:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
