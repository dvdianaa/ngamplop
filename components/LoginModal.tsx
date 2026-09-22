// components/LoginModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function LoginModal({ onClose }: { onClose: () => void }) {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onClose()
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Terjadi kesalahan.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-emerald-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-[420px] max-h-[85vh] overflow-y-auto bg-white rounded-[24px] p-7 shadow-hero">
        <button onClick={onClose} className="float-right text-2xl text-ivory-400 hover:text-ivory-900 transition-colors" aria-label="Tutup">
          &times;
        </button>
        <p className="font-heading font-bold text-[24px] text-emerald-700 mb-1">Masuk</p>
        <p className="text-ivory-600 text-sm mb-6">Buat lihat nominal sumbangan sisi Dvdianaa.</p>

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
          placeholder="Kata sandi kamu"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-500 transition-colors text-copper-500 rounded-xl py-3.5 font-bold mt-4 disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Masuk'}
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
