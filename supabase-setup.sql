-- Supabaseのダッシュボード > SQL Editor で実行してください

-- 参加申込テーブル
create table if not exists entries (
  id uuid default gen_random_uuid() primary key,
  school text not null,
  participation text not null,
  caddy_preference text,
  name text not null,
  graduation_number text,
  address text,
  birth_date text,
  phone text not null,
  requests text,
  prize_donation text,
  companions text,
  created_at timestamptz default now()
);

-- 組合せ表テーブル
create table if not exists pairings (
  id uuid default gen_random_uuid() primary key,
  group_number int,
  start_course text,
  start_time text,
  player_name text,
  school text,
  graduation text,
  birth_date text,
  caddy_flag boolean default false,
  order_in_group int
);

-- 既存テーブルへのカラム追加（既にテーブルが存在する場合）
alter table pairings add column if not exists graduation text;
alter table pairings add column if not exists birth_date text;
alter table pairings add column if not exists caddy_flag boolean default false;

-- 設定テーブル
create table if not exists settings (
  key text primary key,
  value text not null
);

-- 初期設定
insert into settings (key, value) values ('pairings_published', 'false')
on conflict (key) do nothing;

-- RLS（Row Level Security）を有効化
alter table entries enable row level security;
alter table pairings enable row level security;
alter table settings enable row level security;

-- anon ユーザーは entries への INSERT のみ許可
create policy "Allow anonymous insert" on entries
  for insert to anon
  with check (true);

-- anon ユーザーは pairings の SELECT のみ許可
create policy "Allow anonymous select pairings" on pairings
  for select to anon
  using (true);

-- anon ユーザーは settings の SELECT のみ許可
create policy "Allow anonymous select settings" on settings
  for select to anon
  using (true);

-- service_role（サーバー側）は全テーブルにフルアクセス
-- （Supabaseのservice_roleキーを使うAPIで管理操作を行う）
