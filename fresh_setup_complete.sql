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

-- 2. Row Level Security — publik cuma boleh nambah data baru (insert),
--    baca/edit/hapus langsung dari tabel asli cuma buat user login.
--    Publik baca lewat view `guests_public` di bawah.
alter table public.guests enable row level security;

create policy "authenticated read all"
  on public.guests for select
  to authenticated
  using (true);

create policy "authenticated insert"
  on public.guests for insert
  to authenticated
  with check (true);

create policy "anon insert"
  on public.guests for insert
  to anon
  with check (true);

create policy "authenticated update"
  on public.guests for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated delete"
  on public.guests for delete
  to authenticated
  using (true);

-- 3. View publik — nominal sisi "dvdianaa" di-null-kan kalau belum login.
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
  case
    when side = 'dvdianaa' and auth.uid() is null then null
    else amount
  end as amount,
  (side = 'dvdianaa' and auth.uid() is null) as amount_hidden,
  gift_item,
  notes,
  event_date,
  recorded_at,
  updated_at
from public.guests;

grant select on public.guests_public to anon, authenticated;

-- 4. RPC statistik dashboard — security definer supaya totalnya selalu
--    utuh (termasuk sumbangan dvdianaa yang di-mask di listing publik).
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
-- 2. (Opsional) Authentication → Providers → aktifkan Google kalau
--    mau pakai tombol "Lanjut dengan Google" di LoginModal.
-- 3. Buat akun lewat tombol "Daftar" di app buat bisa login dan
--    lihat nominal sisi Dvdianaa.
-- ============================================================
