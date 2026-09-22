// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: { 50:'#EAF3F0',100:'#CFE4DD',300:'#7FA89C',500:'#1B5C50',700:'#12433B',900:'#0B2B26' },
        copper:  { 50:'#FBF3E8',100:'#EFE6D3',300:'#D9AD7A',500:'#C08A4E',700:'#A66F35',900:'#6E4823' },
        ivory:   { 50:'#FAF6EE',100:'#F5EFE3',200:'#E4D9C0',400:'#B4AC98',600:'#7A7263',900:'#1D2A26' },
      },
      fontFamily: {
        heading: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(29,42,38,0.04), 0 8px 24px rgba(29,42,38,0.06)',
        hero: '0 16px 40px rgba(18,67,59,0.22)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.32,0.72,0,1)',
      },
    },
  },
  plugins: [],
}

export default config
