-- Run this in Supabase SQL Editor.
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  flower_id text not null,
  flower_name text not null,
  flower_emoji text not null,
  sender text not null,
  message text not null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

alter table public.gifts enable row level security;

-- Public app may create gifts. Only the anon key is used in the browser.
create policy "Anyone can create gifts"
on public.gifts for insert
to anon, authenticated
with check (
  char_length(code) = 6
  and char_length(sender) <= 40
  and char_length(message) <= 240
);

-- Codes are intentionally public bearer tokens: anyone with a code can read that gift.
create policy "Anyone can read gifts by code"
on public.gifts for select
to anon, authenticated
using (true);

-- No client-side update/delete policies: claiming is not yet enforced server-side.
-- For a production launch, replace public read policy with a secure RPC function
-- that accepts a code and returns only the matching gift. Do not store sensitive data.
