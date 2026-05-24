"use client";

import { useState } from "react";
import Link from "next/link";

type Companion = {
  name: string;
  graduation_number: string;
  birth_date: string;
};

type FormData = {
  school: string;
  participation: string;
  caddy_preference: string;
  name: string;
  graduation_number: string;
  address: string;
  birth_date: string;
  phone: string;
  requests: string;
  prize_donation: string;
};

const initialForm: FormData = {
  school: "",
  participation: "",
  caddy_preference: "",
  name: "",
  graduation_number: "",
  address: "",
  birth_date: "1970-01-01",
  phone: "",
  requests: "",
  prize_donation: "",
};

const emptyCompanion = (): Companion => ({ name: "", graduation_number: "", birth_date: "1970-01-01" });

const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

export default function EntryPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const DEADLINE = new Date("2026-05-13T23:59:59+09:00");
  const isPastDeadline = new Date() > DEADLINE;

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateCompanion = (idx: number, field: keyof Companion, value: string) =>
    setCompanions((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  const addCompanion = () => {
    if (companions.length < 3) setCompanions((prev) => [...prev, emptyCompanion()]);
  };

  const removeCompanion = (idx: number) =>
    setCompanions((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): string | null => {
    if (!form.school) return "学校を選択してください。";
    if (!form.participation) return "参加/不参加を選択してください。";
    if (form.participation === "参加" && !form.caddy_preference)
      return "キャディー付/セルフを選択してください。";
    if (!form.name.trim()) return "氏名を入力してください。";
    if (!form.phone.trim()) return "電話番号を入力してください。";
    for (let i = 0; i < companions.length; i++) {
      if (!companions[i].name.trim()) return `同伴者${i + 1}の氏名を入力してください。`;
    }
    return null;
  };

  const handleConfirm = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, companions }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました。");
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信エラー");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPastDeadline) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">参加申込は締め切りました</h1>
        <p className="text-gray-600 mb-6">申込締切日（5月13日）を過ぎたため、受付を終了しました。</p>
        <Link href="/" className="text-blue-600 hover:underline">トップページに戻る</Link>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-[var(--primary)] mb-4">申込を受け付けました</h1>
          <p className="text-gray-700 mb-6">
            ご参加ありがとうございます。組合せ表は5月21日頃に本サイトで公開予定です。
          </p>
          <Link href="/" className="text-blue-600 hover:underline">トップページに戻る</Link>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-center mb-6">申込内容の確認</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-4 space-y-3 text-sm">
          <ConfirmRow label="学校" value={form.school} />
          <ConfirmRow label="参加/不参加" value={form.participation} />
          {form.participation === "参加" && (
            <ConfirmRow label="プレースタイル" value={form.caddy_preference} />
          )}
          <ConfirmRow label="氏名" value={form.name} />
          <ConfirmRow label="回生" value={form.graduation_number ? `${form.graduation_number}回` : "—"} />
          <ConfirmRow label="住所" value={form.address || "—"} />
          <ConfirmRow label="生年月日" value={form.birth_date || "—"} />
          <ConfirmRow label="電話番号" value={form.phone} />
          <ConfirmRow label="希望事項" value={form.requests || "（なし）"} />
          <ConfirmRow label="賞品寄贈" value={form.prize_donation || "（なし）"} />
        </div>

        {companions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-4 space-y-4 text-sm">
            <p className="font-bold">同伴者</p>
            {companions.map((c, i) => (
              <div key={i} className="border-l-4 border-[var(--primary)] pl-3 space-y-1">
                <p className="font-bold text-xs text-gray-500">同伴者 {i + 1}</p>
                <ConfirmRow label="氏名" value={c.name} />
                <ConfirmRow label="回生" value={c.graduation_number ? `${c.graduation_number}回` : "—"} />
                <ConfirmRow label="生年月日" value={c.birth_date || "—"} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setStep("input")}
            className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-50"
          >
            修正する
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-bold hover:bg-[var(--primary-light)] disabled:opacity-50"
          >
            {submitting ? "送信中..." : "送信する"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-center mb-2">
        一高・二高・三高同窓会ゴルフ対抗戦（5月31日）参加申込
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">申込締切：5月13日（火）</p>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 学校選択 */}
        <fieldset>
          <legend className="font-bold text-sm mb-2">学校 <span className="text-red-500">*</span></legend>
          <div className="flex gap-4">
            {["一高", "二高", "三高"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="school"
                  value={s}
                  checked={form.school === s}
                  onChange={(e) => update("school", e.target.value)}
                  className="accent-[var(--primary)]"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 参加/不参加 */}
        <fieldset>
          <legend className="font-bold text-sm mb-2">ゴルフに <span className="text-red-500">*</span></legend>
          <div className="flex gap-6">
            {["参加", "不参加"].map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="participation"
                  value={v}
                  checked={form.participation === v}
                  onChange={(e) => update("participation", e.target.value)}
                  className="accent-[var(--primary)]"
                />
                {v}
              </label>
            ))}
          </div>
        </fieldset>

        {/* キャディー/セルフ */}
        {form.participation === "参加" && (
          <fieldset>
            <legend className="font-bold text-sm mb-1">プレースタイル <span className="text-red-500">*</span></legend>
            <p className="text-xs text-gray-500 mb-2">※ご希望に添えない場合があります</p>
            <div className="flex gap-6">
              {["キャディー付希望", "セルフ希望"].map((v) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="caddy_preference"
                    value={v}
                    checked={form.caddy_preference === v}
                    onChange={(e) => update("caddy_preference", e.target.value)}
                    className="accent-[var(--primary)]"
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* 氏名 */}
        <div>
          <label className="block font-bold text-sm mb-1">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
            placeholder="例：山田 太郎"
          />
        </div>

        {/* 回生 */}
        <div>
          <label className="block font-bold text-sm mb-1">回生</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.graduation_number}
              onChange={(e) => update("graduation_number", e.target.value)}
              className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="41"
            />
            <span className="text-sm">回</span>
          </div>
        </div>

        {/* 住所 */}
        <div>
          <label className="block font-bold text-sm mb-1">住所</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputCls}
            placeholder="例：仙台市青葉区..."
          />
        </div>

        {/* 生年月日 */}
        <div>
          <label className="block font-bold text-sm mb-1">生年月日（西暦）</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => update("birth_date", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block font-bold text-sm mb-1">
            電話番号（当日連絡可能な番号） <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls}
            placeholder="例：090-1234-5678"
          />
        </div>

        {/* 同伴者 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-bold text-sm">同伴者</label>
            {companions.length < 3 && (
              <button
                type="button"
                onClick={addCompanion}
                className="px-3 py-1 text-sm border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                ＋ 同伴者を追加
              </button>
            )}
          </div>

          {companions.length === 0 && (
            <p className="text-xs text-gray-400">同伴希望者がいる場合は追加してください（最大3名）</p>
          )}

          <div className="space-y-4">
            {companions.map((c, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-[var(--primary)]">同伴者 {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCompanion(i)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    削除
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">氏名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCompanion(i, "name", e.target.value)}
                      className={inputCls}
                      placeholder="例：鈴木 花子"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">回生</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.graduation_number}
                        onChange={(e) => updateCompanion(i, "graduation_number", e.target.value)}
                        className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="41"
                      />
                      <span className="text-sm">回</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">生年月日（西暦）</label>
                    <input
                      type="date"
                      value={c.birth_date}
                      onChange={(e) => updateCompanion(i, "birth_date", e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 希望事項 */}
        <div>
          <label className="block font-bold text-sm mb-1">ご希望事項</label>
          <textarea
            value={form.requests}
            onChange={(e) => update("requests", e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="組合せ希望など"
          />
        </div>

        {/* 商品のご協賛 */}
        <div>
          <label className="block font-bold text-sm mb-1">商品のご協賛</label>
          <input
            type="text"
            value={form.prize_donation}
            onChange={(e) => update("prize_donation", e.target.value)}
            className={inputCls}
            placeholder="ご協賛品の内容をお知らせください"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleConfirm}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-bold hover:bg-[var(--primary-light)] transition-colors"
        >
          確認画面へ
        </button>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-gray-100 pb-2">
      <span className="w-28 font-bold text-gray-600 shrink-0 text-xs">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
