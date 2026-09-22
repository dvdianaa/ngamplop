// components/GuestFormModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { GuestPublic, SIDE_LABELS, Side } from '@/lib/types'
import { LockIcon } from '@/components/icons'

export default function GuestFormModal({
  guest,
  lockedSide,
  onClose,
  onSaved,
}: {
  guest?: GuestPublic
  lockedSide?: Side
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!guest

  const [side, setSide] = useState<Side>(lockedSide || guest?.side || 'dvdianaa')
  const [guestName, setGuestName] = useState(guest?.guest_name || '')
  const [alias, setAlias] = useState(guest?.alias || '')
  const [address, setAddress] = useState(guest?.address || '')
  const [fullAddress, setFullAddress] = useState(guest?.full_address || '')
  const [rt, setRt] = useState(guest?.rt || '')
  const [rw, setRw] = useState(guest?.rw || '')
  const [village, setVillage] = useState(guest?.village || '')
  const [subdistrict, setSubdistrict] = useState(guest?.subdistrict || '')
  const [district, setDistrict] = useState(guest?.district || '')
  const [amount, setAmount] = useState(guest?.amount != null ? String(guest.amount) : '')
  const [giftItem, setGiftItem] = useState(guest?.gift_item || '')
  const [notes, setNotes] = useState(guest?.notes || '')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!guestName.trim()) {
      setErrorMsg('Nama tamu wajib diisi.')
      return
    }
    setSaving(true)
    setErrorMsg(null)
    try {
      const payload = {
        side,
        guest_name: guestName.trim(),
        alias: alias.trim() || null,
        address: address.trim() || null,
        full_address: fullAddress.trim() || null,
        rt: rt.trim() || null,
        rw: rw.trim() || null,
        village: village.trim() || null,
        subdistrict: subdistrict.trim() || null,
        district: district.trim() || null,
        amount: amount.trim() === '' ? null : Number(amount),
        gift_item: giftItem.trim() || null,
        notes: notes.trim() || null,
      }
      const { error } = isEdit
        ? await supabase.from('guests').update(payload).eq('id', guest.id)
        : await supabase.from('guests').insert(payload)
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
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
        <p className="font-heading font-bold text-[24px] text-emerald-700 mb-1">{isEdit ? 'Edit Tamu' : 'Tambah Tamu'}</p>
        <p className="text-ivory-600 text-sm mb-6">
          {isEdit ? 'Ubah data sumbangan tamu.' : 'Catat sumbangan tamu baru.'}
        </p>

        <label className="block text-sm font-semibold mb-1.5">Nama tamu</label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Alias</label>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Pihak</label>
        {lockedSide ? (
          <div className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-100 text-ivory-600 mb-3.5 flex items-center gap-2">
            <LockIcon className="w-4 h-4 flex-shrink-0" />
            {SIDE_LABELS[lockedSide]}
          </div>
        ) : (
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as Side)}
            className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
          >
            {(Object.keys(SIDE_LABELS) as Side[]).map((s) => (
              <option key={s} value={s}>{SIDE_LABELS[s]}</option>
            ))}
          </select>
        )}

        <label className="block text-sm font-semibold mb-1.5">Daerah</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Alamat lengkap</label>
        <input
          type="text"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1.5">RT</label>
            <input
              type="text"
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 focus:outline-none focus:ring-2 focus:ring-copper-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1.5">RW</label>
            <input
              type="text"
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 focus:outline-none focus:ring-2 focus:ring-copper-300"
            />
          </div>
        </div>

        <label className="block text-sm font-semibold mb-1.5">Desa/Kelurahan</label>
        <input
          type="text"
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Kecamatan</label>
        <input
          type="text"
          value={subdistrict}
          onChange={(e) => setSubdistrict(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Kabupaten/Kota</label>
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Nominal (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Barang (kalau bukan uang)</label>
        <input
          type="text"
          value={giftItem}
          onChange={(e) => setGiftItem(e.target.value)}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 mb-3.5 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <label className="block text-sm font-semibold mb-1.5">Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-ivory-200 rounded-xl px-3.5 py-3 text-[15px] bg-ivory-50 focus:outline-none focus:ring-2 focus:ring-copper-300"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-700 hover:bg-emerald-500 transition-colors text-copper-500 rounded-xl py-3.5 font-bold mt-4 disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah'}
        </button>

        {errorMsg && (
          <div className="mt-4 rounded-lg px-3.5 py-2.5 text-sm bg-red-50 text-red-600">{errorMsg}</div>
        )}
      </div>
    </div>
  )
}
