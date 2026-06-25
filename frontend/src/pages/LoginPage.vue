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

        <!-- Success Banner (sign-up / magic link) -->
        <div
          v-if="successMessage"
          class="flex items-center gap-3 p-4 mb-6 rounded-xl bg-success-50 dark:bg-success-500/15 border border-success-100 dark:border-success-800/50"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
        >
          <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-success-600 dark:text-success-400">{{ successMessage }}</p>
        </div>

        <!-- Login Form -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="input-field"
              :class="{ 'border-danger-300 focus:ring-danger-500/30 focus:border-danger-500': errors.email }"
              required
            />
            <p v-if="errors.email" class="text-xs text-danger-500 mt-1">{{ errors.email }}</p>
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
            <button type="button" @click="mode = 'reset'" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Forgot password?</button>
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

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-surface-200 dark:border-surface-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-3 bg-white/80 dark:bg-surface-800/60 text-surface-400">Or continue with</span>
            </div>
          </div>

          <!-- OAuth Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleOAuth('google')"
              class="btn-secondary w-full justify-center text-sm py-2.5"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              @click="handleOAuth('github')"
              class="btn-secondary w-full justify-center text-sm py-2.5"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </form>

        <!-- Sign Up Form -->
        <form v-else-if="mode === 'signup'" @submit.prevent="handleSignUp" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full Name</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="John Doe"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="At least 8 characters"
              class="input-field"
              minlength="6"
              required
            />
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
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Password Reset Form -->
        <form v-else-if="mode === 'reset'" @submit.prevent="handleReset" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="input-field"
              required
            />
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
            <span v-else>Send Reset Link</span>
          </button>
          <button type="button" @click="mode = 'login'" class="w-full text-center text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
            Back to Sign In
          </button>
        </form>

        <!-- Toggle between login/signup -->
        <div v-if="mode !== 'reset'" class="mt-6 text-center">
          <p class="text-sm text-surface-500 dark:text-surface-400">
            <template v-if="mode === 'login'">
              Don't have an account?
              <button type="button" @click="mode = 'signup'" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Sign up</button>
            </template>
            <template v-else>
              Already have an account?
              <button type="button" @click="mode = 'login'" class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Sign in</button>
            </template>
          </p>
        </div>

        <!-- Demo credentials hint (only show for login mode) -->
        <div v-if="mode === 'login'" class="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
          <p class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Demo Credentials</p>
          <p class="text-xs text-surface-500 dark:text-surface-400">Email: <span class="font-mono text-surface-600 dark:text-surface-300">admin@salesanalytics.com</span></p>
          <p class="text-xs text-surface-500 dark:text-surface-400">Password: <span class="font-mono text-surface-600 dark:text-surface-300">demo1234</span></p>
          <p class="text-xs text-surface-400 dark:text-surface-500 mt-2">Create a free Supabase account at <a href="https://supabase.com" target="_blank" class="text-primary-500">supabase.com</a> to get started.</p>
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
const mode = ref('login')
const email = ref('')
const password = ref('')
const fullName = ref('')
const errors = reactive({ email: '', password: '' })
const successMessage = ref('')

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  successMessage.value = ''

  if (!email.value) errors.email = 'Email is required'
  if (!password.value) errors.password = 'Password is required'
  if (errors.email || errors.password) return

  try {
    await authStore.login({ email: email.value, password: password.value })
  } catch {
    // Error is handled by the store
  }
}

async function handleSignUp() {
  successMessage.value = ''
  authStore.clearError()

  try {
    const data = await authStore.signUp({
      email: email.value,
      password: password.value,
      fullName: fullName.value,
    })
    if (data?.user?.identities?.length === 0) {
      successMessage.value = 'An account with this email already exists. Please sign in.'
    } else {
      successMessage.value = 'Account created! Check your email to confirm your account.'
    }
  } catch {
    // Error is handled by the store
  }
}

async function handleOAuth(provider) {
  try {
    await authStore.loginWithProvider(provider)
  } catch {
    // Error is handled by the store
  }
}

async function handleReset() {
  successMessage.value = ''
  authStore.clearError()

  try {
    await authStore.resetPassword(email.value)
    successMessage.value = 'Password reset link sent! Check your email.'
  } catch {
    // Error is handled by the store
  }
}
</script>
