-- ============================================================
-- Migrasi: batasin kolom "side" cuma ke 'dvdianaa' & 'sahlan'
-- Aman dijalankan di database yang udah ada isinya (nggak nyentuh
-- data guests kamu) — beda sama fresh_setup_complete.sql yang DROP TABLE.
-- ============================================================

alter table public.guests drop constraint if exists guests_side_check;

alter table public.guests
  add constraint guests_side_check check (side in ('dvdianaa', 'sahlan'));
