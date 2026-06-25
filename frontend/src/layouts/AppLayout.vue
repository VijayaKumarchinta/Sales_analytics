<template>
  <div class="flex h-screen overflow-hidden bg-surface-50">
    <!-- Sidebar -->
    <aside
      class="glass-sidebar w-64 flex-shrink-0 hidden lg:flex flex-col z-30"
      v-motion="sidebarMotion"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-6 border-b border-surface-100/50">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h1 class="text-sm font-bold text-surface-800">Sales Analytics</h1>
          <p class="text-xs text-surface-400">BI Platform</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 mb-2">Main Menu</div>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="glass-nav-item"
          :class="{ 'active': isActive(item.path) }"
        >
          <span v-html="item.iconHtml" class="w-5 h-5 flex-shrink-0 inline-flex items-center justify-center"></span>
          <span class="text-sm font-medium">{{ item.label }}</span>
          <span v-if="item.badge" class="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 font-medium">{{ item.badge }}</span>
        </router-link>
      </nav>

  <!-- User Section -->
      <div class="p-4 border-t border-surface-100/50">
        <div class="flex items-center gap-3 px-2">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-700 truncate">{{ userName }}</p>
            <p class="text-xs text-surface-400 capitalize">{{ userRole }}</p>
          </div>
          <button @click="handleLogout" class="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-danger-500 transition-colors" title="Sign out">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

    </aside>

    <!-- Mobile sidebar overlay -->
    <transition name="sidebar">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="mobileSidebarOpen = false" />
        <aside class="glass-sidebar w-64 h-full relative z-50">
          <div class="h-16 flex items-center gap-3 px-6 border-b border-surface-100/50">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 class="text-sm font-bold text-surface-800">Sales Analytics</h1>
              <p class="text-xs text-surface-400">BI Platform</p>
            </div>
          </div>
          <nav class="px-3 py-4 space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="glass-nav-item"
              :class="{ 'active': isActive(item.path) }"
              @click="mobileSidebarOpen = false"
            >
              <span v-html="item.iconHtml" class="w-5 h-5 inline-flex items-center justify-center"></span>
              <span class="text-sm font-medium">{{ item.label }}</span>
            </router-link>
          </nav>
        </aside>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 glass border-b border-surface-100/50 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button
            class="lg:hidden p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors"
            @click="mobileSidebarOpen = true"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-surface-800">{{ pageTitle }}</h2>
            <p class="text-xs text-surface-400">{{ pageSubtitle }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Date Range Filter -->
          <select
            v-model="dateRange"
            @change="onDateRangeChange"
            class="input-field text-sm py-2 w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- Notification Bell -->
          <button class="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white"></span>
          </button>

          <!-- Avatar (mobile) -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-md lg:hidden">
            G
          </div>

        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const route = useRoute()
const authStore = useAuthStore()

const dashboardStore = useDashboardStore()
const mobileSidebarOpen = ref(false)
const dateRange = ref('year')

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)
const userInitials = computed(() => {
  const name = authStore.userName
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) || '?'
})


const sidebarMotion = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', iconHtml: getChartBarIcon(), badge: null },
  { path: '/dashboard/sales', label: 'Sales Analysis', iconHtml: getTrendingUpIcon(), badge: null },
  { path: '/dashboard/profit', label: 'Profit Analysis', iconHtml: getCashIcon(), badge: null },
  { path: '/dashboard/customers', label: 'Customers', iconHtml: getUsersIcon(), badge: 'New' },
  { path: '/dashboard/products', label: 'Products', iconHtml: getCubeIcon(), badge: null },
  { path: '/dashboard/regions', label: 'Regions', iconHtml: getGlobeIcon(), badge: null },
  { path: '/dashboard/reports', label: 'Reports', iconHtml: getDocumentIcon(), badge: null },
  { path: '/dashboard/settings', label: 'Settings', iconHtml: getCogIcon(), badge: null },
]

function getChartBarIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
}

function getTrendingUpIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>'
}

function getCashIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}

function getUsersIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>'
}

function getCubeIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>'
}

function getGlobeIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}

function getDocumentIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
}

function getCogIcon() {
  return '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
}

const pageMeta = computed(() => {
  const names = {
    'Dashboard': { title: 'Dashboard', subtitle: 'Your business at a glance' },
    'SalesAnalysis': { title: 'Sales Analysis', subtitle: 'Revenue trends and performance metrics' },
    'ProfitAnalysis': { title: 'Profit Analysis', subtitle: 'Margins, costs, and profitability' },
    'Customers': { title: 'Customers', subtitle: 'Segmentation, retention & behavior' },
    'Products': { title: 'Products', subtitle: 'Product performance & profitability' },
    'Regions': { title: 'Regions', subtitle: 'Regional performance overview' },
    'Reports': { title: 'Reports', subtitle: 'Export and schedule reports' },
    'Settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
  }
  return names[route.name] || { title: 'Dashboard', subtitle: '' }
})

const pageTitle = computed(() => pageMeta.value.title)
const pageSubtitle = computed(() => pageMeta.value.subtitle)

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  authStore.logout()
}

function onDateRangeChange() {
  dashboardStore.setDateRange(dateRange.value)
}
</script>

<style scoped>
.sidebar-enter-active, .sidebar-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.sidebar-enter-from, .sidebar-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
