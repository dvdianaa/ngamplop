// components/GuestCard.tsx
import { GuestPublic, SIDE_LABELS } from '@/lib/types'
import { EyeIcon, LockIcon, GiftIcon } from '@/components/icons'

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const SIDE_DOT: Record<string, string> = {
  dvdianaa: 'bg-copper-500',
  sahlan: 'bg-emerald-500',
}

export default function GuestCard({
  g,
  index,
  editable,
  onView,
}: {
  g: GuestPublic
  index: number
  editable?: boolean
  onView?: () => void
}) {
  const initial = (g.guest_name || '?')[0].toUpperCase()
  const isEven = index % 2 === 0

  return (
    <div
      className="fade-up relative bg-white border border-ivory-200 rounded-2xl px-4 py-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 shadow-card hover:border-copper-300 transition-colors"
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-[180px]">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-heading font-bold text-lg flex-shrink-0 ${
            isEven ? 'bg-copper-100 text-emerald-700' : 'bg-emerald-700 text-copper-500'
          }`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] truncate">
            {g.guest_name}
            {g.alias && <span className="font-normal text-ivory-600 text-[13px]"> ({g.alias})</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[12.5px] text-ivory-600 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SIDE_DOT[g.side]}`} />
            <span className="truncate">{[g.address, SIDE_LABELS[g.side]].filter(Boolean).join(' · ')}</span>
          </div>
          {g.full_address && (
            <div className="text-[12px] text-ivory-400 truncate mt-0.5">{g.full_address}</div>
          )}
        </div>
      </div>

      <div className={`flex items-center flex-shrink-0 ml-auto ${editable ? 'pr-10' : ''}`}>
        {g.amount_hidden ? (
          <span className="text-xs font-semibold text-ivory-600 bg-ivory-100 rounded-full px-3 py-1.5 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
            <LockIcon className="w-3 h-3" />
            Login
          </span>
        ) : (
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            {g.amount && g.amount > 0 ? (
              <div className="font-body font-bold text-[17px] text-emerald-700 whitespace-nowrap">
                {formatRupiah(g.amount)}
              </div>
            ) : !g.gift_item ? (
              <div className="font-body font-bold text-[17px] text-emerald-700 whitespace-nowrap">Rp 0</div>
            ) : null}
            {g.gift_item && (
              <div className="flex items-center gap-1 text-[11.5px] text-copper-700 font-semibold whitespace-nowrap max-w-[160px] truncate">
                <GiftIcon className="w-3 h-3 flex-shrink-0" />
                {g.gift_item}
              </div>
            )}
          </div>
        )}
      </div>
      {editable && (
        <button
          onClick={onView}
          aria-label="Lihat detail"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-ivory-600 hover:bg-ivory-100 hover:text-emerald-700 transition-colors"
        >
          <EyeIcon className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  )
}
