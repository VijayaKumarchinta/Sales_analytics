import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock the API service
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    me: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
  },
}))

import { authAPI } from '@/services/api'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts with unauthenticated state', () => {
    const store = useAuthStore()
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('reads token from localStorage on init', () => {
    localStorage.setItem('access_token', 'test-token-123')
    localStorage.setItem('refresh_token', 'test-refresh-456')
    const store = useAuthStore()
    expect(store.token).toBe('test-token-123')
    expect(store.refreshToken).toBe('test-refresh-456')
    expect(store.isAuthenticated).toBe(true)
  })

  it('getter userName returns User when no user is set', () => {
    const store = useAuthStore()
    expect(store.userName).toBe('User')
  })

  it('getter userName returns user name when available', () => {
    const store = useAuthStore()
    store.user = { name: 'Alice', role: 'admin' }
    expect(store.userName).toBe('Alice')
  })

  it('getter userRole returns viewer when no user is set', () => {
    const store = useAuthStore()
    expect(store.userRole).toBe('viewer')
  })

  it('getter userRole returns the user role', () => {
    const store = useAuthStore()
    store.user = { name: 'Bob', role: 'analyst' }
    expect(store.userRole).toBe('analyst')
  })

  it('getter isAdmin returns true only for admin role', () => {
    const store = useAuthStore()
    expect(store.isAdmin).toBe(false)

    store.user = { role: 'viewer' }
    expect(store.isAdmin).toBe(false)

    store.user = { role: 'admin' }
    expect(store.isAdmin).toBe(true)
  })

  it('login() sets tokens and calls fetchUser on success', async () => {
    authAPI.login.mockResolvedValue({
      data: { access: 'new-access', refresh: 'new-refresh' },
    })
    authAPI.me.mockResolvedValue({
      data: { id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin' },
    })

    const store = useAuthStore()
    await store.login({ email: 'alice@test.com', password: 'password' })

    expect(store.token).toBe('new-access')
    expect(store.refreshToken).toBe('new-refresh')
    expect(store.user?.name).toBe('Alice')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(localStorage.getItem('access_token')).toBe('new-access')
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh')
  })

  it('login() sets error and throws on failure', async () => {
    authAPI.login.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } },
    })

    const store = useAuthStore()
    await expect(store.login({ email: 'bad@user.com', password: 'wrong' })).rejects.toThrow()

    expect(store.error).toBe('Invalid credentials')
    expect(store.loading).toBe(false)
    expect(store.token).toBeNull()
  })

  it('login() handles network errors gracefully', async () => {
    authAPI.login.mockRejectedValue(new Error('Network Error'))

    const store = useAuthStore()
    await expect(store.login({ email: 'test@test.com', password: 'pw' })).rejects.toThrow()

    expect(store.error).toBe('Login failed. Please check your credentials.')
    expect(store.loading).toBe(false)
  })

  it('logout() clears all auth state and localStorage', () => {
    localStorage.setItem('access_token', 'token')
    localStorage.setItem('refresh_token', 'refresh')
    const store = useAuthStore()
    store.user = { name: 'Test' }

    store.logout()

    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('clearError() resets the error state', () => {
    const store = useAuthStore()
    store.error = 'Some error'
    store.clearError()
    expect(store.error).toBeNull()
  })

  it('fetchUser() sets user on success', async () => {
    authAPI.me.mockResolvedValue({
      data: { id: 1, name: 'Charlie', role: 'viewer' },
    })

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.user?.name).toBe('Charlie')
  })

  it('fetchUser() calls logout on failure', async () => {
    authAPI.me.mockRejectedValue(new Error('Unauthorized'))

    const store = useAuthStore()
    store.user = { name: 'WillBeCleared' }
    store.token = 'some-token'

    await store.fetchUser()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })
})
