-- ============================================================
-- Migrasi: cabut izin publik (belum login) buat nambah data tamu.
-- Sekarang cuma user yang login yang bisa insert. Aman dijalankan
-- di database yang udah ada isinya — nggak nyentuh data guests kamu.
-- ============================================================

drop policy if exists "anon insert" on public.guests;
