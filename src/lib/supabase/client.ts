import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-for-build'

// Cria e exporta uma instância única do cliente Supabase para o lado do cliente.
// createBrowserClient sincroniza a sessão em cookies, permitindo que o middleware
// SSR reconheça o usuário após o login e não o redirecione de volta para /auth/login.
export const supabase: any = createBrowserClient(supabaseUrl, supabaseAnonKey)
