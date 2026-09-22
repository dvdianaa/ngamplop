// components/RegionFilterDropdown.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@/components/icons'
import { toTitleCase } from '@/lib/format'

export default function RegionFilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const q = value.trim().toUpperCase()
  const filteredOptions = q === '' ? options : options.filter((d) => d.toUpperCase().includes(q))

  return (
    <div className="relative flex-1 min-w-[120px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-emerald-700 text-copper-500 font-semibold rounded-xl pl-3.5 pr-3 py-2.5 text-[13.5px]"
      >
        <span className="truncate">{value ? toTitleCase(value) : 'Semua daerah'}</span>
        <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full min-w-[180px] bg-white border border-ivory-200 rounded-xl shadow-hero overflow-hidden">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cari daerah..."
            className="w-full px-3.5 py-2.5 text-[13.5px] border-b border-ivory-100 outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-ivory-50 transition-colors"
            >
              Semua daerah
            </button>
            {filteredOptions.length === 0 && (
              <div className="px-3.5 py-2 text-[13px] text-ivory-400">Nggak ketemu</div>
            )}
            {filteredOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onChange(d)
                  setOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-ivory-50 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
