import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const hasValidSupabaseBrowserCredentials = () =>
  Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('https://') &&
      supabaseUrl.includes('.supabase.co') &&
      supabaseAnonKey.length > 20 &&
      !supabaseUrl.includes('mock') &&
      !supabaseAnonKey.includes('mock')
  )

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
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
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

// Instância única usada no navegador. Quando as variáveis de ambiente estão
// ausentes/inválidas no deploy, usamos um mock seguro em vez de inicializar um
// cliente apontando para localhost, o que causava exceções no carregamento.
export const supabase: any = hasValidSupabaseBrowserCredentials()
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : createMockSupabaseClient()
