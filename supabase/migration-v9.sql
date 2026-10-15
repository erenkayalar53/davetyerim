-- ============================================================
-- davetyerim.com — Migration v9
-- Teklif akışı: toplu teklif, çift tarafında karşılaştırma,
-- geri arama talebi ve mekan sahibi yanıt süresi ölçümü.
-- v7'den sonra çalıştırılabilir; v8 (outreach) ile arasında bağımlılık YOKTUR,
-- onu atlamış olsanız da bu dosya sorunsuz çalışır. Güvenlidir, veri silmez.
-- ============================================================

-- ------------------------------------------------------------
-- 1) leads tablosu genişletiliyor
-- ------------------------------------------------------------

-- Girişli çiftin talebi kendisine bağlanır. Anonim talepler null kalır;
-- onlar /tekliflerim ekranında görünmez, sadece mekan sahibine gider.
alter table public.leads
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Favorilerden tek formla gönderilen taleplerin hepsi aynı batch_id'yi taşır.
alter table public.leads
  add column if not exists batch_id uuid;

-- quote: tam teklif formu · callback: yalnızca "beni arayın"
alter table public.leads
  add column if not exists kind text not null default 'quote';

-- Mekan sahibinin dönüşü
alter table public.leads
  add column if not exists responded_at timestamptz;
alter table public.leads
  add column if not exists quoted_price numeric(10,2);
alter table public.leads
  add column if not exists owner_note text not null default '';

-- new: bekliyor · responded: sahibi yanıtladı · closed: çift kapattı
alter table public.leads
  add column if not exists status text not null default 'new';

create index if not exists leads_user_idx on public.leads (user_id, created_at desc);
create index if not exists leads_batch_idx on public.leads (batch_id);
create index if not exists leads_venue_responded_idx
  on public.leads (venue_id, responded_at);

-- ------------------------------------------------------------
-- 2) venues: yanıt hızı rozeti için türetilmiş alanlar
-- ------------------------------------------------------------
alter table public.venues
  add column if not exists avg_response_minutes int;
alter table public.venues
  add column if not exists response_sample_count int not null default 0;

-- ------------------------------------------------------------
-- 3) Yanıt süresini otomatik hesaplayan trigger
--
-- Ortalama her yanıtta yeniden hesaplanır. Uygulama katmanında tutulsaydı
-- panelden yapılan bir güncelleme ile admin tarafındaki bir güncelleme
-- farklı sonuç üretebilirdi; tek doğru kaynak burasıdır.
-- ------------------------------------------------------------
create or replace function public.refresh_venue_response_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.venues v
  set avg_response_minutes = sub.avg_minutes,
      response_sample_count = sub.sample_count
  from (
    select
      round(
        avg(extract(epoch from (l.responded_at - l.created_at)) / 60)
      )::int as avg_minutes,
      count(*)::int as sample_count
    from public.leads l
    where l.venue_id = new.venue_id
      and l.responded_at is not null
      -- Aylardır bekleyen tek bir talebe verilen geç cevap ortalamayı
      -- anlamsız hale getiriyor; 30 günden eski yanıtlar sayılmaz.
      and l.responded_at - l.created_at < interval '30 days'
  ) sub
  where v.id = new.venue_id;

  return new;
end $$;

drop trigger if exists leads_response_time on public.leads;
create trigger leads_response_time
  after update of responded_at on public.leads
  for each row
  when (new.responded_at is not null)
  execute function public.refresh_venue_response_time();

-- ------------------------------------------------------------
-- 4) RLS — çift kendi taleplerini görebilmeli
-- ------------------------------------------------------------

-- Mevcut leads_select_owner politikası mekan sahibi içindi; çift için ayrı
-- politika ekleniyor. İki politika OR'lanır: sahibi de çift de görür.
drop policy if exists leads_select_own_user on public.leads;
create policy leads_select_own_user on public.leads
  for select using (user_id = auth.uid());

-- Mekan sahibi kendi mekanına gelen talebi güncelleyebilir (yanıtlama).
drop policy if exists leads_update_owner on public.leads;
create policy leads_update_owner on public.leads
  for update using (
    exists (
      select 1 from public.venues v
      where v.id = leads.venue_id
        and (v.owner_id = auth.uid() or public.is_admin())
    )
  );

-- Çifte doğrudan UPDATE yetkisi VERİLMEZ.
--
-- RLS satır düzeyinde çalışır, kolon düzeyinde değil: "kendi talebini
-- güncelleyebilir" demek, çiftin mekanın girdiği quoted_price'ı da
-- değiştirebilmesi demekti. Talebi kapatmak tek meşru işlem olduğundan
-- yalnızca onu yapan bir fonksiyon veriliyor.
drop policy if exists leads_update_own_user on public.leads;

create or replace function public.close_my_lead(lead_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leads
  set status = 'closed'
  where id = lead_id
    and user_id = auth.uid();
end $$;

revoke all on function public.close_my_lead(uuid) from public;
grant execute on function public.close_my_lead(uuid) to authenticated;

-- ============================================================
-- Bitti. Teklif akışı alanları, trigger ve politikalar hazır.
-- ============================================================
