-- ============================================================
-- davetyerim.com — Migration v7
-- Firmalar için başvuru formu: mekan sahibi fiyat görmez, bize ulaşır.
-- migration-v6.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

create table if not exists public.owner_inquiries (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null,
  contact_name text not null,
  phone text not null,
  email text not null default '',
  city text not null default '',
  venue_type text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists owner_inquiries_created_idx
  on public.owner_inquiries (created_at desc);

alter table public.owner_inquiries enable row level security;

-- Form kamuya açık: herkes başvuru gönderebilir
drop policy if exists owner_inquiries_insert on public.owner_inquiries;
create policy owner_inquiries_insert on public.owner_inquiries
  for insert with check (true);

-- Başvuruları yalnızca admin okur ve yönetir
drop policy if exists owner_inquiries_select on public.owner_inquiries;
create policy owner_inquiries_select on public.owner_inquiries
  for select using (public.is_admin());

drop policy if exists owner_inquiries_update on public.owner_inquiries;
create policy owner_inquiries_update on public.owner_inquiries
  for update using (public.is_admin());

-- ============================================================
-- Bitti. owner_inquiries tablosu ve RLS hazır.
-- ============================================================
