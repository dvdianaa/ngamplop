// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

// GANTI 2 BARIS INI dengan punya kamu (Project Settings > API di Supabase)
const SUPABASE_URL = 'https://sptldzcamdrdfqayhruf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DBdbG9reb1CBYeaW4jElXw_FxEoOqoF'

export const isConfigured =
  !SUPABASE_URL.includes('PASTE_PROJECT_URL') && !SUPABASE_ANON_KEY.includes('PASTE_ANON_PUBLIC_KEY')

export const supabase = createClient(
  isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigured ? SUPABASE_ANON_KEY : 'placeholder-anon-key'
)
