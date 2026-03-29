import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
      "学校", "参加/不参加", "プレースタイル", "氏名", "卒業回数",
      "卒業年", "住所", "生年月日", "電話番号", "希望事項", "賞品寄贈", "申込日時"
    ];
    const rows = (data || []).map((e) => [
      e.school, e.participation, e.caddy_preference || "",
      e.name, e.graduation_number || "", e.graduation_year || "",
      e.address || "", e.birth_date || "", e.phone,
      e.requests || "", e.prize_donation || "",
      e.created_at ? new Date(e.created_at).toLocaleString("ja-JP") : ""
    ]);

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
