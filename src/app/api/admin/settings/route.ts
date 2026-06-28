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

    // Fetch the existing settings row first to get its ID
    const { data: existingSettings, error: fetchError } = await supabaseAdmin
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;
    if (existingSettings?.id) {
      // Update existing settings row
      const { data, error } = await supabaseAdmin
        .from("settings")
        .update(dbPayload)
        .eq("id", existingSettings.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new settings row if empty
      const { data, error } = await supabaseAdmin
        .from("settings")
        .insert([dbPayload])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
