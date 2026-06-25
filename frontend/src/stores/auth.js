import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.user_metadata?.full_name || state.user?.email?.split('@')[0] || 'User',
    userRole: (state) => state.user?.role || 'viewer',
  },

  actions: {
    async init() {
      // Get the initial session
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session

      if (session?.user) {
        await this.fetchUser(session)
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        if (event === 'SIGNED_IN' && session?.user) {
          this.fetchUser(session)
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          this.user = null
          this.session = null
          router.push('/login')
        }
      })

      this.initialized = true
    },

    async fetchUser(session) {
      // Try to get user details from the Django backend using the Supabase token
      try {
        const api = (await import('@/services/api')).default
        const { data } = await api.get('/me/', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        this.user = { ...session.user, ...data }
      } catch {
        // Fall back to Supabase user metadata
        this.user = session?.user || null
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        this.session = data.session
        this.user = data.user
        return data
      } catch (error) {
        this.error = error.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithProvider(provider) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin + '/dashboard',
          },
        })
        if (error) throw error
        return data
      } catch (error) {
        this.error = error.message || 'OAuth login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signUp({ email, password, fullName }) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        return data
      } catch (error) {
        this.error = error.message || 'Sign up failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Logout error:', error)
      this.user = null
      this.session = null
      router.push('/login')
    },

    async resetPassword(email) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        })
        if (error) throw error
      } catch (error) {
        this.error = error.message || 'Password reset failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
