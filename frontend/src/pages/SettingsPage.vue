<template>
  <div class="max-w-2xl space-y-6">
    <!-- Profile Section -->
    <div class="glass-card p-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }">
      <h3 class="section-title">
        <span class="w-2 h-2 rounded-full bg-primary-500"></span>
        Profile Settings
      </h3>
      <div class="space-y-4">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {{ userInitials }}
          </div>
          <div>
            <h4 class="text-base font-semibold text-surface-800">{{ authStore.userName }}</h4>
            <p class="text-sm text-surface-400 capitalize">{{ authStore.userRole }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
            <input type="text" :value="authStore.userName" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
            <input type="email" :value="authStore.user?.email || 'admin@salesanalytics.com'" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
            <input type="text" :value="authStore.userRole" class="input-field" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">Timezone</label>
            <select class="input-field">
              <option>UTC</option>
              <option selected>America/New_York</option>
              <option>Europe/London</option>
              <option>Asia/Tokyo</option>
            </select>
          </div>
        </div>

        <div class="pt-2">
          <button class="btn-primary text-sm py-2.5">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="glass-card p-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }">
      <h3 class="section-title">
        <span class="w-2 h-2 rounded-full bg-success-500"></span>
        Preferences
      </h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-700">Email Notifications</p>
            <p class="text-xs text-surface-400">Receive weekly report summaries via email</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked class="sr-only peer" />
            <div class="w-9 h-5 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-700">Dark Mode</p>
            <p class="text-xs text-surface-400">Toggle dark mode appearance</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" />
            <div class="w-9 h-5 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-700">Currency</p>
            <p class="text-xs text-surface-400">Display currency for all reports</p>
          </div>
          <select class="input-field w-28 text-sm">
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="glass-card p-6 border border-danger-200/50" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 } }">
      <h3 class="section-title">
        <span class="w-2 h-2 rounded-full bg-danger-500"></span>
        Danger Zone
      </h3>
      <p class="text-sm text-surface-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
      <button class="inline-flex items-center gap-2 px-5 py-2.5 bg-danger-500 text-white text-sm font-semibold rounded-xl hover:bg-danger-600 transition-colors shadow-lg shadow-danger-500/20">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Account
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const userInitials = computed(() => {
  return authStore.userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) || 'SA'
})
</script>
