<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 relative overflow-hidden p-4">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/5 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-300/5 blur-3xl" />
    </div>

    <div
      class="relative w-full max-w-md"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }"
    >
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/20 mx-auto mb-4">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Welcome back</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">Sign in to your analytics dashboard</p>
      </div>

      <!-- Login Card -->
      <div class="glass-card p-8">
        <!-- Error Banner -->
        <div
          v-if="authStore.error"
          class="flex items-center gap-3 p-4 mb-6 rounded-xl bg-danger-50 dark:bg-danger-500/15 border border-danger-100 dark:border-danger-800/50"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
        >
          <svg class="w-5 h-5 text-danger-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-danger-600 dark:text-danger-400">{{ authStore.error }}</p>
          <button @click="authStore.clearError()" class="ml-auto text-danger-400 dark:text-danger-500 hover:text-danger-600 dark:hover:text-danger-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="admin"
              class="input-field"
              :class="{ 'border-danger-300 focus:ring-danger-500/30 focus:border-danger-500': errors.username }"
              required
            />
            <p v-if="errors.username" class="text-xs text-danger-500 mt-1">{{ errors.username }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="input-field"
              :class="{ 'border-danger-300 focus:ring-danger-500/30 focus:border-danger-500': errors.password }"
              required
            />
            <p v-if="errors.password" class="text-xs text-danger-500 mt-1">{{ errors.password }}</p>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500/30 dark:focus:ring-primary-400/30" />
              <span class="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
            </label>
            <a href="#" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="btn-primary w-full py-3"
            :disabled="authStore.loading"
          >
            <svg v-if="authStore.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-surface-500 dark:text-surface-400">
            Don't have an account?
            <a href="#" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Contact admin</a>
          </p>
        </div>

        <!-- Demo credentials hint -->
        <div class="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
          <p class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Demo Credentials</p>
          <p class="text-xs text-surface-500 dark:text-surface-400">Username: <span class="font-mono text-surface-600 dark:text-surface-300">admin</span></p>
          <p class="text-xs text-surface-500 dark:text-surface-400">Password: <span class="font-mono text-surface-600 dark:text-surface-300">demo1234</span></p>
        </div>
      </div>

      <!-- Back link -->
      <div class="text-center mt-8">
        <router-link to="/" class="inline-flex items-center gap-1 text-sm text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const errors = reactive({ username: '', password: '' })

async function handleLogin() {
  errors.username = ''
  errors.password = ''

  if (!username.value) errors.username = 'Username is required'
  if (!password.value) errors.password = 'Password is required'
  if (errors.username || errors.password) return

  try {
    await authStore.login({ username: username.value, password: password.value })
  } catch {
    // Error is handled by the store
  }
}
</script>
