import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "tournament_info")
    .single();

  if (error || !data) {
    return NextResponse.json({ info: null });
  }

  try {
    return NextResponse.json({ info: JSON.parse(data.value) });
  } catch {
    return NextResponse.json({ info: null });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const body = await request.json();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "tournament_info", value: JSON.stringify(body) });

  if (error) {
    return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
