-- オンライン対戦用スキーマ（罵倒デッキ構築カードゲーム）
-- 設計方針:
--  * ゲーム状態(game_state)の正はmatchesテーブル。書き込みはEdge Function（service_role）のみ。
--  * クライアントはRLSにより matches への INSERT/UPDATE が一切できない（チート対策）。
--  * usersはauth.users(匿名認証)を利用し、公開情報のみprofilesに持つ。
--  * カードマスタは静的データ（フロントに同梱）のためテーブル化しない。
--  * ログはmatch_actionsが操作の監査ログを兼ねる。

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'ゲスト' check (char_length(display_name) <= 20),
  character_id text not null default 'rion',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- ============ rooms ============
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique check (char_length(invite_code) = 6),
  host_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
create policy "rooms_select_all" on public.rooms for select using (true);
create policy "rooms_insert_as_host" on public.rooms for insert with check (auth.uid() = host_id);
create policy "rooms_update_host_only" on public.rooms for update using (auth.uid() = host_id);

-- ============ room_players ============
create table public.room_players (
  room_id uuid not null references public.rooms (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  seat int not null check (seat in (1, 2)),
  character_id text not null,
  connected boolean not null default true,
  last_seen timestamptz not null default now(),
  primary key (room_id, player_id),
  unique (room_id, seat) -- seat2の重複INSERTが「満員」エラー(23505)になる
);

alter table public.room_players enable row level security;
create policy "room_players_select_all" on public.room_players for select using (true);
create policy "room_players_insert_self" on public.room_players for insert with check (auth.uid() = player_id);
create policy "room_players_update_self" on public.room_players for update using (auth.uid() = player_id);
create policy "room_players_delete_self" on public.room_players for delete using (auth.uid() = player_id);

-- ============ matches ============
-- INSERT/UPDATEのRLSポリシーを一切作らない = クライアント(anon/authenticated)は書き込み不可。
-- Edge Function（service_role, RLSバイパス）だけがゲーム状態を書き換えられる。
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  status text not null default 'playing' check (status in ('playing', 'finished', 'abandoned')),
  current_side text not null default 'player' check (current_side in ('player', 'cpu')),
  game_state jsonb not null,
  winner text check (winner in ('player', 'cpu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches enable row level security;
create policy "matches_select_participants" on public.matches for select using (
  exists (
    select 1 from public.room_players rp
    where rp.room_id = matches.room_id and rp.player_id = auth.uid()
  )
);

-- ============ match_actions（監査ログ） ============
create table public.match_actions (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.profiles (id),
  action jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.match_actions enable row level security;
create policy "match_actions_select_participants" on public.match_actions for select using (
  exists (
    select 1 from public.matches m
    join public.room_players rp on rp.room_id = m.room_id
    where m.id = match_actions.match_id and rp.player_id = auth.uid()
  )
);
-- INSERTはEdge Functionのみ（ポリシーなし）

-- ============ Realtime ============
-- matchesの変更をクライアントに配信する
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
