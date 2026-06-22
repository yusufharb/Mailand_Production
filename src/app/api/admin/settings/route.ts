import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Map SiteSettings to DB columns
    const dbPayload = {
      hero_title: body.hero.title,
      hero_subtitle: body.hero.subtitle,
      hero_image: body.hero.image,
      hero_cta_text: body.hero.ctaText,
      hero_cta_link: body.hero.ctaLink,
      footer_about: body.footer.about,
      footer_links: body.footer.links,
      footer_social: body.footer.social,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("settings")
      .update(dbPayload)
      .eq("id", 1) // Enforced singleton row
      .select()
      .single();

    if (error) {
      // If it fails to update, maybe row id=1 doesn't exist yet, but our schema script creates it.
      // We could try an upsert or check error type.
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
