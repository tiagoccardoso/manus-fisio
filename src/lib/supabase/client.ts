import { createClient } from '@supabase/supabase-js'
import { createMockSupabaseClient } from './mock-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasValidCredentials = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('mock') &&
  !supabaseAnonKey.includes('mock')
)

// Cria e exporta uma instância única do cliente Supabase para o lado do cliente.
export const supabase: any = hasValidCredentials
  ? createClient<any>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMockSupabaseClient()
