// app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
})

const SITE_ORIGIN = 'https://dvdianaa.github.io'
const SITE_URL = `${SITE_ORIGIN}/ngamplop`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: 'Ngamplop — Buku Tamu',
  description: 'Sistem pencatatan tamu dan sumbangan hajatan yang rapi, tersimpan aman, dan mudah dicari kapan saja.',
  openGraph: {
    title: 'Ngamplop — Buku Tamu',
    description: 'Sistem pencatatan tamu dan sumbangan hajatan yang rapi, tersimpan aman, dan mudah dicari kapan saja.',
    url: SITE_URL,
    siteName: 'Ngamplop',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ngamplop — Buku Tamu',
    description: 'Sistem pencatatan tamu dan sumbangan hajatan yang rapi, tersimpan aman, dan mudah dicari kapan saja.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${cormorant.variable} ${plexSans.variable}`}>
      <body className="bg-ivory-100 text-ivory-900 font-body">{children}</body>
    </html>
  )
}
