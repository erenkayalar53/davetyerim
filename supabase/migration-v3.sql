-- ============================================================
-- davetyerim.com — Migration v3
-- Mekan sahipliği artık admin onaylı işletme başvurusu ile.
-- Tek tıkla owner'a geçiş kaldırıldı; güven/kalite denetimi eklendi.
-- migration-v2.sql'den SONRA çalıştırın. Güvenlidir, veri silmez.
-- ============================================================

-- ---------- İŞLETME BAŞVURU ALANLARI ----------
alter table public.profiles
  add column if not exists owner_status text not null default 'none'
  check (owner_status in ('none', 'pending', 'approved', 'rejected'));
alter table public.profiles add column if not exists business_name text;
alter table public.profiles add column if not exists business_phone text;
alter table public.profiles add column if not exists business_city text;
alter table public.profiles add column if not exists tax_id text;
alter table public.profiles add column if not exists application_note text;

-- Kayıt trigger'ı: rol HER ZAMAN 'user' olur (owner'lık başvuruyla verilir)
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
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- become_owner artık kullanılmıyor; yerine başvuru fonksiyonu
drop function if exists public.become_owner();

-- Kullanıcı işletme başvurusu yapar (rol owner OLMAZ, sadece pending işaretlenir)
create or replace function public.apply_for_owner(
  p_business_name text,
  p_business_phone text,
  p_business_city text,
  p_tax_id text,
  p_note text
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
    application_note = p_note
  where id = auth.uid() and role = 'user';
$$;

-- Admin başvuruyu onaylar -> kullanıcı owner olur
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
    set role = 'owner', owner_status = 'approved'
    where id = p_user;
end;
$$;

-- Admin başvuruyu reddeder
create or replace function public.reject_owner(p_user uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Bu işlem için admin yetkisi gerekli';
  end if;
  update public.profiles
    set owner_status = 'rejected'
    where id = p_user;
end;
$$;

grant execute on function public.apply_for_owner(text, text, text, text, text) to authenticated;
grant execute on function public.approve_owner(uuid) to authenticated;
grant execute on function public.reject_owner(uuid) to authenticated;

-- Mevcut owner'ları 'approved' işaretle (tutarlılık için)
update public.profiles set owner_status = 'approved'
  where role in ('owner', 'admin') and owner_status = 'none';

-- ============================================================
-- Bitti. Artık "Mekan Sahibi Ol" bir başvuru formu; admin onaylayınca
-- kullanıcı owner olur ve mekan ekleyebilir.
-- ============================================================
