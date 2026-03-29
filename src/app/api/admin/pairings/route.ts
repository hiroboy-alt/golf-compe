import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

type PairingInsert = {
  group_number: number;
  start_course: string;
  start_time: string;
  player_name: string;
  school: string;
  graduation: string;
  birth_date: string;
  caddy_flag: boolean;
  order_in_group: number;
};

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sheetName = (formData.get("sheet") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません。" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let rows: PairingInsert[];

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      rows = parseXlsx(Buffer.from(buffer), sheetName);
    } else if (fileName.endsWith(".csv")) {
      const text = await file.text();
      rows = parseCsv(text);
    } else {
      return NextResponse.json(
        { error: "xlsx または csv ファイルを選択してください。" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "データが見つかりませんでした。" }, { status: 400 });
    }

    await supabase.from("pairings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("pairings").insert(rows);
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "データの保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
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

  await supabase.from("pairings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
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

// ── Excel (xlsx) パーサー ────────────────────────────────────────────────────
// 組合せExcelのフォーマット:
//   行0: タイトル行
//   行1: ＯＵＴ / ＩＮ ラベル行
//   以降: 3行1組のグループ
//     行N  : [時間OUT, キャ付?, 選手1, 選手2, 選手3, 選手4?, null, 時間IN, キャ付?, 選手1, 選手2, 選手3, 選手4?]
//     行N+1: [null, null, 学校回生×4, null, null, null, 学校回生×3]
//     行N+2: [null, null, 生年月日×4, null, null, null, 生年月日×3]
function parseXlsx(buffer: Buffer, sheetName: string | null): PairingInsert[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const name = sheetName && workbook.SheetNames.includes(sheetName)
    ? sheetName
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[name];
  const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });

  const rows: PairingInsert[] = [];
  let groupNumber = 0;
  let i = 2; // ヘッダー2行をスキップ

  while (i < data.length) {
    const row = data[i] || [];
    const row2 = data[i + 1] || [];
    const row3 = data[i + 2] || [];

    const timeOut = cellStr(row[0]);
    const timeIn = cellStr(row[7]);

    // 時間値がなければグループ行ではないのでスキップ
    if (!isTimeValue(timeOut) && !isTimeValue(timeIn)) {
      i++;
      continue;
    }

    groupNumber++;
    const caddyOut = isCaddy(row[1]);
    const caddyIn = isCaddy(row[8]);
    const fmtTimeOut = formatTime(timeOut);
    const fmtTimeIn = formatTime(timeIn);

    // OUT側: 列C-F (index 2-5)
    for (let col = 2; col <= 5; col++) {
      const name = cellStr(row[col]);
      if (!name) continue;
      const { school, graduation } = parseSchoolGrad(cellStr(row2[col]));
      rows.push({
        group_number: groupNumber,
        start_course: "OUT",
        start_time: fmtTimeOut,
        player_name: name,
        school,
        graduation,
        birth_date: cellStr(row3[col]),
        caddy_flag: caddyOut,
        order_in_group: col - 1,
      });
    }

    // IN側: 列J-M (index 9-12)
    for (let col = 9; col <= 12; col++) {
      const name = cellStr(row[col]);
      if (!name) continue;
      const { school, graduation } = parseSchoolGrad(cellStr(row2[col]));
      rows.push({
        group_number: groupNumber,
        start_course: "IN",
        start_time: fmtTimeIn,
        player_name: name,
        school,
        graduation,
        birth_date: cellStr(row3[col]),
        caddy_flag: caddyIn,
        order_in_group: col - 8,
      });
    }

    i += 3;
  }

  return rows;
}

function cellStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function isTimeValue(val: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(val);
}

function isCaddy(val: unknown): boolean {
  return String(val || "").includes("キャ");
}

function formatTime(val: string): string {
  const m = val.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return val;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function parseSchoolGrad(val: string): { school: string; graduation: string } {
  if (!val) return { school: "", graduation: "" };
  // "一高 33回", "二高48回", "三高 2回" などを解析
  const m = val.match(/([一二三]高)\s*(\d+)\s*回/);
  if (m) return { school: m[1], graduation: m[2] + "回" };
  return { school: val, graduation: "" };
}

// ── CSV パーサー（後方互換）──────────────────────────────────────────────────
// カラム: 組番号, コース, スタート時間, 選手名, 学校, 組内順番
function parseCsv(text: string): PairingInsert[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line);
    return {
      group_number: parseInt(cols[0]) || 0,
      start_course: cols[1] || "",
      start_time: cols[2] || "",
      player_name: cols[3] || "",
      school: cols[4] || "",
      graduation: cols[5] || "",
      birth_date: cols[6] || "",
      caddy_flag: false,
      order_in_group: parseInt(cols[7]) || 0,
    };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { result.push(current.trim()); current = ""; }
      else { current += char; }
    }
  }
  result.push(current.trim());
  return result;
}
