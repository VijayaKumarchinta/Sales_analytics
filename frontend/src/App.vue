<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()

onMounted(() => {
  themeStore.init()
  authStore.init()
})
</script>
