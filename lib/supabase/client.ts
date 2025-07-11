import { createBrowserClient } from "@supabase/ssr"
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!
  )
} 