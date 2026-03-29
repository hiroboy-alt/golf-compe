import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // 公開設定をチェック
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "pairings_published")
    .single();

  if (!setting || setting.value !== "true") {
    return NextResponse.json({ published: false, pairings: [] });
  }

  const { data, error } = await supabase
    .from("pairings")
    .select("*")
    .order("start_course")
    .order("group_number")
    .order("order_in_group");

  if (error) {
    return NextResponse.json({ error: "データの取得に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ published: true, pairings: data || [] });
}
