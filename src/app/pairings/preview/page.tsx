import { readFileSync } from "fs";
import Link from "next/link";

type Player = { name: string; school: string; graduation: string; birthDate: string };
type HalfGroup = { time: string; caddy: boolean; players: Player[] };
type Group = { groupNumber: number; out: HalfGroup; in: HalfGroup };

function cellStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function isTimeValue(val: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(val);
}

function formatTime(val: string): string {
  const m = val.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return val;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function parseSchoolGrad(val: string): { school: string; graduation: string } {
  if (!val) return { school: "", graduation: "" };
  const m = val.match(/([一二三]高)\s*(\d+)\s*回/);
  if (m) return { school: m[1], graduation: m[2] + "回" };
  return { school: val, graduation: "" };
}

function parseGroups(data: unknown[][]): Group[] {
  const groups: Group[] = [];
  let groupNumber = 0;
  let i = 2;

  while (i < data.length) {
    const row = data[i] || [];
    const row2 = data[i + 1] || [];
    const row3 = data[i + 2] || [];

    const timeOut = cellStr(row[0]);
    const timeIn = cellStr(row[7]);
    if (!isTimeValue(timeOut) && !isTimeValue(timeIn)) { i++; continue; }

    groupNumber++;

    const outPlayers: Player[] = [];
    for (let col = 2; col <= 5; col++) {
      const name = cellStr(row[col]);
      if (!name) continue;
      const { school, graduation } = parseSchoolGrad(cellStr(row2[col]));
      outPlayers.push({ name, school, graduation, birthDate: cellStr(row3[col]) });
    }

    const inPlayers: Player[] = [];
    for (let col = 9; col <= 12; col++) {
      const name = cellStr(row[col]);
      if (!name) continue;
      const { school, graduation } = parseSchoolGrad(cellStr(row2[col]));
      inPlayers.push({ name, school, graduation, birthDate: cellStr(row3[col]) });
    }

    groups.push({
      groupNumber,
      out: { time: formatTime(timeOut), caddy: String(row[1] || "").includes("キャ"), players: outPlayers },
      in:  { time: formatTime(timeIn),  caddy: String(row[8] || "").includes("キャ"), players: inPlayers },
    });

    i += 3;
  }
  return groups;
}

function schoolColor(school: string) {
  if (school === "一高") return "bg-red-100 text-red-800";
  if (school === "二高") return "bg-blue-100 text-blue-800";
  if (school === "三高") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
}

function PlayerCell({ player }: { player: Player | undefined }) {
  if (!player) return <td className="border border-gray-300 p-2 bg-gray-50" />;
  return (
    <td className="border border-gray-300 p-2 align-top min-w-[90px]">
      <div className="font-bold text-sm">{player.name}</div>
      {player.school && (
        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold mt-0.5 ${schoolColor(player.school)}`}>
          {player.school}
        </span>
      )}
      {player.graduation && (
        <span className="text-xs text-gray-500 ml-1">{player.graduation}</span>
      )}
    </td>
  );
}

export default function PairingsPreviewPage() {
  const raw = readFileSync("C:/Users/arch-/kumiwase.json", "utf-8");
  const data = JSON.parse(raw) as unknown[][];
  const groups = parseGroups(data);

  // OUT・IN それぞれの最大選手数
  const maxOut = Math.max(...groups.map((g) => g.out.players.length), 0);
  const maxIn  = Math.max(...groups.map((g) => g.in.players.length),  0);

  return (
    <div className="max-w-full px-4 py-8">
      <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6 text-sm text-yellow-800 max-w-3xl mx-auto">
        ※ これはサンプルデータ（2025年版）のプレビューです。実際の組合せ表は管理画面からアップロードしてください。
      </div>

      <h1 className="text-xl font-bold text-center mb-1">
        一高・二高ゴルフ対抗戦　組合せ表
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        2025年5月18日（日）富谷カントリークラブ
      </p>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm mx-auto">
          <thead>
            {/* OUTとINのラベル行 */}
            <tr>
              <th
                colSpan={2 + maxOut}
                className="border border-gray-300 bg-[var(--primary)] text-white px-4 py-2 text-center text-base font-bold"
              >
                ＯＵＴ
              </th>
              <th className="w-3 border-0" />
              <th
                colSpan={2 + maxIn}
                className="border border-gray-300 bg-[var(--primary)] text-white px-4 py-2 text-center text-base font-bold"
              >
                ＩＮ
              </th>
            </tr>
            {/* 列ヘッダー */}
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 whitespace-nowrap">時間</th>
              <th className="border border-gray-300 p-2 whitespace-nowrap">キャ</th>
              {Array.from({ length: maxOut }).map((_, i) => (
                <th key={i} className="border border-gray-300 p-2 min-w-[90px]">選手{i + 1}</th>
              ))}
              <th className="w-3 border-0" />
              <th className="border border-gray-300 p-2 whitespace-nowrap">時間</th>
              <th className="border border-gray-300 p-2 whitespace-nowrap">キャ</th>
              {Array.from({ length: maxIn }).map((_, i) => (
                <th key={i} className="border border-gray-300 p-2 min-w-[90px]">選手{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.groupNumber} className="hover:bg-amber-50">
                {/* OUT */}
                <td className="border border-gray-300 p-2 whitespace-nowrap font-mono text-center">
                  {g.out.time}
                </td>
                <td className="border border-gray-300 p-2 text-center text-xs text-green-700 font-bold">
                  {g.out.caddy ? "キャ付" : ""}
                </td>
                {Array.from({ length: maxOut }).map((_, i) => (
                  <PlayerCell key={i} player={g.out.players[i]} />
                ))}
                {/* 区切り */}
                <td className="w-3" />
                {/* IN */}
                <td className="border border-gray-300 p-2 whitespace-nowrap font-mono text-center">
                  {g.in.time}
                </td>
                <td className="border border-gray-300 p-2 text-center text-xs text-green-700 font-bold">
                  {g.in.caddy ? "キャ付" : ""}
                </td>
                {Array.from({ length: maxIn }).map((_, i) => (
                  <PlayerCell key={i} player={g.in.players[i]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8">
        <Link href="/pairings" className="text-blue-600 hover:underline text-sm">
          ← 実際の組合せ表ページへ
        </Link>
      </div>
    </div>
  );
}
