-- ============================================================
-- davetyerim.com — Migration v6
-- Basit müsaitlik takvimi: mekan sahibi dolu tarihleri işaretler,
-- ziyaretçiler mekan sayfasında görür.
-- migration-v5.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

create table if not exists public.venue_unavailable_dates (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (venue_id, date)
);

create index if not exists venue_unavailable_dates_venue_idx
  on public.venue_unavailable_dates (venue_id);

alter table public.venue_unavailable_dates enable row level security;

-- Herkes görebilir (mekan sayfasında takvim gösterimi için)
drop policy if exists venue_unavailable_dates_select on public.venue_unavailable_dates;
create policy venue_unavailable_dates_select on public.venue_unavailable_dates
  for select using (true);

-- Sadece mekan sahibi veya admin tarih ekleyebilir/silebilir
drop policy if exists venue_unavailable_dates_insert on public.venue_unavailable_dates;
create policy venue_unavailable_dates_insert on public.venue_unavailable_dates
  for insert with check (
    exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists venue_unavailable_dates_delete on public.venue_unavailable_dates;
create policy venue_unavailable_dates_delete on public.venue_unavailable_dates
  for delete using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- Bitti. venue_unavailable_dates tablosu ve RLS hazır.
-- ============================================================
