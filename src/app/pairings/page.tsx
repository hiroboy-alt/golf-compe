"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PairingsPage() {
  const [published, setPublished] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pairings")
      .then((res) => res.json())
      .then((data) => {
        setPublished(data.published);
        setPdfUrl(data.pdfUrl || null);
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

  if (!published || !pdfUrl) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-center mb-2">
        一高・二高・三高同窓会ゴルフ対抗戦　組合せ表
      </h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        5月31日（日）東蔵王ゴルフ倶楽部
      </p>
      <div className="text-right mb-4">
        <a
          href={pdfUrl}
          download
          className="text-sm text-blue-600 hover:underline"
        >
          PDFをダウンロード
        </a>
      </div>
      <iframe
        src={pdfUrl}
        className="w-full border rounded"
        style={{ height: "80vh" }}
        title="組合せ表"
      />
    </div>
  );
}
