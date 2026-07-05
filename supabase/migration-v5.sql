-- ============================================================
-- davetyerim.com — Migration v5
-- Düğün.com paritesi: yorumlar+puanlama, mekana özel SSS,
-- alt alan kapasitesi, kampanya, hafta içi/sonu fiyat.
-- migration-v4.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

-- ---------- VENUES: yeni alanlar ----------
alter table public.venues add column if not exists faqs jsonb not null default '[]';
alter table public.venues add column if not exists capacity_areas jsonb not null default '[]';
alter table public.venues add column if not exists campaign jsonb;
alter table public.venues add column if not exists rating_avg numeric not null default 0;
alter table public.venues add column if not exists rating_count int not null default 0;

-- ---------- YORUMLAR ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  event_date date,
  rating int not null check (rating between 1 and 5),
  rating_quality int check (rating_quality between 1 and 5),
  rating_staff int check (rating_staff between 1 and 5),
  rating_communication int check (rating_communication between 1 and 5),
  comment text not null default '',
  owner_reply text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_venue_idx on public.reviews (venue_id);

alter table public.reviews enable row level security;

-- Onaylı yorumları herkes görür; sahip/admin hepsini; kullanıcı kendininkini
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews
  for select using (
    status = 'approved'
    or user_id = auth.uid()
    or exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- Giriş yapan kullanıcı yorum ekler
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert with check (user_id = auth.uid());

-- Kullanıcı kendi yorumunu düzenler/siler; sahip cevap yazar; admin her şey
drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews
  for update using (
    user_id = auth.uid()
    or exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ---------- PUAN ORTALAMASI (otomatik) ----------
create or replace function public.refresh_venue_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid := coalesce(new.venue_id, old.venue_id);
begin
  update public.venues v set
    rating_count = sub.cnt,
    rating_avg = coalesce(sub.avg, 0)
  from (
    select count(*)::int as cnt, avg(rating)::numeric as avg
    from public.reviews
    where venue_id = v_id and status = 'approved'
  ) sub
  where v.id = v_id;
  return null;
end;
$$;

drop trigger if exists reviews_rating_trigger on public.reviews;
create trigger reviews_rating_trigger
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_venue_rating();

-- ============================================================
-- Bitti. Yorumlar, puan ortalaması, mekana özel SSS/kapasite/kampanya
-- ve hafta içi/sonu fiyat için altyapı hazır.
-- ============================================================
