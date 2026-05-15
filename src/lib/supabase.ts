import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { supabase, hasValidSupabaseBrowserCredentials } from '@/lib/supabase/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const createMockQueryBuilder = () => {
  const emptyResult = Promise.resolve({ data: [], error: null, count: 0 })
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    in: () => builder,
    is: () => builder,
    not: () => builder,
    or: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
      emptyResult.then(resolve, reject),
    catch: (reject: (reason?: unknown) => unknown) => emptyResult.catch(reject),
    finally: (onFinally?: () => void) => emptyResult.finally(onFinally),
  }

  return builder
}

const createMockSupabaseClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
  },
  from: () => createMockQueryBuilder(),
  channel: () => ({
    on: function () { return this },
    subscribe: () => ({ unsubscribe: () => undefined }),
    unsubscribe: () => Promise.resolve('ok'),
  }),
  removeChannel: () => Promise.resolve('ok'),
  removeAllChannels: () => Promise.resolve([]),
})

export { supabase }
export type SupabaseClient = typeof supabase

export const isMockMode = () => !hasValidSupabaseBrowserCredentials()

export const supabaseAdmin: any =
  typeof window === 'undefined' && hasValidSupabaseBrowserCredentials() && serviceRoleKey
    ? createClient<Database>(supabaseUrl!, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : createMockSupabaseClient()

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return Boolean(session?.user)
}

export const getCurrentUserPrincipal = getCurrentUser
export const signOutPrincipal = signOut
export const isAuthenticatedPrincipal = isAuthenticated
