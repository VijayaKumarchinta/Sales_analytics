<template>
  <div
    class="kpi-card"
    :class="type"
    v-motion="cardMotion"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="p-2.5 rounded-xl" :class="iconBgClass">
        <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
      </div>
      <span v-if="badge !== undefined" class="stat-badge" :class="badge >= 0 ? 'up' : 'down'">
        <svg v-if="badge >= 0" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        {{ Math.abs(badge) }}%
      </span>
    </div>

    <p class="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">{{ label }}</p>

    <div v-if="!loading" class="space-y-1">
      <p class="text-2xl font-bold text-surface-800 tracking-tight">
        {{ prefix }}{{ formattedValue }}{{ suffix }}
      </p>
      <p v-if="subtext" class="text-xs text-surface-400">{{ subtext }}</p>
    </div>

    <div v-else class="space-y-2">
      <div class="skeleton h-8 w-3/4"></div>
      <div class="skeleton h-3 w-1/2"></div>
    </div>

    <!-- Subtle decorative gradient -->
    <div class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5" :class="decorativeClass" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  type: { type: String, default: 'revenue' },
  badge: { type: Number, default: undefined },
  subtext: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  index: { type: Number, default: 0 },
})

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: props.index * 0.1, ease: 'easeOut' }
  }
}

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    if (props.value >= 1000000) return (props.value / 1000000).toFixed(1) + 'M'
    if (props.value >= 1000) return (props.value / 1000).toFixed(1) + 'K'
    return props.value.toLocaleString()
  }
  return props.value
})

const icons = {
  revenue: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>' },
  profit: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' },
  margin: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>' },
  orders: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>' },
  customers: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' },
  growth: { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>' },
}

const icon = computed(() => icons[props.type] || icons.revenue)

const iconBgClass = computed(() => {
  const map = {
    revenue: 'bg-primary-50',
    profit: 'bg-success-50',
    margin: 'bg-warning-50',
    orders: 'bg-primary-50',
    customers: 'bg-success-50',
    growth: 'bg-danger-50',
  }
  return map[props.type] || 'bg-surface-100'
})

const iconColorClass = computed(() => {
  const map = {
    revenue: 'text-primary-600',
    profit: 'text-success-600',
    margin: 'text-warning-600',
    orders: 'text-primary-500',
    customers: 'text-success-500',
    growth: 'text-danger-500',
  }
  return map[props.type] || 'text-surface-500'
})

const decorativeClass = computed(() => {
  const map = {
    revenue: 'bg-primary-500',
    profit: 'bg-success-500',
    margin: 'bg-warning-500',
    orders: 'bg-primary-400',
    customers: 'bg-success-400',
    growth: 'bg-danger-500',
  }
  return map[props.type] || 'bg-primary-500'
})
</script>
