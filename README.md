# Ngamplop — Dashboard (tanpa landing page)

Halaman utama (`/`) langsung jadi dashboard/daftar tamu. Publik bisa lihat
tanpa login; nominal sisi **Dvdianaa** disembunyikan sampai yang buka login
(dimask di level database, bukan cuma di tampilan).

## 1. Setup project

```bash
npx create-next-app@latest ngamplop --typescript --tailwind --app --src-dir=false
cd ngamplop
npm install @supabase/supabase-js
```

Salin semua file di folder ini ke project kamu:
- `tailwind.config.ts`, `next.config.js` → root
- `app/*` → folder `app/`
- `components/*` → folder `components/`
- `lib/*` → folder `lib/`
- `.github/workflows/deploy.yml` → folder `.github/workflows/`

## 2. Setup Supabase

Jalankan `fresh_setup_complete.sql` (dari chat sebelumnya) di SQL Editor
project Supabase kamu, lalu isi `lib/supabase/client.ts` dengan Project URL
dan anon public key.

## 3. Jalankan lokal

```bash
npm run dev
```
Buka http://localhost:3000

## 4. Deploy ke GitHub Pages

1. Push ke repo GitHub baru (misal `ngamplop`).
2. Cek `next.config.js` — samakan `REPO_NAME` dengan nama repo kamu.
3. GitHub: Settings → Pages → Source → **GitHub Actions**.
4. Push ke `main`, workflow otomatis build & deploy. Cek tab **Actions**.
5. Situs muncul di `https://username.github.io/ngamplop/`.

## Yang berubah dari versi sebelumnya

- Nggak ada landing page/marketing lagi — `/` langsung dashboard.
- Layout desktop sekarang pakai sidebar + grid 2 kolom (daftar tamu + panel
  Top Daerah), bukan cuma kolom sempit di tengah kayak sebelumnya.
- Kartu tamu punya shadow lebih halus, avatar lebih tegas, dan sedikit
  animasi muncul pas pertama dimuat.
- Kartu statistik dipecah jadi 3: Total Terkumpul (besar), Rata-rata per
  Tamu, dan Sumbangan Terbesar.
