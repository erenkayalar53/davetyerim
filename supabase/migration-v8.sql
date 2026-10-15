-- ============================================================
-- davetyerim.com — Migration v8
-- Mekan dış erişim (outreach) otomasyonu:
-- keşif → e-posta zenginleştirme → taslak → onay → kademeli gönderim.
-- migration-v7.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Aday mekanlar
-- ------------------------------------------------------------
create table if not exists public.outreach_prospects (
  id uuid primary key default gen_random_uuid(),

  -- Nereden geldi: google_places | csv | directory | manual
  source text not null default 'manual',
  source_ref text not null default '',

  name text not null,
  city text not null default '',
  district text not null default '',
  address text not null default '',
  phone text not null default '',
  website text not null default '',

  email text not null default '',
  -- mailto | page_text | source | manual
  email_source text not null default '',
  email_confidence int not null default 0,

  rating numeric(2,1),
  rating_count int,

  -- Aynı mekanın iki kez eklenmesini engelleyen anahtar: slug(ad)|slug(şehir)
  dedupe_key text not null unique,

  -- new: yeni bulundu, henüz zenginleştirilmedi
  -- enriched: site tarandı, e-posta bulundu (ready) ya da bulunamadı (no_email)
  -- drafted: mesaj taslağı hazır, onay bekliyor
  -- contacted: ilk mesaj gönderildi
  -- replied / converted: yanıt geldi / siteye kaydoldu
  -- bounced / unsubscribed / skipped: gönderim kapalı
  status text not null default 'new',

  last_error text not null default '',
  notes text not null default '',

  -- Kaç kez mesaj gönderildi (takip adımları için)
  contact_count int not null default 0,
  last_contacted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outreach_prospects_status_idx
  on public.outreach_prospects (status, created_at desc);
create index if not exists outreach_prospects_city_idx
  on public.outreach_prospects (city);
create index if not exists outreach_prospects_email_idx
  on public.outreach_prospects (lower(email));

-- ------------------------------------------------------------
-- 2) Mesajlar (taslak + gönderim kaydı)
-- ------------------------------------------------------------
create table if not exists public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.outreach_prospects(id) on delete cascade,

  template_key text not null default 'intro',
  step int not null default 1,

  to_email text not null,
  subject text not null,
  body_text text not null,
  body_html text not null default '',

  -- draft | approved | sending | sent | failed | canceled
  status text not null default 'draft',

  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  scheduled_at timestamptz,
  sent_at timestamptz,

  provider_id text not null default '',
  error text not null default '',

  created_at timestamptz not null default now()
);

create index if not exists outreach_messages_status_idx
  on public.outreach_messages (status, scheduled_at);
create index if not exists outreach_messages_prospect_idx
  on public.outreach_messages (prospect_id, step);

-- Aynı adaya aynı adımdan iki taslak üretilmesin
create unique index if not exists outreach_messages_prospect_step_key
  on public.outreach_messages (prospect_id, step);

-- ------------------------------------------------------------
-- 3) Olay logu (teslim, açılma, bounce, şikayet)
-- ------------------------------------------------------------
create table if not exists public.outreach_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.outreach_messages(id) on delete cascade,
  prospect_id uuid references public.outreach_prospects(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists outreach_events_prospect_idx
  on public.outreach_events (prospect_id, created_at desc);

-- ------------------------------------------------------------
-- 4) Kara liste — bu adreslere bir daha asla gönderilmez
-- ------------------------------------------------------------
create table if not exists public.outreach_suppression (
  email text primary key,
  -- unsubscribed | bounced | complained | manual
  reason text not null default 'manual',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5) Cron çalıştırma logu
-- ------------------------------------------------------------
create table if not exists public.outreach_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats jsonb not null default '{}'::jsonb,
  error text not null default ''
);

create index if not exists outreach_runs_started_idx
  on public.outreach_runs (started_at desc);

-- ------------------------------------------------------------
-- 6) Basit anahtar-değer durumu (keşif imleci vb.)
-- ------------------------------------------------------------
create table if not exists public.outreach_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- RLS — tüm outreach verisi yalnızca admin içindir.
-- Cron ve gönderim service_role ile çalışır (RLS'i baypas eder).
-- ------------------------------------------------------------
alter table public.outreach_prospects  enable row level security;
alter table public.outreach_messages   enable row level security;
alter table public.outreach_events     enable row level security;
alter table public.outreach_suppression enable row level security;
alter table public.outreach_runs       enable row level security;
alter table public.outreach_state      enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'outreach_prospects',
    'outreach_messages',
    'outreach_events',
    'outreach_suppression',
    'outreach_runs',
    'outreach_state'
  ]
  loop
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format(
      'create policy %I_admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t, t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- updated_at otomatiği
-- ------------------------------------------------------------
create or replace function public.touch_outreach_prospect()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists outreach_prospects_touch on public.outreach_prospects;
create trigger outreach_prospects_touch
  before update on public.outreach_prospects
  for each row execute function public.touch_outreach_prospect();

-- ============================================================
-- Bitti. Outreach tabloları ve RLS hazır.
-- ============================================================
