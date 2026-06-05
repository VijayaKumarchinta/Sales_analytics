<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div
      class="glass-card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white"
      v-motion
      :initial="{ opacity: 0, y: -10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">Good {{ timeOfDay }}, {{ authStore.userName }}</h2>
          <p class="text-primary-200 text-sm mt-1">Here's what's happening with your business today.</p>
        </div>
        <div class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
          <span class="w-2 h-2 rounded-full bg-success-400 animate-pulse"></span>
          <span class="text-xs font-medium text-primary-100">Live</span>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <template v-if="!dashboardStore.loading.kpis">
        <KpiCard
          v-for="(kpi, key) in kpiList"
          :key="key"
          :label="kpi.label"
          :value="dashboardStore.kpis[key]?.value || 0"
          :prefix="dashboardStore.kpis[key]?.prefix || ''"
          :suffix="dashboardStore.kpis[key]?.suffix || ''"
          :type="key"
          :badge="dashboardStore.kpis[key]?.change"
          :subtext="kpi.subtext"
          :index="kpiIndices[key]"
        />
      </template>
      <template v-else>
        <SkeletonCard v-for="i in 6" :key="i" :index="i" />
      </template>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trend Chart -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title">
            <span class="w-2 h-2 rounded-full bg-primary-500"></span>
            Monthly Revenue Trend
          </h3>
          <div class="flex gap-2">
            <button
              v-for="period in ['6m', '12m', 'All']"
              :key="period"
              @click="activePeriod = period"
              class="px-3 py-1 text-xs font-medium rounded-lg transition-all"
              :class="activePeriod === period ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div v-if="!dashboardStore.loading.charts" class="apex-chart">
          <apexchart
            type="area"
            height="300"
            :options="revenueChartOptions"
            :series="dashboardStore.revenueData.series"
          />
        </div>
        <ChartPlaceholder v-else />
      </div>

      <!-- Region Performance Chart -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Regional Performance
        </h3>
        <div v-if="!dashboardStore.loading.charts" class="apex-chart">
          <apexchart
            type="bar"
            height="300"
            :options="regionChartOptions"
            :series="[{ name: 'Revenue', data: dashboardStore.regionData.series }]"
          />
        </div>
        <ChartPlaceholder v-else />
      </div>
    </div>

    <!-- Bottom Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Category Breakdown -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-warning-500"></span>
          Category Comparison
        </h3>
        <div v-if="!dashboardStore.loading.charts" class="apex-chart">
          <apexchart
            type="donut"
            height="300"
            :options="categoryChartOptions"
            :series="dashboardStore.categoryData.series"
          />
        </div>
        <ChartPlaceholder v-else />
      </div>

      <!-- Quick Stats -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-danger-500"></span>
          Quick Insights
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-surface-700">Best Month</p>
                <p class="text-xs text-surface-400">December had highest revenue</p>
              </div>
            </div>
            <span class="text-sm font-bold text-success-600">$378K</span>
          </div>
          <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                <svg class="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-surface-700">Top Region</p>
                <p class="text-xs text-surface-400">North America leads sales</p>
              </div>
            </div>
            <span class="text-sm font-bold text-primary-600">$1.25M</span>
          </div>
          <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                <svg class="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-surface-700">Top Category</p>
                <p class="text-xs text-surface-400">Electronics generates most revenue</p>
              </div>
            </div>
            <span class="text-sm font-bold text-warning-600">$980K</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import KpiCard from '@/components/common/KpiCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import ChartPlaceholder from '@/components/common/ChartPlaceholder.vue'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const activePeriod = ref('12m')

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
})

const kpiList = {
  revenue: { label: 'Total Revenue', subtext: 'Last 12 months' },
  profit: { label: 'Total Profit', subtext: 'Net earnings' },
  profitMargin: { label: 'Profit Margin', subtext: 'Average margin' },
  orders: { label: 'Total Orders', subtext: 'All time orders' },
  customers: { label: 'Customers', subtext: 'Active customers' },
  growth: { label: 'Growth Rate', subtext: 'Year over year' },
}

const kpiIndices = {
  revenue: 0, profit: 1, profitMargin: 2,
  orders: 3, customers: 4, growth: 5,
}

// Chart Options
const revenueChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
    zoom: { enabled: false },
  },
  colors: ['#2563eb'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: dashboardStore.revenueData.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      formatter: (val) => val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`,
      style: { fontSize: '11px' },
    },
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString()}` },
  },
}))

const regionChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  colors: ['#22c55e'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%',
      distributed: false,
    },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: dashboardStore.regionData.labels,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      formatter: (val) => val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`,
      style: { fontSize: '11px' },
    },
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString()}` },
  },
}))

const categoryChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  colors: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
  labels: dashboardStore.categoryData.labels,
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '11px',
    markers: { size: 6 },
    itemMargin: { horizontal: 8 },
  },
  stroke: { show: false },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '12px',
            color: '#94a3b8',
            formatter: () => {
              const total = dashboardStore.categoryData.series.reduce((a, b) => a + b, 0)
              return total >= 1000 ? `$${(total / 1000).toFixed(0)}K` : `$${total}`
            },
          },
        },
      },
    },
  },
  responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
}))

onMounted(() => {
  dashboardStore.fetchKPIs()
  dashboardStore.fetchChartData()
})
</script>
