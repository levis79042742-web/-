-- 這週紅什麼 Trend7 — Supabase (PostgreSQL) 資料庫結構

create table if not exists public.trend_items (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  platform text not null check (platform in ('instagram', 'facebook', 'youtube', 'tiktok', 'xiaohongshu', 'threads')),
  category text not null,
  region text not null default 'TW',
  time_range text not null default '7d' check (time_range in ('24h', '3d', '7d', '30d')),
  rank_position integer not null,
  rank_delta integer not null default 0,
  title text not null,
  summary text,
  creator_name text not null,
  creator_handle text,
  published_at timestamptz not null,
  thumbnail_url text,
  views bigint,        -- NULL 代表「暫無資料」，禁止捏造
  likes bigint,        -- NULL 代表「暫無資料」
  comments bigint,     -- NULL 代表「暫無資料」
  shares bigint,       -- NULL 代表「暫無資料」
  growth_rate numeric(8,2),
  viral_index integer not null check (viral_index between 0 and 100),
  keywords text[] not null default '{}',
  hashtags text[] not null default '{}',
  original_url text not null,
  data_source_type text not null check (data_source_type in ('official_api', 'live_search', 'demo')),
  source_label text not null,
  last_updated_at timestamptz not null default now(),
  unique (platform, region, time_range, external_id)
);

create index if not exists idx_trend_items_ranking
  on public.trend_items (region, time_range, platform, rank_position);

create table if not exists public.trend_snapshots (
  id bigint generated always as identity primary key,
  trend_id uuid references public.trend_items(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  viral_index integer not null,
  views bigint,
  likes bigint
);

create table if not exists public.user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_type text not null check (item_type in ('trend', 'keyword', 'ai_content')),
  trend_id uuid references public.trend_items(id) on delete set null,
  keyword text,
  ai_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key,
  daily_hot_enabled boolean not null default true,
  weekly_ranking_enabled boolean not null default true,
  keyword_alert_enabled boolean not null default false,
  alert_keywords text[] not null default '{}',
  custom_time text not null default '09:00',
  region text not null default 'TW',
  updated_at timestamptz not null default now()
);

-- 啟用 Row Level Security (RLS)
alter table public.trend_items enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Allow public read trend_items"
  on public.trend_items for select using (true);

create policy "Users manage own bookmarks"
  on public.user_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own notification prefs"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
