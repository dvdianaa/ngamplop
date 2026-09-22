-- ============================================================
-- Migrasi: sistem role (member / manager / admin) buat kontrol
-- siapa yang boleh lihat & edit nominal per "side" (dvdianaa/sahlan).
-- Aman dijalankan di database yang udah ada isinya — nggak
-- nyentuh data guests kamu.
--
-- Role disimpan di "User Metadata" tiap akun (Authentication > Users
-- > klik user > edit User Metadata), contoh isian JSON-nya:
--   akun dvdianaa : {"role": "member",  "side": "dvdianaa"}
--   akun sahlan   : {"role": "member",  "side": "sahlan"}
--   akun pengawas : {"role": "manager", "side": "dvdianaa"}  (boleh lihat SEMUA sisi, tapi edit cuma sisi sendiri)
--   akun kamu     : {"role": "admin"}                        (boleh lihat & edit SEMUA sisi)
-- ============================================================

drop function if exists public.can_view_side(text) cascade;
drop function if exists public.can_edit_side(text) cascade;

create function public.can_view_side(target_side text)
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('admin', 'manager')
    or (
      coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'member'
      and coalesce(auth.jwt() -> 'user_metadata' ->> 'side', '') = target_side
    );
$$;

create function public.can_edit_side(target_side text)
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
    or (
      coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('member', 'manager')
      and coalesce(auth.jwt() -> 'user_metadata' ->> 'side', '') = target_side
    );
$$;

grant execute on function public.can_view_side(text) to anon, authenticated;
grant execute on function public.can_edit_side(text) to anon, authenticated;

-- View publik: ganti masking dari "cuma dvdianaa, cuma cek login"
-- jadi "sisi mana pun, cek can_view_side" (member/manager/admin).
create or replace view public.guests_public
with (security_invoker = false)
as
select
  id,
  side,
  guest_name,
  alias,
  address,
  full_address,
  rt,
  rw,
  village,
  subdistrict,
  district,
  phone,
  case when can_view_side(side) then amount else null end as amount,
  not can_view_side(side) as amount_hidden,
  gift_item,
  notes,
  event_date,
  recorded_at,
  updated_at
from public.guests;

grant select on public.guests_public to anon, authenticated;

-- RLS tabel asli: insert/update/delete lewat login dibatasi
-- can_edit_side. Kebijakan "anon insert" (publik nambah tamu baru
-- tanpa login) nggak diubah/disentuh.
drop policy if exists "authenticated insert" on public.guests;
create policy "authenticated insert"
  on public.guests for insert
  to authenticated
  with check (can_edit_side(side));

drop policy if exists "authenticated update" on public.guests;
create policy "authenticated update"
  on public.guests for update
  to authenticated
  using (can_edit_side(side))
  with check (can_edit_side(side));

drop policy if exists "authenticated delete" on public.guests;
create policy "authenticated delete"
  on public.guests for delete
  to authenticated
  using (can_edit_side(side));

-- ============================================================
-- Selesai. Langkah berikutnya di Supabase:
-- Authentication → Users → klik tiap akun (dvdianaa, sahlan, dst)
-- → edit "User Metadata" → isi JSON role-nya (lihat contoh di atas)
-- → Save. Efeknya langsung berlaku begitu user itu login ulang
-- (JWT lama nggak otomatis keupdate, jadi kalau lagi login pas
-- diubah, suruh logout-login lagi).
-- ============================================================
