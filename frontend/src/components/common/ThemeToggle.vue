<template>
  <button
    @click="themeStore.toggle()"
    class="relative p-2 rounded-xl transition-all duration-300 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
    :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    v-motion="toggleMotion"
  >
    <!-- Sun icon (shown in dark mode, click to go light) -->
    <span
      v-if="themeStore.isDark"
      key="sun"
      v-motion="iconEnterMotion"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </span>
    <!-- Moon icon (shown in light mode, click to go dark) -->
    <span
      v-else
      key="moon"
      v-motion="iconEnterMotion"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const toggleMotion = {
  initial: { opacity: 0, scale: 0.8 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.2 } }
}

const iconEnterMotion = {
  initial: { opacity: 0, rotate: -90, scale: 0.5 },
  enter: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  leave: { opacity: 0, rotate: 90, scale: 0.5, transition: { duration: 0.2 } }
}
</script>
