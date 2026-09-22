// components/LoginModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      setMsg({ text: 'Isi email dan kata sandi dulu.', type: 'error' })
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg({ text: 'Berhasil daftar! Cek email buat verifikasi, lalu masuk.', type: 'success' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Terjadi kesalahan.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setMsg({ text: 'Isi email dulu.', type: 'error' })
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      })
      if (error) throw error
      setMsg({ text: 'Link login sudah dikirim ke email kamu.', type: 'success' })
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Gagal mengirim link.', type: 'error' })
    }
  }

  async function handleGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      })
      if (error) throw error
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Gagal login dengan Google.', type: 'error' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-emerald-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-[420px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[24px] sm:rounded-[24px] p-7 shadow-hero">
        <button onClick={onClose} className="float-right text-2xl text-ivory-400 hover:text-ivory-900 transition-colors" aria-label="Tutup">
          &times;
        </button>
        <p className="font-heading font-bold text-[24px] text-emerald-700 mb-1">Masuk</p>
        <p className="text-ivory-600 text-sm mb-6">Buat lihat nominal sumbangan sisi Dvdianaa.</p>

        <div className="flex bg-ivory-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${mode === 'login' ? 'bg-emerald-700 text-copper-500' : 'text-ivory-600'}`}
          >
            Masuk
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${mode === 'signup' ? 'bg-emerald-700 text-copper-500' : 'text-ivory-600'}`}
          >
            Daftar
          </button>
        </div>

        <label className="block text-sm font-semibold mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
          placeholder="nama@email.com"
        />
        <label className="block text-sm font-semibold mb-1.5">Kata sandi</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 focus:outline-none focus:ring-2 focus:ring-copper-300"
          placeholder="Minimal 6 karakter"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-500 transition-colors text-copper-500 rounded-xl py-3.5 font-bold mt-4 disabled:opacity-60"
        >
          {mode === 'signup' ? 'Daftar' : 'Masuk'}
        </button>
        <button
          onClick={handleMagicLink}
          className="w-full bg-white border border-ivory-200 rounded-xl py-3 font-semibold text-sm mt-2.5 hover:bg-ivory-50 transition-colors"
        >
          Kirim link login lewat email
        </button>

        <div className="flex items-center gap-2.5 my-5 text-xs text-ivory-400">
          <span className="flex-1 h-px bg-ivory-200" /> atau <span className="flex-1 h-px bg-ivory-200" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full bg-white border border-ivory-200 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-ivory-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.87 2.69-6.64z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 010-3.42V4.95H.96a9 9 0 000 8.1l2.99-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l2.99 2.34C4.66 5.16 6.65 3.58 9 3.58z" />
          </svg>
          Lanjut dengan Google
        </button>

        {msg && (
          <div
            className={`mt-4 rounded-lg px-3.5 py-2.5 text-sm ${
              msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  )
}
