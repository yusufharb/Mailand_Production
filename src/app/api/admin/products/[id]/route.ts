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
    if (body.price !== undefined) dbPayload.price = body.price;
    if (body.stock !== undefined) dbPayload.stock = body.stock;
    if (body.images !== undefined) dbPayload.image = body.images[0] || "";
    if (body.isFeatured !== undefined) dbPayload.is_featured = body.isFeatured;

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
