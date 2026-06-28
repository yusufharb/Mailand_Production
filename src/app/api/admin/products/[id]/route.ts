import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
        const body = await request.json();
    
    // Map frontend structure to DB structure (only pass defined fields)
    const dbPayload: any = {};
    if (body.name !== undefined) dbPayload.name = body.name;
    if (body.description !== undefined) dbPayload.description = body.description;
    if (body.category !== undefined) dbPayload.category = body.category;
    if (body.price !== undefined) dbPayload.price = body.price;
    if (body.discountPrice !== undefined) dbPayload.discount_price = body.discountPrice;
    if (body.images !== undefined) dbPayload.images = body.images;
    if (body.sizes !== undefined) dbPayload.sizes = body.sizes;
    if (body.stock !== undefined) dbPayload.stock = body.stock;
    if (body.isFeatured !== undefined) dbPayload.is_featured = body.isFeatured;
    if (body.isVisible !== undefined) dbPayload.is_visible = body.isVisible;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
        
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
