-- ============================================================
-- davetyerim.com — Migration v4
-- İşletme belgesi doğrulama + "Doğrulanmış Mekan" rozeti.
-- migration-v3.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

-- ---------- BELGE & DOĞRULAMA ALANLARI ----------
alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists tax_document_path text;
alter table public.profiles add column if not exists license_document_path text;

alter table public.venues add column if not exists verified boolean not null default false;

-- Başvuru fonksiyonu belge yollarını da kaydeder (eski 5 argümanlı sürümü değiştir)
drop function if exists public.apply_for_owner(text, text, text, text, text);

create or replace function public.apply_for_owner(
  p_business_name text,
  p_business_phone text,
  p_business_city text,
  p_tax_id text,
  p_note text,
  p_tax_doc text,
  p_license_doc text
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
    license_document_path = coalesce(nullif(p_license_doc, ''), license_document_path)
  where id = auth.uid() and role = 'user';
$$;

-- Onay: kullanıcı owner + doğrulanmış olur, mevcut mekanları da doğrulanır
create or replace function public.approve_owner(p_user uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Bu işlem için admin yetkisi gerekli';
  end if;
  update public.profiles
    set role = 'owner', owner_status = 'approved', verified = true
    where id = p_user;
  update public.venues set verified = true where owner_id = p_user;
end;
$$;

grant execute on function public.apply_for_owner(text, text, text, text, text, text, text) to authenticated;

-- ---------- ÖZEL BELGE DEPOSU (herkese kapalı) ----------
insert into storage.buckets (id, name, public)
values ('owner-documents', 'owner-documents', false)
on conflict (id) do nothing;

-- Kullanıcı kendi belgesini yükler; sahip veya admin okuyabilir (imzalı URL ile)
drop policy if exists owner_docs_insert on storage.objects;
create policy owner_docs_insert on storage.objects
  for insert with check (
    bucket_id = 'owner-documents' and auth.role() = 'authenticated'
  );

drop policy if exists owner_docs_select on storage.objects;
create policy owner_docs_select on storage.objects
  for select using (
    bucket_id = 'owner-documents' and (owner = auth.uid() or public.is_admin())
  );

drop policy if exists owner_docs_delete on storage.objects;
create policy owner_docs_delete on storage.objects
  for delete using (
    bucket_id = 'owner-documents' and (owner = auth.uid() or public.is_admin())
  );

-- ============================================================
-- Bitti. Başvuruda belge yüklenir, admin imzalı bağlantıyla görür,
-- onayladığında işletme "Doğrulanmış" olur ve mekanlarında rozet çıkar.
-- ============================================================
