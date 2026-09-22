import { ImageResponse } from 'next/og'

export const alt = 'Ngamplop — Buku Tamu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return [{ __metadata_id__: [] }]
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B2B26',
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(192,138,78,0.25), transparent 45%), radial-gradient(circle at 85% 85%, rgba(127,168,156,0.25), transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: 32,
            background: '#12433B',
            marginBottom: 40,
          }}
        >
          <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#F5EFE3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="9" width="17" height="4.5" rx="1" />
            <path d="M5 13.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
            <path d="M12 9v12.5" />
            <path d="M12 9c-1-3-3-4.5-4.5-4.5A2.25 2.25 0 0 0 5.5 6.75c0 1.5 1 2.25 2 2.25" />
            <path d="M12 9c1-3 3-4.5 4.5-4.5A2.25 2.25 0 0 1 18.5 6.75c0 1.5-1 2.25-2 2.25" />
          </svg>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 600,
            color: '#F5EFE3',
            letterSpacing: -1,
          }}
        >
          Ngamplop
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#D9AD7A',
            marginTop: 16,
          }}
        >
          Buku Tamu Digital Hajatan
        </div>
      </div>
    ),
    { ...size }
  )
}
