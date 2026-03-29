import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "一高・二高・三高同窓会ゴルフ対抗戦",
  description: "2026年 一高・二高・三高同窓会ゴルフ対抗戦の案内・参加申込サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="bg-[var(--primary)] text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <Link href="/" className="text-sm sm:text-lg font-bold hover:opacity-90 leading-tight shrink-0">
              <span className="hidden sm:inline">一高・二高・三高 ゴルフ対抗戦</span>
              <span className="sm:hidden">一高・二高・三高</span>
            </Link>
            <nav className="flex gap-3 sm:gap-4 text-sm shrink-0">
              <Link href="/" className="hover:underline whitespace-nowrap">案内</Link>
              <Link href="/entry" className="hover:underline whitespace-nowrap">申込</Link>
              <Link href="/pairings" className="hover:underline whitespace-nowrap">組合せ</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-100 text-center text-xs text-gray-500 py-4 mt-8">
          <p>2026 一高・二高・三高同窓会ゴルフ対抗戦</p>
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 mt-1 inline-block">
            管理者
          </Link>
        </footer>
      </body>
    </html>
  );
}
