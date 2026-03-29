import { supabase, supabaseConfigured } from "./supabase";

export type Contact = {
  gen: string;
  name: string;
  email: string;
  phone: string;
};

export type TournamentInfo = {
  year: string;
  event_date: string;
  start_time: string;
  venue_name: string;
  venue_address: string;
  venue_phone: string;
  courses: string;
  fee_participation: string;
  fee_visitor_self: string;
  fee_visitor_caddy: string;
  entry_deadline: string;
  entry_limit: string;
  pairings_send_date: string;
  award_venue: string;
  contact_ikko: Contact;
  contact_niko: Contact;
  contact_sanko: Contact;
};

export const defaultInfo: TournamentInfo = {
  year: "2026",
  event_date: "5月31日（日）",
  start_time: "午前8時スタート",
  venue_name: "東蔵王ゴルフ倶楽部",
  venue_address: "〒989-1503 宮城県柴田郡川崎町川内西山8",
  venue_phone: "0224-84-2350",
  courses: "いずみ・山里・みやま",
  fee_participation: "3,000円（当日会場にて申し受けます）",
  fee_visitor_self: "16,000円（プレー費・セルフ・昼食別）",
  fee_visitor_caddy: "18,600円（プレー費・キャディー付・昼食別）",
  entry_deadline: "5月13日（火）必着",
  entry_limit: "40",
  pairings_send_date: "5月21日（木）",
  award_venue: "プレー終了後2階のコンペルームで開催",
  contact_ikko: { gen: "41回", name: "伊藤 宏明", email: "arch-ito@katura-arc.com", phone: "090-6627-5755" },
  contact_niko: { gen: "46回", name: "大森 一美", email: "hokuryogolf@gmail.com", phone: "080-9158-1559" },
  contact_sanko: { gen: "32回", name: "尾形 雄一郎", email: "yuichiro.ogata@gmail.com", phone: "090-7076-8555" },
};

export async function getTournamentInfo(): Promise<TournamentInfo> {
  if (!supabaseConfigured) return defaultInfo;
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "tournament_info")
      .single();

    if (error || !data) return defaultInfo;
    const parsed = JSON.parse(data.value) as TournamentInfo;
    // デフォルト値でフォールバック
    return { ...defaultInfo, ...parsed };
  } catch {
    return defaultInfo;
  }
}
