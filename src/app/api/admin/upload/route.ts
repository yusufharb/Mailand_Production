import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bucketName = "products";

    // Try to create the bucket just in case it doesn't exist
    try {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
      });
    } catch (e) {
      // Bucket might already exist, ignore error
      console.log("Bucket products creation skipped (might already exist)");
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload handler exception:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
