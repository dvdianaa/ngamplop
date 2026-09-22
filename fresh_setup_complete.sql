-- ============================================================
-- Ngamplop — Setup lengkap Supabase
-- Jalankan seluruh file ini di Supabase SQL Editor (project baru
-- atau reset total — perintah DROP di bawah akan menghapus data lama).
-- ============================================================

-- 0. Bersihkan objek lama (aman dijalankan berkali-kali)
drop function if exists public.get_dashboard_stats();
drop view if exists public.guests_public;
drop table if exists public.guests cascade;
drop function if exists public.set_updated_at();
drop function if exists public.can_view_side(text);
drop function if exists public.can_edit_side(text);

-- 1. Tabel utama — hanya bisa diakses langsung oleh user yang login
create table public.guests (
  id bigint generated always as identity primary key,
  side text not null default 'dvdianaa' check (side in ('dvdianaa', 'sahlan')),
  guest_name text not null,
  alias text,
  address text,
  full_address text,
  rt text,
  rw text,
  village text,
  subdistrict text,
  district text,
  phone text,
  amount numeric check (amount is null or amount >= 0),
  gift_item text,
  notes text,
  event_date date,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_side_idx on public.guests (side);
create index guests_recorded_at_idx on public.guests (recorded_at desc);
create index guests_address_idx on public.guests (address);

-- auto-update updated_at tiap kali barisnya di-UPDATE
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger guests_set_updated_at
  before update on public.guests
  for each row
  execute function public.set_updated_at();

-- 2. Role per user — disimpan di "User Metadata" pas bikin/edit user di
--    Supabase Authentication > Users. Contoh isian:
--      akun dvdianaa : {"role": "member",  "side": "dvdianaa"}
--      akun sahlan   : {"role": "member",  "side": "sahlan"}
--      akun pengawas : {"role": "manager", "side": "dvdianaa"}  (bisa lihat semua sisi, edit sisi sendiri aja)
--      akun kamu     : {"role": "admin"}                        (lihat & edit semua sisi)
--
--    can_view_side  -> boleh LIHAT nominal sisi ini? (member: sisi sendiri, manager & admin: semua)
--    can_edit_side  -> boleh TAMBAH/UBAH/HAPUS data sisi ini? (member & manager: sisi sendiri, admin: semua)
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

-- 3. Row Level Security — insert/update/delete langsung ke tabel asli cuma
--    buat user login, dibatasi can_edit_side. Publik (belum login) cuma
--    bisa baca lewat view `guests_public` di bawah, nggak bisa nambah data.
alter table public.guests enable row level security;

create policy "authenticated read all"
  on public.guests for select
  to authenticated
  using (true);

create policy "authenticated insert"
  on public.guests for insert
  to authenticated
  with check (can_edit_side(side));

create policy "authenticated update"
  on public.guests for update
  to authenticated
  using (can_edit_side(side))
  with check (can_edit_side(side));

create policy "authenticated delete"
  on public.guests for delete
  to authenticated
  using (can_edit_side(side));

-- 4. View publik — nominal cuma keliatan kalau can_view_side ngizinin.
--    security_invoker = false (default) supaya view jalan pakai hak akses
--    pemilik (postgres), jadi RLS di atas dilewati dan publik tetap bisa
--    baca baris-baris yang di-mask, bukan malah kena "no rows".
create view public.guests_public
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

-- 5. RPC statistik dashboard — security definer supaya totalnya selalu
--    utuh (termasuk sumbangan yang di-mask di listing publik).
create function public.get_dashboard_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total_guests', (select count(*) from guests),
    'total_amount', (select coalesce(sum(amount), 0) from guests),
    'total_daerah', (
      select count(distinct upper(address))
      from guests
      where address is not null and address <> ''
    ),
    'top_daerah', (
      select coalesce(json_agg(t), '[]'::json)
      from (
        select
          upper(address) as alamat,
          count(*) as orang,
          coalesce(sum(amount), 0) as uang
        from guests
        where address is not null and address <> ''
        group by upper(address)
        order by uang desc
        limit 5
      ) t
    )
  );
$$;

grant execute on function public.get_dashboard_stats() to anon, authenticated;

-- ============================================================
-- Selesai. Langkah berikutnya:
-- 1. Project Settings → API → salin Project URL & anon public key
--    ke lib/supabase/client.ts.
-- 2. Authentication → Users → Add user, buat tiap akun isi
--    "User Metadata" (JSON) sesuai role-nya, misal:
--    {"role": "member", "side": "dvdianaa"}  atau  {"role": "admin"}
--    Centang "Auto Confirm User" biar langsung bisa login.
-- ============================================================
