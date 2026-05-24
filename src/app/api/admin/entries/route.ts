import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "データの取得に失敗しました。" }, { status: 500 });
  }

  if (format === "csv") {
    const headers = [
      "学校", "参加/不参加", "プレースタイル", "氏名", "回生",
      "住所", "生年月日", "電話番号", "希望事項", "賞品寄贈",
      "同伴者1氏名", "同伴者1回生", "同伴者1生年月日",
      "同伴者2氏名", "同伴者2回生", "同伴者2生年月日",
      "同伴者3氏名", "同伴者3回生", "同伴者3生年月日",
      "申込日時"
    ];
    const rows = (data || []).map((e) => {
      const companions: { name: string; graduation_number: string; birth_date: string }[] =
        e.companions ? JSON.parse(e.companions) : [];
      const companionCols: string[] = [];
      for (let i = 0; i < 3; i++) {
        const c = companions[i];
        companionCols.push(c?.name || "", c?.graduation_number || "", c?.birth_date || "");
      }
      return [
        e.school, e.participation, e.caddy_preference || "",
        e.name, e.graduation_number || "",
        e.address || "", e.birth_date || "", e.phone,
        e.requests || "", e.prize_donation || "",
        ...companionCols,
        e.created_at ? new Date(e.created_at).toLocaleString("ja-JP") : ""
      ];
    });

    const BOM = "\uFEFF";
    const csv = BOM + [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="entries_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ entries: data || [] });
}
