import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません。" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "PDFファイルを選択してください。" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("pairings")
      .upload("pairings.pdf", buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `アップロードに失敗しました: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("pairings")
      .getPublicUrl("pairings.pdf");

    // キャッシュ回避のためタイムスタンプをURLに付加
    const pdfUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert({ key: "pairings_pdf_url", value: pdfUrl });

    if (settingsError) {
      return NextResponse.json({ error: "URLの保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "ファイルの処理に失敗しました。" }, { status: 400 });
  }
}

export async function DELETE() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  await supabase.storage.from("pairings").remove(["pairings.pdf"]);
  await supabase.from("settings").delete().eq("key", "pairings_pdf_url");
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { published } = await request.json();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "pairings_published", value: String(published) });

  if (error) {
    return NextResponse.json({ error: "設定の更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
