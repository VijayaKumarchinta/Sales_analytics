import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Register @vueuse/motion plugin globally for tests so v-motion works in mounts
config.global.plugins = [MotionPlugin]

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useRoute: () => ({
    name: 'Dashboard',
    path: '/dashboard',
    meta: {},
  }),
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    push: vi.fn(),
  })),
  createWebHistory: vi.fn(),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

// Set up document.documentElement for theme tests
document.documentElement.classList.remove('dark')
