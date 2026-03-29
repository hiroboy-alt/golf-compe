"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Pairing = {
  id: string;
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

export default function PairingsPage() {
  const [published, setPublished] = useState(false);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pairings")
      .then((res) => res.json())
      .then((data) => {
        setPublished(data.published);
        setPairings(data.pairings || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        読込中...
      </div>
    );
  }

  if (!published || pairings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-4">組合せ表</h1>
        <p className="text-gray-600 mb-6">
          組合せ表はまだ公開されていません。5月21日頃の公開を予定しています。
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  // コース別にグループ化
  const byCourse = pairings.reduce<Record<string, Pairing[]>>((acc, p) => {
    const course = p.start_course || "未定";
    if (!acc[course]) acc[course] = [];
    acc[course].push(p);
    return acc;
  }, {});

  const courseOrder = ["いずみ", "山里", "みやま"];
  const sortedCourses = Object.keys(byCourse).sort(
    (a, b) => (courseOrder.indexOf(a) === -1 ? 99 : courseOrder.indexOf(a)) -
              (courseOrder.indexOf(b) === -1 ? 99 : courseOrder.indexOf(b))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-center mb-2">
        一高・二高・三高同窓会ゴルフ対抗戦　組合せ表
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        5月31日（日）東蔵王ゴルフ倶楽部
      </p>

      {sortedCourses.map((course) => {
        const coursePairings = byCourse[course];
        // 組番号でグループ化
        const byGroup = coursePairings.reduce<Record<number, Pairing[]>>((acc, p) => {
          if (!acc[p.group_number]) acc[p.group_number] = [];
          acc[p.group_number].push(p);
          return acc;
        }, {});
        const groups = Object.keys(byGroup)
          .map(Number)
          .sort((a, b) => a - b);

        return (
          <div key={course} className="mb-8">
            <h2 className="text-lg font-bold mb-3 bg-[var(--primary)] text-white px-4 py-2 rounded">
              {course}コース
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">組</th>
                  <th className="border p-2 text-left w-20">時間</th>
                  <th className="border p-2 text-left">選手名</th>
                  <th className="border p-2 text-left w-16">学校</th>
                  <th className="border p-2 text-left w-14">回生</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((groupNum) => {
                  const players = byGroup[groupNum].sort(
                    (a, b) => a.order_in_group - b.order_in_group
                  );
                  const hasCaddy = players[0]?.caddy_flag;
                  return players.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={idx === 0 ? "border-t-2 border-gray-300" : ""}
                    >
                      <td className="border p-2">
                        {idx === 0 && (
                          <span>
                            {groupNum}組
                            {hasCaddy && (
                              <span className="ml-1 text-xs text-green-700 font-normal">キャ付</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="border p-2">
                        {idx === 0 ? p.start_time : ""}
                      </td>
                      <td className="border p-2 font-bold">{p.player_name}</td>
                      <td className="border p-2">
                        {p.school && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              p.school === "一高"
                                ? "bg-red-100 text-red-800"
                                : p.school === "二高"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {p.school}
                          </span>
                        )}
                      </td>
                      <td className="border p-2 text-xs text-gray-600">{p.graduation}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
