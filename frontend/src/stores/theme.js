import { defineStore } from 'pinia'

function getInitialDark() {
  const stored = localStorage.getItem('theme')
  if (stored !== null) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: getInitialDark(),
  }),

  actions: {
    _syncTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },

    init() {
      this._syncTheme()
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
          this.isDark = e.matches
          this._syncTheme()
        }
      })
    },

    toggle() {
      this.isDark = !this.isDark
      this._syncTheme()
    },

    setTheme(dark) {
      this.isDark = dark
      this._syncTheme()
    },
  },
})
