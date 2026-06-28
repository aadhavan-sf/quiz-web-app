import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined

/** Supports legacy anon key or Supabase publishable key naming. */
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

function createClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl!, supabaseKey!)
}

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient() : null

/** Browser Supabase client (Vite SPA). Use this if you need a fresh reference. */
export { createClient }
