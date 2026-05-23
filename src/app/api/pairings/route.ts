import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "pairings_published")
    .single();

  if (!setting || setting.value !== "true") {
    return NextResponse.json({ published: false, pdfUrl: null });
  }

  const { data: pdfSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "pairings_pdf_url")
    .single();

  return NextResponse.json({
    published: true,
    pdfUrl: pdfSetting?.value || null,
  });
}
