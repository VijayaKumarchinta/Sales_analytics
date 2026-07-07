import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a stub that logs warnings when Supabase isn't configured
// This prevents the app from crashing on missing credentials
function createStubClient() {
  const warn = (method) =>
    console.warn(
      `Supabase: ${method}() called but Supabase is not configured. ` +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    )

  return {
    auth: {
      getSession: () => {
        warn('getSession')
        return Promise.resolve({ data: { session: null }, error: null })
      },
      signInWithPassword: () => {
        warn('signInWithPassword')
        return Promise.resolve({
          data: { session: null, user: null },
          error: { message: 'Supabase not configured' },
        })
      },
      signInWithOAuth: () => {
        warn('signInWithOAuth')
        return Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      },
      signUp: () => {
        warn('signUp')
        return Promise.resolve({
          data: { user: null, session: null },
          error: { message: 'Supabase not configured' },
        })
      },
      signOut: () => {
        warn('signOut')
        return Promise.resolve({ error: null })
      },
      resetPasswordForEmail: () => {
        warn('resetPasswordForEmail')
        return Promise.resolve({ data: {}, error: null })
      },
      onAuthStateChange: () => {
        warn('onAuthStateChange')
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
  }
}

let supabase

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    )
    supabase = createStubClient()
  } else {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storageKey: 'sales-analytics-auth',
        autoRefreshToken: true,
      },
    })
  }
} catch (e) {
  console.warn('Failed to initialize Supabase client:', e.message)
  supabase = createStubClient()
}

export { supabase }
