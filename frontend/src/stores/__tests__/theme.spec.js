import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
  })

  it('starts in light mode with default state', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
  })

  it('reads dark preference from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    expect(store.isDark).toBe(true)
  })

  it('reads light preference from localStorage', () => {
    localStorage.setItem('theme', 'light')
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
  })

  it('toggle() switches the isDark flag', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(false)
    store.toggle()
    expect(store.isDark).toBe(true)
    store.toggle()
    expect(store.isDark).toBe(false)
  })

  it('toggle() persists to localStorage', () => {
    const store = useThemeStore()
    store.toggle()
    expect(localStorage.getItem('theme')).toBe('dark')
    store.toggle()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle() applies dark class to document', () => {
    const store = useThemeStore()
    store.toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    store.toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme(true) enables dark mode', () => {
    const store = useThemeStore()
    store.setTheme(true)
    expect(store.isDark).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme(false) enables light mode', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    expect(store.isDark).toBe(true)

    store.setTheme(false)
    expect(store.isDark).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('init() applies the stored theme and sets up system listener', () => {
    const store = useThemeStore()
    store.isDark = true
    store.init()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
