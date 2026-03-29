import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { school, participation, caddy_preference, name, graduation_number, address, birth_date, phone, requests, prize_donation, companions } = body;

    if (!school || !participation || !name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "必須項目が入力されていません。" }, { status: 400 });
    }

    if (participation === "参加" && !caddy_preference) {
      return NextResponse.json({ error: "キャディー付/セルフを選択してください。" }, { status: 400 });
    }

    const { error } = await supabase.from("entries").insert({
      school,
      participation,
      caddy_preference: participation === "参加" ? caddy_preference : null,
      name: name.trim(),
      graduation_number,
      address,
      birth_date,
      phone: phone.trim(),
      requests,
      prize_donation,
      companions: companions && companions.length > 0 ? JSON.stringify(companions) : null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "データの保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }
}
