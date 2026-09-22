// app/page.tsx
'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase, isConfigured } from '@/lib/supabase/client'
import { GuestPublic, DashboardStats, SIDE_LABELS, Side } from '@/lib/types'
import GuestCard from '@/components/GuestCard'
import LoginModal from '@/components/LoginModal'
import GuestFormModal from '@/components/GuestFormModal'
import GuestDetailModal from '@/components/GuestDetailModal'
import RegionFilterDropdown from '@/components/RegionFilterDropdown'
import { LockIcon, ChevronDownIcon } from '@/components/icons'
import { toTitleCase } from '@/lib/format'

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const PAGE_SIZE = 20

export default function HomePage() {
  const [guests, setGuests] = useState<GuestPublic[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [session, setSession] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [viewingGuest, setViewingGuest] = useState<GuestPublic | null>(null)
  const [editingGuest, setEditingGuest] = useState<GuestPublic | null>(null)
  const [showAddGuest, setShowAddGuest] = useState(false)

  const [search, setSearch] = useState('')
  const [sideFilter, setSideFilter] = useState('')
  const [daerahFilter, setDaerahFilter] = useState('')
  const [sortMode, setSortMode] = useState<'nama' | 'jumlah_desc' | 'jumlah_asc' | 'daerah'>('nama')
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      async function fetchAllGuests() {
        const CHUNK = 1000
        let all: GuestPublic[] = []
        let from = 0
        while (true) {
          const { data, error } = await supabase
            .from('guests_public')
            .select('*')
            .order('recorded_at', { ascending: false })
            .range(from, from + CHUNK - 1)
          if (error) throw error
          all = all.concat((data as GuestPublic[]) || [])
          if (!data || data.length < CHUNK) break
          from += CHUNK
        }
        return all
      }

      const [allGuests, statsRes] = await Promise.all([fetchAllGuests(), supabase.rpc('get_dashboard_stats')])
      if (statsRes.error) throw statsRes.error
      setGuests(allGuests)
      setStats(statsRes.data as DashboardStats)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session))
    loadData()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sessionData) => {
      setSession(!!sessionData)
      loadData()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadData])

  const daerahOptions = useMemo(() => {
    const map = new Map<string, string>()
    guests.forEach((g) => {
      const raw = (g.address || '').trim()
      if (!raw) return
      const key = raw.toUpperCase()
      if (!map.has(key)) map.set(key, toTitleCase(raw))
    })
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b))
  }, [guests])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = guests.filter((g) => {
      const nameMatch = g.guest_name.toLowerCase().includes(q) || (g.alias || '').toLowerCase().includes(q)
      const sideMatch = sideFilter === '' || g.side === sideFilter
      const daerahMatch = daerahFilter.trim() === '' || (g.address || '').toUpperCase().includes(daerahFilter.trim().toUpperCase())
      return nameMatch && sideMatch && daerahMatch
    })
    list = [...list].sort((a, b) => {
      if (sortMode === 'nama') return a.guest_name.localeCompare(b.guest_name)
      if (sortMode === 'daerah') return (a.address || '').localeCompare(b.address || '')
      if (sortMode === 'jumlah_desc') return (b.amount || 0) - (a.amount || 0)
      return (a.amount || 0) - (b.amount || 0)
    })
    return list
  }, [guests, search, sideFilter, daerahFilter, sortMode])

  useEffect(() => {
    setPage(1)
  }, [search, sideFilter, daerahFilter, sortMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const filteredTotal = useMemo(() => filtered.reduce((sum, g) => sum + (g.amount || 0), 0), [filtered])
  const rataRata = filtered.length > 0 ? Math.round(filteredTotal / filtered.length) : 0
  const terbesar = useMemo(() => filtered.reduce((m, g) => Math.max(m, g.amount || 0), 0), [filtered])
  const daerahCount = useMemo(() => {
    const set = new Set(filtered.map((g) => (g.address || '').toUpperCase()).filter(Boolean))
    return set.size
  }, [filtered])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (!isConfigured) {
    return (
      <div className="p-10 font-body max-w-lg mx-auto mt-20 bg-white border border-ivory-200 rounded-2xl">
        <p className="font-heading font-bold text-xl text-emerald-700 mb-2">Belum diatur</p>
        <p className="text-ivory-600 text-sm">
          Isi <code className="bg-ivory-100 px-1.5 py-0.5 rounded">SUPABASE_URL</code> dan{' '}
          <code className="bg-ivory-100 px-1.5 py-0.5 rounded">SUPABASE_ANON_KEY</code> di{' '}
          <code className="bg-ivory-100 px-1.5 py-0.5 rounded">lib/supabase/client.ts</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="lg:flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen w-64 flex-shrink-0 bg-emerald-700 text-ivory-100 p-7 overflow-y-auto">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-9 h-9 rounded-xl bg-copper-500 text-emerald-700 flex items-center justify-center font-heading font-bold text-lg">
            N
          </span>
          <span className="font-heading font-semibold text-xl">Ngamplop</span>
        </div>
        <p className="text-emerald-300 text-[12.5px] mt-1">Buku tamu hajatan</p>

        <div className="mt-auto pt-6 border-t border-copper-300/20">
          {session ? (
            <button
              onClick={handleLogout}
              className="w-full text-sm font-semibold text-copper-500 border border-copper-500/40 rounded-xl py-2.5 hover:bg-copper-500/10 transition-colors"
            >
              Keluar
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full text-sm font-semibold bg-copper-500 text-emerald-900 rounded-xl py-2.5 hover:bg-copper-300 transition-colors"
            >
              Masuk
            </button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden bg-emerald-700 text-ivory-100 px-5 flex items-center justify-between"
        style={{ paddingTop: 'calc(env(safe-area-inset-top,0px) + 16px)', paddingBottom: 16 }}
      >
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-copper-500 text-emerald-700 flex items-center justify-center font-heading font-bold">
            N
          </span>
          <span className="font-heading font-semibold text-lg">Ngamplop</span>
        </div>
        {session ? (
          <button onClick={handleLogout} className="text-sm font-semibold text-copper-500 border border-copper-500/40 rounded-full px-4 py-1.5">
            Keluar
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-sm font-semibold text-copper-500 border border-copper-500/40 rounded-full px-4 py-1.5">
            Masuk
          </button>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-5 lg:px-10 py-6 lg:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[12.5px] text-ivory-600 tracking-wide mb-1">BUKU TAMU</div>
              <h1 className="font-heading font-bold text-[28px] lg:text-[32px] text-emerald-700">Daftar Sumbangan</h1>
            </div>
            <button
              onClick={() => setShowAddGuest(true)}
              className="self-start sm:self-auto flex-shrink-0 text-sm font-semibold bg-copper-500 text-emerald-900 rounded-xl px-4 py-2.5 hover:bg-copper-300 transition-colors"
            >
              + Tambah Tamu
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-[3px] border-ivory-200 border-t-copper-500 rounded-full animate-spin" />
            </div>
          )}

          {errorMsg && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">{errorMsg}</div>}

          {!loading && !errorMsg && (
            <>
              {/* Hero + mini stats */}
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <div className="bezel lg:col-span-2 bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-[22px] p-7 text-ivory-100 relative overflow-hidden shadow-hero">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="motif-ring absolute -right-8 -top-8">
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#C08A4E" strokeWidth="1.5" />
                    <circle cx="80" cy="80" r="50" fill="none" stroke="#C08A4E" strokeWidth="1.5" />
                    <circle cx="80" cy="80" r="32" fill="none" stroke="#C08A4E" strokeWidth="1.5" />
                  </svg>
                  <div className="text-[13px] opacity-80 mb-2 relative">Total Terkumpul</div>
                  {session ? (
                    <div className="font-body font-bold text-[34px] lg:text-[38px] relative">
                      {formatRupiah(filteredTotal)}
                    </div>
                  ) : (
                    <div className="font-body font-semibold text-[17px] relative flex items-center gap-2 opacity-90">
                      <LockIcon className="w-5 h-5 flex-shrink-0" />
                      Masuk buat lihat total
                    </div>
                  )}
                  <div className="flex gap-8 border-t border-copper-300/25 pt-4 mt-5 relative">
                    <div>
                      <div className="font-heading font-bold text-[19px] text-copper-500">{filtered.length}</div>
                      <div className="text-[11.5px] opacity-75">Tamu</div>
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[19px] text-copper-500">{daerahCount}</div>
                      <div className="text-[11.5px] opacity-75">Daerah</div>
                    </div>
                  </div>
                  {!session && (
                    <div className="text-[12px] opacity-80 mt-4 relative">
                      <LockIcon className="w-3.5 h-3.5 inline-block align-[-2px] mr-1" />
                      Sebagian nominal ({SIDE_LABELS.dvdianaa}) disembunyikan.{' '}
                      <button onClick={() => setShowLogin(true)} className="underline font-semibold">
                        Masuk
                      </button>{' '}
                      buat lihat semua.
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-4">
                  <div className="flex-1 bg-white border border-ivory-200 rounded-2xl p-5 shadow-card">
                    <div className="text-[12px] text-ivory-600 mb-1.5">Rata-rata / Tamu</div>
                    {session ? (
                      <div className="font-body font-bold text-[22px] text-emerald-700">{formatRupiah(rataRata)}</div>
                    ) : (
                      <div className="font-body font-semibold text-[14px] text-emerald-700 flex items-center gap-1.5">
                        <LockIcon className="w-4 h-4 flex-shrink-0" />
                        Masuk dulu
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white border border-ivory-200 rounded-2xl p-5 shadow-card">
                    <div className="text-[12px] text-ivory-600 mb-1.5">Sumbangan Terbesar</div>
                    <div className="font-body font-bold text-[22px] text-copper-500">{formatRupiah(terbesar)}</div>
                  </div>
                </div>
              </div>

              {/* Search & filters */}
              <div className="bg-white border border-ivory-200 rounded-2xl p-4 mb-2 shadow-card">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama tamu..."
                  className="w-full text-[15.5px] bg-transparent outline-none placeholder:text-ivory-400"
                />
                <div className="flex gap-2 mt-3 flex-wrap">
                  <div className="relative flex-1 min-w-[120px]">
                    <select
                      value={sideFilter}
                      onChange={(e) => setSideFilter(e.target.value)}
                      className="appearance-none w-full bg-emerald-700 text-copper-500 font-semibold rounded-xl pl-3.5 pr-8 py-2.5 text-[13.5px]"
                    >
                      <option value="">Semua pihak</option>
                      {(Object.keys(SIDE_LABELS) as Side[]).map((s) => (
                        <option key={s} value={s}>{SIDE_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-copper-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <RegionFilterDropdown value={daerahFilter} onChange={setDaerahFilter} options={daerahOptions} />
                  <div className="relative flex-1 min-w-[120px]">
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                      className="appearance-none w-full bg-emerald-700 text-copper-500 font-semibold rounded-xl pl-3.5 pr-8 py-2.5 text-[13.5px]"
                    >
                      <option value="nama">Urut: Nama</option>
                      <option value="daerah">Urut: Daerah</option>
                      <option value="jumlah_desc">Urut: Terbesar</option>
                      <option value="jumlah_asc">Urut: Terkecil</option>
                    </select>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-copper-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="text-sm text-ivory-600 px-1 py-3">{filtered.length} tamu ditemukan</div>

              {/* Guest list + side panel */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-2.5">
                  {filtered.length === 0 && (
                    <div className="text-center py-16 bg-white border border-ivory-200 rounded-2xl">
                      <div className="font-heading font-bold text-emerald-700 text-lg mb-1">Tidak ditemukan</div>
                      <p className="text-ivory-600 text-sm">Coba kata kunci atau filter lain.</p>
                    </div>
                  )}
                  {paginated.map((g, i) => (
                    <GuestCard
                      key={g.id}
                      g={g}
                      index={i}
                      editable={session}
                      onView={() => setViewingGuest(g)}
                    />
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pageSafe <= 1}
                        className="text-sm font-semibold border border-ivory-200 rounded-lg px-3.5 py-2 hover:bg-ivory-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        ‹ Sebelumnya
                      </button>
                      <span className="text-sm text-ivory-600">Halaman {pageSafe} dari {totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={pageSafe >= totalPages}
                        className="text-sm font-semibold border border-ivory-200 rounded-lg px-3.5 py-2 hover:bg-ivory-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        Selanjutnya ›
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-ivory-200 rounded-2xl p-5 shadow-card h-fit">
                  <p className="font-heading font-bold text-emerald-700 text-[18px] mb-3">Top 5 Daerah</p>
                  {(stats?.top_daerah || []).length === 0 && (
                    <p className="text-ivory-600 text-sm">Belum ada data.</p>
                  )}
                  {(stats?.top_daerah || []).map((t, i) => (
                    <div key={t.alamat} className="flex justify-between items-center py-2.5 border-b border-ivory-100 last:border-none text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-copper-100 text-copper-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        {toTitleCase(t.alamat)}
                      </span>
                      <span className="text-ivory-600 text-xs whitespace-nowrap ml-2">
                        {t.orang}x · {formatRupiah(t.uang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {viewingGuest && (
        <GuestDetailModal
          guest={viewingGuest}
          editable={session}
          onClose={() => setViewingGuest(null)}
          onEdit={() => {
            setEditingGuest(viewingGuest)
            setViewingGuest(null)
          }}
          onDeleted={loadData}
        />
      )}
      {(editingGuest || showAddGuest) && (
        <GuestFormModal
          guest={editingGuest || undefined}
          onClose={() => {
            setEditingGuest(null)
            setShowAddGuest(false)
          }}
          onSaved={loadData}
        />
      )}
    </div>
  )
}
