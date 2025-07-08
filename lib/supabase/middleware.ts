import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = (request: NextRequest, response: NextResponse) => {
  return createServerClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: CookieOptions) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        },
      },
    },
  )
} 