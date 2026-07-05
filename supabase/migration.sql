-- ============================================================
-- davetyerim.com — Supabase Migration
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now()
);

-- Yeni kullanıcı kaydolunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin kontrolü (RLS içinde kullanılır)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- VENUES ----------
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  city text not null,
  district text not null default '',
  address text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  capacity_min int not null default 0,
  capacity_max int not null default 0,
  price_min numeric not null default 0, -- kişi başı TL
  price_max numeric not null default 0, -- kişi başı TL
  venue_type text not null,
  categories text[] not null default '{}',
  features text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_status_idx on public.venues (status);
create index if not exists venues_city_idx on public.venues (city);
create index if not exists venues_owner_idx on public.venues (owner_id);

-- ---------- VENUE PHOTOS ----------
create table if not exists public.venue_photos (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists venue_photos_venue_idx on public.venue_photos (venue_id);

-- ---------- LEADS (Teklif İstekleri) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null default '',
  event_date date,
  guest_count int,
  category text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists leads_venue_idx on public.leads (venue_id);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.venue_photos enable row level security;
alter table public.leads enable row level security;

-- Profiles: kullanıcı kendi profilini görür/günceller, admin hepsini görür
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Venues: onaylılar herkese açık; sahip kendininkini yönetir; admin her şeyi
create policy "venues_select_public" on public.venues
  for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "venues_insert_own" on public.venues
  for insert with check (owner_id = auth.uid());
create policy "venues_update_own" on public.venues
  for update using (owner_id = auth.uid() or public.is_admin());
create policy "venues_delete_own" on public.venues
  for delete using (owner_id = auth.uid() or public.is_admin());

-- Photos: onaylı mekanların fotoğrafları herkese açık; sahip yönetir
create policy "photos_select_public" on public.venue_photos
  for select using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id
        and (v.status = 'approved' or v.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "photos_insert_own" on public.venue_photos
  for insert with check (
    exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid())
  );
create policy "photos_delete_own" on public.venue_photos
  for delete using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- Leads: herkes teklif isteği gönderebilir; sadece mekan sahibi ve admin okur
create policy "leads_insert_public" on public.leads
  for insert with check (true);
create policy "leads_select_owner" on public.leads
  for select using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do nothing;

create policy "venue_photos_public_read" on storage.objects
  for select using (bucket_id = 'venue-photos');
create policy "venue_photos_auth_upload" on storage.objects
  for insert with check (bucket_id = 'venue-photos' and auth.role() = 'authenticated');
create policy "venue_photos_auth_delete" on storage.objects
  for delete using (bucket_id = 'venue-photos' and owner = auth.uid());

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists venues_updated_at on public.venues;
create trigger venues_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

-- ============================================================
-- NOT: Kendinizi admin yapmak için (kayıt olduktan sonra):
-- update public.profiles set role = 'admin' where id = 'AUTH_USER_ID';
-- ============================================================
