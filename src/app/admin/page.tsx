"use client";

import { useState, useEffect, useCallback } from "react";
import { type TournamentInfo, defaultInfo } from "@/lib/tournament";

type Entry = {
  id: string;
  school: string;
  participation: string;
  caddy_preference: string | null;
  name: string;
  graduation_number: string;
  address: string;
  birth_date: string;
  phone: string;
  requests: string;
  prize_donation: string;
  created_at: string;
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pairingsPublished, setPairingsPublished] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [info, setInfo] = useState<TournamentInfo>(defaultInfo);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/entries");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    } else if (res.status === 401) {
      setLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      if (data.info) setInfo(data.info);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchEntries();
      fetchPairingsStatus();
      fetchSettings();
    }
  }, [loggedIn, fetchEntries, fetchSettings]);

  const handleLogin = async () => {
    setLoginError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setLoggedIn(true);
    } else {
      setLoginError("パスワードが正しくありません。");
    }
  };

  const downloadCSV = () => {
    window.location.href = "/api/admin/entries?format=csv";
  };

  const fetchPairingsStatus = async () => {
    const res = await fetch("/api/pairings");
    if (res.ok) {
      const data = await res.json();
      setPairingsPublished(data.published);
    }
  };

  const togglePairingsPublished = async () => {
    const newValue = !pairingsPublished;
    await fetch("/api/admin/pairings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: newValue }),
    });
    setPairingsPublished(newValue);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadMsg("");
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/pairings", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setUploadMsg(`${data.count}件のデータをアップロードしました。`);
    } else {
      setUploadMsg(`エラー: ${data.error}`);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    if (res.ok) {
      setSettingsMsg("保存しました。");
    } else {
      setSettingsMsg("エラー: 保存に失敗しました。");
    }
    setSavingSettings(false);
  };

  const setContact = (key: "contact_ikko" | "contact_niko" | "contact_sanko", field: string, value: string) => {
    setInfo((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-xl font-bold text-center mb-6">管理者ログイン</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="パスワード"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold hover:bg-[var(--primary-light)]"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-bold">管理画面</h1>

      {/* ── 大会情報編集 ── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">大会情報の編集</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          <Field label="年度" value={info.year} onChange={(v) => setInfo({ ...info, year: v })} placeholder="2026" />
          <Field label="開催日" value={info.event_date} onChange={(v) => setInfo({ ...info, event_date: v })} placeholder="5月31日（日）" />
          <Field label="スタート時間" value={info.start_time} onChange={(v) => setInfo({ ...info, start_time: v })} placeholder="午前8時スタート" />
          <Field label="コース名称（同時スタート）" value={info.courses} onChange={(v) => setInfo({ ...info, courses: v })} placeholder="いずみ・山里・みやま" />

          <div className="md:col-span-2">
            <Field label="会場名" value={info.venue_name} onChange={(v) => setInfo({ ...info, venue_name: v })} placeholder="東蔵王ゴルフ倶楽部" />
          </div>
          <Field label="会場住所" value={info.venue_address} onChange={(v) => setInfo({ ...info, venue_address: v })} placeholder="〒989-1503 宮城県..." />
          <Field label="会場電話" value={info.venue_phone} onChange={(v) => setInfo({ ...info, venue_phone: v })} placeholder="0224-84-2350" />

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <p className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wide">費用</p>
          </div>
          <Field label="参加費" value={info.fee_participation} onChange={(v) => setInfo({ ...info, fee_participation: v })} placeholder="3,000円（当日会場にて）" />
          <Field label="プレー代（セルフ）" value={info.fee_visitor_self} onChange={(v) => setInfo({ ...info, fee_visitor_self: v })} placeholder="16,000円（プレー費・セルフ・昼食別）" />
          <div className="md:col-span-2">
            <Field label="プレー代（キャディー付）" value={info.fee_visitor_caddy} onChange={(v) => setInfo({ ...info, fee_visitor_caddy: v })} placeholder="18,600円（プレー費・キャディー付・昼食別）" />
          </div>

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <p className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wide">申込・その他</p>
          </div>
          <Field label="申込締切" value={info.entry_deadline} onChange={(v) => setInfo({ ...info, entry_deadline: v })} placeholder="5月13日（火）必着" />
          <Field label="先着人数" value={info.entry_limit} onChange={(v) => setInfo({ ...info, entry_limit: v })} placeholder="40" />
          <Field label="組合せ送付予定日" value={info.pairings_send_date} onChange={(v) => setInfo({ ...info, pairings_send_date: v })} placeholder="5月21日（木）" />
          <div className="md:col-span-2">
            <Field label="表彰式場所" value={info.award_venue} onChange={(v) => setInfo({ ...info, award_venue: v })} placeholder="プレー終了後2階のコンペルームで開催" />
          </div>

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <p className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wide">問合せ窓口</p>
          </div>

          {(["contact_ikko", "contact_niko", "contact_sanko"] as const).map((key, idx) => {
            const labels = ["一高", "二高", "三高"];
            const c = info[key];
            return (
              <div key={key} className="md:col-span-2 border rounded p-3 space-y-2">
                <p className="font-bold text-sm">{labels[idx]}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Field label="回生" value={c.gen} onChange={(v) => setContact(key, "gen", v)} placeholder="41回" />
                  <Field label="氏名" value={c.name} onChange={(v) => setContact(key, "name", v)} placeholder="伊藤 宏明" />
                  <Field label="メールアドレス" value={c.email} onChange={(v) => setContact(key, "email", v)} placeholder="example@mail.com" />
                  <Field label="電話番号" value={c.phone} onChange={(v) => setContact(key, "phone", v)} placeholder="090-0000-0000" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-bold hover:bg-[var(--primary-light)] disabled:opacity-50"
          >
            {savingSettings ? "保存中..." : "保存する"}
          </button>
          {settingsMsg && (
            <p className={`text-sm ${settingsMsg.startsWith("エラー") ? "text-red-600" : "text-green-600"}`}>
              {settingsMsg}
            </p>
          )}
        </div>
      </section>

      {/* ── 申込一覧 ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">参加申込一覧（{entries.length}件）</h2>
          <div className="flex gap-2">
            <button onClick={fetchEntries} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              更新
            </button>
            <button onClick={downloadCSV} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              CSVダウンロード
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">読込中...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">学校</th>
                  <th className="border p-2 text-left">参加</th>
                  <th className="border p-2 text-left">スタイル</th>
                  <th className="border p-2 text-left">氏名</th>
                  <th className="border p-2 text-left">回生</th>
                  <th className="border p-2 text-left">住所</th>
                  <th className="border p-2 text-left">生年月日</th>
                  <th className="border p-2 text-left">電話</th>
                  <th className="border p-2 text-left">希望</th>
                  <th className="border p-2 text-left">協賛</th>
                  <th className="border p-2 text-left">申込日</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="border p-2">{e.school}</td>
                    <td className="border p-2">{e.participation}</td>
                    <td className="border p-2">{e.caddy_preference || "-"}</td>
                    <td className="border p-2 font-bold">{e.name}</td>
                    <td className="border p-2">{e.graduation_number}</td>
                    <td className="border p-2 max-w-32 truncate">{e.address}</td>
                    <td className="border p-2">{e.birth_date}</td>
                    <td className="border p-2">{e.phone}</td>
                    <td className="border p-2 max-w-32 truncate">{e.requests}</td>
                    <td className="border p-2">{e.prize_donation}</td>
                    <td className="border p-2 whitespace-nowrap">
                      {e.created_at ? new Date(e.created_at).toLocaleDateString("ja-JP") : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 組合せ表管理 ── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">組合せ表管理</h2>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-bold">公開状態：</span>
          <button
            onClick={togglePairingsPublished}
            className={`px-4 py-2 rounded text-sm font-bold ${
              pairingsPublished
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {pairingsPublished ? "公開中" : "非公開"}
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-1">組合せファイルをアップロード（xlsx / csv）</label>
            <p className="text-xs text-gray-500 mb-2">
              Excelファイル（.xlsx）またはCSVファイルをアップロードしてください。
            </p>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-gray-600">シート名（省略時は先頭シート）：</label>
              <input
                type="text"
                name="sheet"
                placeholder="例: 2025"
                className="border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls,.csv"
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-light)]"
          >
            アップロード
          </button>
          {uploadMsg && <p className="text-sm text-blue-700">{uploadMsg}</p>}
        </form>
      </section>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
    </div>
  );
}
