-- ============================================================
-- davetyerim.com — Migration v10
-- İşletme başvurusunda iki belge daha: faaliyet belgesi / ticaret sicil
-- ve alkollü içecek belgesi.
--
-- /mekan-sahibi-ol sayfası dört belge vaat ediyordu ama form yalnızca
-- ikisini kabul ediyordu; başvuran mekan sahibi kalan ikisini yükleyecek
-- yer bulamıyordu.
--
-- Her iki belge de İSTEĞE BAĞLIDIR: faaliyet belgesi "önerilir"
-- seviyesinde, alkol belgesi yalnızca alkollü paket sunan mekanlar için
-- anlamlı. Zorunlu tutulsaydı alkolsüz çalışan kır bahçeleri ve davet
-- evleri başvuramazdı.
--
-- migration-v9.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Yeni belge alanları
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists trade_registry_document_path text;

alter table public.profiles
  add column if not exists alcohol_license_document_path text;

-- ------------------------------------------------------------
-- 2) Başvuru fonksiyonu yeni belgeleri de kaydeder
--
-- Eski 7 argümanlı sürüm düşürülüyor; yerine 9 argümanlı sürüm geliyor.
-- Yeni iki argüman sonda ve varsayılanı boş: eski imzayla yapılan bir
-- çağrı kalırsa da çalışmaya devam eder.
-- ------------------------------------------------------------
drop function if exists public.apply_for_owner(
  text, text, text, text, text, text, text
);

create or replace function public.apply_for_owner(
  p_business_name text,
  p_business_phone text,
  p_business_city text,
  p_tax_id text,
  p_note text,
  p_tax_doc text,
  p_license_doc text,
  p_trade_doc text default '',
  p_alcohol_doc text default ''
)
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set
    owner_status = 'pending',
    business_name = p_business_name,
    business_phone = p_business_phone,
    business_city = p_business_city,
    tax_id = p_tax_id,
    application_note = p_note,
    tax_document_path = coalesce(nullif(p_tax_doc, ''), tax_document_path),
    license_document_path = coalesce(nullif(p_license_doc, ''), license_document_path),
    trade_registry_document_path =
      coalesce(nullif(p_trade_doc, ''), trade_registry_document_path),
    alcohol_license_document_path =
      coalesce(nullif(p_alcohol_doc, ''), alcohol_license_document_path)
  where id = auth.uid() and role = 'user';
$$;
