-- ============================================================
-- davetyerim.com — Migration v2
-- Yeni özellikler: bireysel/mekan sahibi rolleri, çoklu mekan tipi,
-- menü/fiyat paketleri, favoriler, görüntülenme analitiği.
-- migration.sql'den SONRA, SQL Editor'de çalıştırın. Güvenlidir —
-- mevcut veriyi silmez, sadece yeni sütun/tablo ekler.
-- ============================================================

-- ---------- ROLLER: 'user' eklendi, varsayılan 'user' ----------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles alter column role set default 'user';
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'owner', 'admin'));

-- Kayıt sırasında metadata'daki account_type -> role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    case when new.raw_user_meta_data ->> 'account_type' = 'owner'
         then 'owner' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Kullanıcı kendi rolünü 'user' -> 'owner' yükseltebilir (mekan sahibi ol)
create or replace function public.become_owner()
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set role = 'owner'
  where id = auth.uid() and role = 'user';
$$;

-- ---------- VENUES: çoklu tip, menü paketleri, görüntülenme ----------
alter table public.venues
  add column if not exists venue_types text[] not null default '{}';
alter table public.venues
  add column if not exists menu_packages jsonb not null default '[]';
alter table public.venues
  add column if not exists view_count int not null default 0;

-- Mevcut tek tipi çoklu tip dizisine taşı
update public.venues
  set venue_types = array[venue_type]
  where (venue_types = '{}' or venue_types is null) and venue_type is not null;

-- Görüntülenme sayacını güvenli şekilde artır (anon dahil)
create or replace function public.increment_venue_view(vid uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.venues set view_count = view_count + 1
  where id = vid and status = 'approved';
$$;

grant execute on function public.increment_venue_view(uuid) to anon, authenticated;
grant execute on function public.become_owner() to authenticated;

-- ---------- FAVORİLER ----------
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create index if not exists favorites_venue_idx on public.favorites (venue_id);

alter table public.favorites enable row level security;

-- Kullanıcı kendi favorilerini yönetir
drop policy if exists favorites_all_own on public.favorites;
create policy favorites_all_own on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Mekan sahibi kendi mekanının favori sayısını görebilir (analitik)
drop policy if exists favorites_select_venue_owner on public.favorites;
create policy favorites_select_venue_owner on public.favorites
  for select using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- Bitti. Mevcut mekanların venue_types alanı otomatik dolduruldu.
-- ============================================================
