-- ============================================================
-- 오늘만큼 (onemove) — 2차 스프린트 스키마
-- 용도: 로그인 사용자 데이터 동기화 + 카카오 '나에게 보내기' 알림
-- 실행: Supabase 대시보드 > SQL Editor에 전체 붙여넣기 > Run
-- 설계 원칙: localStorage 구조를 그대로 반영(사용자×날짜당 1행)해
--            동기화 코드를 최소화. 게스트는 계속 localStorage만 사용.
-- ============================================================

-- 1) 프로필 — 닉네임·코치·알림 수신 설정
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  nickname       text,
  coach          text check (coach in ('유쾌', '진중', '다정')),
  notify_enabled boolean not null default false,
  updated_at     timestamptz not null default now()
);

-- 2) 하루 기록 — 사용자×날짜당 1행 (onemove_state/routines/completed/easy/skipped 대응)
create table if not exists public.daily_entries (
  user_id       uuid not null references auth.users(id) on delete cascade,
  entry_date    date not null,
  state         text check (state in ('좋아요', '보통이에요', '힘들어요')),
  routine_ids   jsonb not null default '[]',
  routine_names jsonb not null default '[]', -- 표시용 이름 (routine_ids와 같은 순서, 오후 리마인더용)
  completed_ids jsonb not null default '[]',
  easy_ids      jsonb not null default '[]',
  skipped_ids   jsonb not null default '[]',
  updated_at    timestamptz not null default now(),
  primary key (user_id, entry_date)
);

-- (기존 테이블에 컬럼 추가할 때) 2026-07-13 오후 리마인더용
alter table public.daily_entries add column if not exists routine_names jsonb not null default '[]';

-- (기존 테이블에 컬럼 추가할 때) 2026-07-14 매일 루틴(★)용
alter table public.profiles add column if not exists pinned_ids jsonb not null default '[]';

-- 3) 카카오 토큰 — '나에게 보내기' 발송용 (Edge Function이 갱신·사용)
create table if not exists public.kakao_tokens (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  access_token  text,
  refresh_token text not null,
  expires_at    timestamptz,
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- RLS — 모든 테이블: 본인 행만 읽기/쓰기
-- (오후 리마인더 Edge Function은 service role 키로 실행되어 RLS를 우회 — 정상 패턴)
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.daily_entries enable row level security;
alter table public.kakao_tokens  enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own entries" on public.daily_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tokens" on public.kakao_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 오후 리마인더가 "오늘 미완료 사용자"를 빠르게 찾도록 보조 인덱스
create index if not exists daily_entries_date_idx on public.daily_entries (entry_date);
