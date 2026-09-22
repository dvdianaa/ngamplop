// lib/types.ts
export type Side = 'dvdianaa' | 'sahlan'

export const SIDE_LABELS: Record<Side, string> = {
  dvdianaa: 'dvdianaa',
  sahlan: 'sahlan',
}

export interface GuestPublic {
  id: number
  side: Side
  guest_name: string
  alias: string | null
  address: string | null
  full_address: string | null
  rt: string | null
  rw: string | null
  village: string | null
  subdistrict: string | null
  district: string | null
  phone: string | null
  amount: number | null
  amount_hidden: boolean
  gift_item: string | null
  notes: string | null
  event_date: string | null
  recorded_at: string
  updated_at: string
}

export interface TopDaerah {
  alamat: string
  orang: number
  uang: number
}

export interface DashboardStats {
  total_guests: number
  total_amount: number
  total_daerah: number
  top_daerah: TopDaerah[]
}
