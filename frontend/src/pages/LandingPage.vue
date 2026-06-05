<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950">
    <!-- Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-100/50 dark:border-surface-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-lg font-bold text-surface-800 dark:text-surface-100">Sales Analytics</span>
          </div>
          <nav class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors">Features</a>
            <a href="#demo" class="text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors">Demo</a>
            <ThemeToggle />
            <router-link to="/login" class="btn-primary text-sm py-2 px-5">Get Started</router-link>
          </nav>
          <button class="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/5 blur-3xl" />
        <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary-300/5 blur-3xl" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/3 blur-3xl" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }"
          >
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/15 border border-primary-100 dark:border-primary-800/50 mb-8">
              <span class="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
              <span class="text-xs font-medium text-primary-600 dark:text-primary-400">Live analytics platform</span>
            </div>
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight">
              Transform Sales Data
              <span class="text-gradient block mt-2">Into Business Growth</span>
            </h1>
            <p class="mt-6 text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Unlock powerful business insights through intelligent analytics. Monitor performance, identify trends, and make data-driven decisions with enterprise-grade dashboards.
            </p>
            <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <router-link to="/login" class="btn-primary text-base px-8 py-3.5 shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30">
                Get Started
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </router-link>
              <router-link to="/dashboard" class="btn-secondary text-base px-8 py-3.5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Explore Dashboard
              </router-link>
            </div>
          </div>

          <!-- Dashboard Preview -->
          <div
            class="mt-16 relative"
            v-motion
            :initial="{ opacity: 0, y: 40 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' } }"
          >
            <div class="glass-card p-2 rounded-2xl shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
              <div class="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-6">
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-gradient-to-br" :class="[i === 1 ? 'from-primary-50 to-primary-100' : i === 2 ? 'from-success-50 to-success-100' : 'from-warning-50 to-warning-100']"></div>
                </div>
                <div class="h-48 rounded-xl bg-gradient-to-br from-primary-50/50 to-surface-100"></div>
              </div>
            </div>
            <!-- Floating badge -->
            <div class="absolute -top-3 -right-3 glass-card px-4 py-2 rounded-xl animate-float">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-success-500"></span>
                <span class="text-xs font-semibold text-surface-700 dark:text-surface-200">+22.4% growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white">Everything you need to analyze sales</h2>
          <p class="mt-4 text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">Powerful analytics tools to understand your business performance from every angle.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(feature, i) in features"
            :key="feature.title"
            class="glass-card-hover p-6"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" :class="feature.bgColor">
              <component :is="feature.icon" class="w-6 h-6" :class="feature.iconColor" />
            </div>
            <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-gradient-to-b from-primary-600 to-primary-800 relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div class="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_50%)]" />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            class="text-center"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.15 } }"
          >
            <div class="text-3xl lg:text-4xl font-bold text-white mb-1">{{ stat.value }}</div>
            <div class="text-sm text-primary-200">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-surface-900 text-surface-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-white">Sales Analytics</span>
          </div>
          <p class="text-sm">Built with Vue 3, Django, and ❤️. Powered by AI.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const features = [
  {
    title: 'Real-Time Dashboards',
    description: 'Track revenue, profit, orders, and growth metrics with live-updating KPI cards and interactive charts.',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>' }
  },
  {
    title: 'Sales Analysis',
    description: 'Deep-dive into monthly trends, quarterly performance, and category comparisons with powerful filtering.',
    bgColor: 'bg-success-50',
    iconColor: 'text-success-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>' }
  },
  {
    title: 'Customer Insights',
    description: 'Segment your customers, track lifetime value, monitor retention, and understand purchase behavior.',
    bgColor: 'bg-warning-50',
    iconColor: 'text-warning-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' }
  },
  {
    title: 'Product Performance',
    description: 'Identify top and bottom performers, analyze profitability margins, and optimize your product mix.',
    bgColor: 'bg-danger-50',
    iconColor: 'text-danger-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>' }
  },
  {
    title: 'Regional Insights',
    description: 'Compare performance across regions, identify growth markets, and allocate resources effectively.',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' }
  },
  {
    title: 'Report Exporting',
    description: 'Export professional PDF and CSV reports. Schedule automated email reports for your stakeholders.',
    bgColor: 'bg-success-50',
    iconColor: 'text-success-600',
    icon: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' }
  },
]

const stats = [
  { value: '$2.8M+', label: 'Revenue Tracked' },
  { value: '15K+', label: 'Orders Analyzed' },
  { value: '4.8K+', label: 'Active Customers' },
  { value: '99.9%', label: 'Uptime SLA' },
]
</script>
