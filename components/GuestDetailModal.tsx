// components/GuestDetailModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { GuestPublic, SIDE_LABELS } from '@/lib/types'
import { LockIcon, PencilIcon, TrashIcon, GiftIcon } from '@/components/icons'

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function GuestDetailModal({
  guest,
  editable,
  onClose,
  onEdit,
  onDeleted,
}: {
  guest: GuestPublic
  editable: boolean
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleConfirmDelete() {
    setDeleting(true)
    setErrorMsg(null)
    const { error } = await supabase.from('guests').delete().eq('id', guest.id)
    if (error) {
      setErrorMsg(error.message)
      setDeleting(false)
      return
    }
    onDeleted()
    onClose()
  }

  const rtRw = [guest.rt && `RT ${guest.rt}`, guest.rw && `RW ${guest.rw}`].filter(Boolean).join(' / ')

  const rows: [string, string | null][] = [
    ['Pihak', SIDE_LABELS[guest.side]],
    ['Alias', guest.alias],
    ['Daerah', guest.address],
    ['Alamat lengkap', guest.full_address],
    ['RT/RW', rtRw || null],
    ['Desa/Kelurahan', guest.village],
    ['Kecamatan', guest.subdistrict],
    ['Kabupaten/Kota', guest.district],
    ['No. HP', guest.phone],
    ['Catatan', guest.notes],
  ]

  return (
    <div
      className="fixed inset-0 z-[100] bg-emerald-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-[420px] max-h-[85vh] overflow-y-auto bg-white rounded-[24px] p-7 shadow-hero">
        <button onClick={onClose} className="float-right text-2xl text-ivory-400 hover:text-ivory-900 transition-colors" aria-label="Tutup">
          &times;
        </button>
        <p className="font-heading font-bold text-[24px] text-emerald-700 mb-1">{guest.guest_name}</p>
        <p className="text-ivory-600 text-sm mb-5">Detail tamu.</p>

        <div className="mb-5">
          {guest.amount_hidden ? (
            <div className="font-body font-bold text-[28px] text-emerald-700 inline-flex items-center gap-2">
              <LockIcon className="w-6 h-6" />
              Login buat lihat nominal
            </div>
          ) : (
            <>
              {guest.amount && guest.amount > 0 ? (
                <div className="font-body font-bold text-[28px] text-emerald-700">{formatRupiah(guest.amount)}</div>
              ) : !guest.gift_item ? (
                <div className="font-body font-bold text-[28px] text-emerald-700">Rp 0</div>
              ) : null}
              {guest.gift_item && (
                <div className="flex items-center gap-1.5 text-[15px] text-copper-700 font-semibold mt-1">
                  <GiftIcon className="w-4 h-4 flex-shrink-0" />
                  {guest.gift_item}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <div className="text-[11px] text-ivory-600 uppercase tracking-wide">{label}</div>
                <div className="text-[15px]">{value}</div>
              </div>
            ))}
        </div>

        {editable && (
          <div className="mt-6 pt-5 border-t border-ivory-100">
            {!confirmingDelete ? (
              <div className="flex gap-2.5">
                <button
                  onClick={onEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-500 transition-colors text-copper-500 rounded-xl py-3 font-bold"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-xl py-3 font-bold"
                >
                  <TrashIcon className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-ivory-900 mb-3">
                  Yakin mau hapus data <span className="font-semibold">{guest.guest_name}</span>? Aksi ini nggak bisa dibatalkan.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="flex-1 border border-ivory-200 rounded-xl py-3 font-semibold text-sm hover:bg-ivory-50 transition-colors disabled:opacity-60"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-500 transition-colors text-white rounded-xl py-3 font-bold disabled:opacity-60"
                  >
                    {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="mt-3 rounded-lg px-3.5 py-2.5 text-sm bg-red-50 text-red-600">{errorMsg}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
