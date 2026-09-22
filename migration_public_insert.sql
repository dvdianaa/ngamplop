-- ============================================================
-- Migrasi: izinin publik (belum login) nambah data tamu baru.
-- Aman dijalankan di database yang udah ada isinya — cuma nambah
-- policy RLS, nggak nyentuh data guests kamu.
-- ============================================================

drop policy if exists "anon insert" on public.guests;

create policy "anon insert"
  on public.guests for insert
  to anon
  with check (true);
