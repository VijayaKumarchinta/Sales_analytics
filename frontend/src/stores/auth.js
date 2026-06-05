import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || 'User',
    userRole: (state) => state.user?.role || 'viewer',
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authAPI.login(credentials)
        this.token = data.access
        this.refreshToken = data.refresh
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        await this.fetchUser()
        router.push('/dashboard')
      } catch (error) {
        this.error = error.response?.data?.detail || 'Login failed. Please check your credentials.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      try {
        const { data } = await authAPI.me()
        this.user = data
      } catch {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
    },

    clearError() {
      this.error = null
    }
  }
})
