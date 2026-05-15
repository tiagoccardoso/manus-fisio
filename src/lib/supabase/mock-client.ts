type MockResponse<T = any> = {
  data: T
  error: null
  count?: number
}

const emptyListResponse: MockResponse<any[]> = {
  data: [],
  error: null,
  count: 0,
}

const emptySingleResponse: MockResponse<null> = {
  data: null,
  error: null,
  count: 0,
}

class MockQueryBuilder implements PromiseLike<MockResponse<any[]>> {
  select() {
    return this
  }

  insert() {
    return this
  }

  update() {
    return this
  }

  upsert() {
    return this
  }

  delete() {
    return this
  }

  eq() {
    return this
  }

  neq() {
    return this
  }

  in() {
    return this
  }

  or() {
    return this
  }

  ilike() {
    return this
  }

  textSearch() {
    return this
  }

  gte() {
    return this
  }

  lte() {
    return this
  }

  gt() {
    return this
  }

  lt() {
    return this
  }

  order() {
    return this
  }

  limit() {
    return this
  }

  range() {
    return this
  }

  single() {
    return Promise.resolve(emptySingleResponse)
  }

  maybeSingle() {
    return Promise.resolve(emptySingleResponse)
  }

  then<TResult1 = MockResponse<any[]>, TResult2 = never>(
    onfulfilled?: ((value: MockResponse<any[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(emptyListResponse).then(onfulfilled, onrejected)
  }
}

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => new MockQueryBuilder(),
  rpc: () => Promise.resolve(emptySingleResponse),
  channel: () => ({
    on: function on() {
      return this
    },
    subscribe: () => ({ unsubscribe: () => {} }),
    unsubscribe: () => Promise.resolve('ok'),
  }),
  removeChannel: () => Promise.resolve('ok'),
}) as any
