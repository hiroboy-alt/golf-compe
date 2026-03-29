import Link from "next/link";
import { getTournamentInfo } from "@/lib/tournament";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const info = await getTournamentInfo();

  return (
    <div>
      {/* ヒーローバナー */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "340px" }}
      >
        {/* コース写真 */}
        <img
          src="/golf-course.jpg"
          alt="ゴルフコース"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* 暗めのオーバーレイ */}
        <div className="absolute inset-0 bg-black/45" />
        {/* テキスト */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-sm tracking-widest mb-2 opacity-80">
            {info.year}年 {info.event_date}　{info.venue_name}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow mb-4">
            一高・二高・三高<br />同窓会ゴルフ対抗戦
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/entry"
              className="bg-[var(--primary)] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[var(--primary-light)] transition-colors shadow"
            >
              参加申込はこちら
            </a>
            <a
              href="/pairings"
              className="border-2 border-white text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
            >
              組合せ表を見る
            </a>
          </div>
        </div>
      </div>

    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* タイトル */}
      <h1 className="text-2xl font-bold text-center mb-2">
        {info.year}年 一高・二高・三高同窓会ゴルフ対抗戦のご案内
      </h1>
      <p className="text-right text-sm text-gray-600 mb-4">令和{Number(info.year) - 2018}年3月吉日</p>

      {/* 宛先・差出人 */}
      <p className="mb-1">同窓会会員各位</p>
      <div className="text-right mb-6">
        <p>一高・二高・三高同窓会ゴルフ対抗戦実行委員会</p>
      </div>

      {/* 挨拶文 */}
      <div className="mb-6 leading-relaxed text-sm">
        <p className="mb-2">
          拝啓　同窓会会員の皆様には益々ご健勝にてご活躍のこととお慶び申し上げます。
        </p>
        <p className="mb-2">
          標記の一高・二高・三高同窓会ゴルフ対抗戦を下記要領にて実施いたします。
        </p>
        <p className="mb-2">
          新緑の候、多数のご参加を頂き、盛大な大会となることを期待しております。
        </p>
        <p className="text-right">敬具</p>
      </div>

      <p className="text-center font-bold text-lg mb-6">記</p>

      {/* 大会詳細 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4 text-sm">
        <InfoRow
          label="1. 開催日時"
          value={`${info.event_date}${info.start_time}`}
          sub={`${info.courses} 同時スタート`}
        />
        <InfoRow
          label="2. 開催コース"
          value={info.venue_name}
          sub={`${info.venue_address}　TEL ${info.venue_phone}`}
        />
        <InfoRow label="3. 会費" value={info.fee_participation} />
        <div>
          <span className="font-bold">4. プレー代</span>
          <div className="ml-4 mt-1 space-y-1">
            <p>ビジター　{info.fee_visitor_self}</p>
            <p className="ml-8">{info.fee_visitor_caddy}</p>
            <p>メンバー　通常料金</p>
          </div>
        </div>
        <InfoRow
          label="5. 申込締切"
          value={info.entry_deadline}
          sub={`先着${info.entry_limit}名締切です。お早めにお申込ください。キャディー付希望かセルフ希望かを必ず明記してください。`}
        />
        <InfoRow label="6. 表彰式" value={info.award_venue} />
      </div>

      {/* 競技方法 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-sm space-y-3">
        <h2 className="font-bold text-base mb-2">競技方法</h2>
        <p>18ホールズストロークプレー、細則は事前に送付する組合せ表に記載。</p>
        <div className="ml-4 space-y-1">
          <p><span className="font-bold">団体戦：</span>各校グロス上位15名の合計で決定</p>
          <p><span className="font-bold">個人戦：</span>ダブルペリア方式でのHD戦（トリプル・36打切り・同ネット年長者上位）</p>
        </div>
      </div>

      {/* 組合せ・その他 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-sm space-y-4">
        <div>
          <p>
            <span className="font-bold">※スタート時間</span>　{info.pairings_send_date}までに組合せ表を送付予定
          </p>
          <p className="ml-8 text-gray-700">（各自スタートの30分前までに受付を）</p>
        </div>
        <div>
          <p className="font-bold">※組合せ</p>
          <div className="ml-8 mt-1 space-y-1 text-gray-700">
            <p>同一高校での組合せ。</p>
            <p>同伴希望者名がある場合は、その方のお名前も記載ください。</p>
            <p>※他校との組合せご希望の場合も、その方のお名前を記載ください。</p>
          </div>
        </div>
        <div>
          <p className="font-bold">※賞品のご寄贈をお願い致します。</p>
          <p className="ml-8 mt-1 text-gray-700">
            ご寄贈頂いた品を順位賞に組み入れたく、参加申込時に商品名を記載ください。
          </p>
        </div>
      </div>

      {/* 問合せ窓口 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 text-sm">
        <h2 className="font-bold text-base mb-3">問合せ窓口</h2>
        <div className="space-y-3 text-xs">
          <ContactRow school="一高" gen={info.contact_ikko.gen} name={info.contact_ikko.name} email={info.contact_ikko.email} phone={info.contact_ikko.phone} />
          <ContactRow school="二高" gen={info.contact_niko.gen} name={info.contact_niko.name} email={info.contact_niko.email} phone={info.contact_niko.phone} />
          <ContactRow school="三高" gen={info.contact_sanko.gen} name={info.contact_sanko.name} email={info.contact_sanko.email} phone={info.contact_sanko.phone} />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/entry"
          className="bg-[var(--primary)] text-white px-8 py-3 rounded-lg text-center font-bold hover:bg-[var(--primary-light)] transition-colors"
        >
          参加申込はこちら
        </Link>
        <Link
          href="/pairings"
          className="border-2 border-[var(--primary)] text-[var(--primary)] px-8 py-3 rounded-lg text-center font-bold hover:bg-red-50 transition-colors"
        >
          組合せ表を見る
        </Link>
      </div>
    </div>
    </div>
  );
}

function InfoRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <span className="font-bold">{label}</span>
      <span className="ml-4">{value}</span>
      {sub && <p className="ml-8 text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function ContactRow({ school, gen, name, email, phone }: {
  school: string; gen: string; name: string; email: string; phone: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-100 pb-2">
      <span className="font-bold text-[var(--primary)] w-6">{school}</span>
      <span className="text-gray-500">{gen}</span>
      <span className="font-bold w-24">{name}</span>
      <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
      <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
    </div>
  );
}
