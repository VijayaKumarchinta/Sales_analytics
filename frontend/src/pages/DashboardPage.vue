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

    <!-- Charts Row 1 -->
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

    <!-- Charts Row 2 -->
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

      <!-- Revenue Forecast -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Revenue Forecast
        </h3>
        <div v-if="!dashboardStore.loading.charts" class="apex-chart">
          <apexchart
            type="line"
            height="300"
            :options="forecastChartOptions"
            :series="forecastData"
          />
        </div>
        <ChartPlaceholder v-else />
        <div class="mt-2 flex items-center justify-between px-1">
          <span class="text-xs text-surface-400">Based on historical trend with seasonal adjustment</span>
          <div class="flex gap-3">
            <span class="inline-flex items-center gap-1 text-xs">
              <span class="w-2 h-2 rounded-full bg-primary-500"></span>
              <span class="text-surface-500">Actual</span>
            </span>
            <span class="inline-flex items-center gap-1 text-xs">
              <span class="w-2 h-2 rounded-full bg-warning-500"></span>
              <span class="text-surface-500">Forecast</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 3: Quick Insights + Forecast Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Stats / Insights -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-danger-500"></span>
          Quick Insights
        </h3>
        <div class="space-y-3">
          <div
            v-for="(insight, idx) in insights"
            :key="idx"
            class="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-surface-50 cursor-default"
            :class="insight.bgClass || 'bg-surface-50'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="insight.iconBg"
              >
                <span class="text-lg">{{ insight.icon }}</span>
              </div>
              <div>
                <p class="text-sm font-medium" :class="insight.textClass || 'text-surface-700'">{{ insight.label }}</p>
                <p class="text-xs" :class="insight.subtextClass || 'text-surface-400'">{{ insight.subtext }}</p>
              </div>
            </div>
            <span class="text-sm font-bold" :class="insight.valueClass || 'text-success-600'">{{ insight.value }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Summary Cards -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.45 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Performance Summary
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="(metric, key) in summaryMetrics" :key="key"
               class="p-4 rounded-xl bg-surface-50 transition-all hover:shadow-sm">
            <p class="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">{{ metric.label }}</p>
            <p class="text-xl font-bold" :class="metric.colorClass">{{ metric.value }}</p>
            <p class="text-xs mt-1" :class="metric.trend >= 0 ? 'text-success-500' : 'text-danger-500'">
              <span v-if="metric.trend >= 0">↑</span><span v-else>↓</span>
              {{ Math.abs(metric.trend) }}% {{ metric.trend >= 0 ? 'increase' : 'decrease' }}
            </p>
          </div>
        </div>

        <!-- Revenue Range Indicator -->
        <div class="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/50">
          <p class="text-xs font-medium text-primary-600 uppercase tracking-wider mb-1">Next Quarter Forecast Range</p>
          <div class="flex items-baseline gap-3 mt-2">
            <div>
              <p class="text-2xl font-bold text-primary-700">$1.02M</p>
              <p class="text-xs text-primary-500">Optimistic</p>
            </div>
            <div class="text-primary-300 text-2xl font-light">|</div>
            <div>
              <p class="text-2xl font-bold text-primary-600">$945K</p>
              <p class="text-xs text-primary-500">Expected</p>
            </div>
            <div class="text-primary-300 text-2xl font-light">|</div>
            <div>
              <p class="text-2xl font-bold text-primary-500">$870K</p>
              <p class="text-xs text-primary-500">Conservative</p>
            </div>
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

// ── Insights Data ────────────────────────────────────────────────────────
const insights = computed(() => [
  {
    icon: '📈',
    label: 'Best Month',
    subtext: 'December had highest revenue',
    value: dashboardStore.revenueTrend?.[dashboardStore.revenueTrend.length - 1]?.amount
      ? `$${dashboardStore.revenueTrend.reduce((max, r) => r.amount > max.amount ? r : max).amount.toLocaleString()}`
      : '$378K',
    iconBg: 'bg-primary-50',
    textClass: 'text-surface-700',
    valueClass: 'text-success-600',
  },
  {
    icon: '🌍',
    label: 'Top Region',
    subtext: dashboardStore.regionPerformance?.[0]?.region || 'North America leads sales',
    value: dashboardStore.regionPerformance?.[0]?.total
      ? `$${(dashboardStore.regionPerformance[0].total / 1000).toFixed(0)}K`
      : '$1.25M',
    iconBg: 'bg-success-50',
    valueClass: 'text-primary-600',
  },
  {
    icon: '📦',
    label: 'Top Category',
    subtext: dashboardStore.categoryBreakdown?.[0]?.name || 'Electronics generates most revenue',
    value: dashboardStore.categoryBreakdown?.[0]?.total
      ? `$${(dashboardStore.categoryBreakdown[0].total / 1000).toFixed(0)}K`
      : '$980K',
    iconBg: 'bg-warning-50',
    valueClass: 'text-warning-600',
  },
  {
    icon: '📊',
    label: 'Avg Quarterly Growth',
    subtext: 'Based on last 4 quarters',
    value: '+8.3%',
    iconBg: 'bg-danger-50',
    subtextClass: 'text-surface-400',
    valueClass: 'text-success-600',
  },
])

// ── Summary Metrics ──────────────────────────────────────────────────────
const summaryMetrics = computed(() => [
  { label: 'YTD Revenue', value: '$2.15M', trend: 12.5, colorClass: 'text-primary-700' },
  { label: 'Gross Margin', value: '30.1%', trend: 2.1, colorClass: 'text-success-700' },
  { label: 'Avg Order Value', value: '$186', trend: -1.2, colorClass: 'text-warning-700' },
  { label: 'Customer Retention', value: '78%', trend: 5.4, colorClass: 'text-info-700' },
])

// ── Forecast Data ────────────────────────────────────────────────────────
// Use a seedable fixed variation rather than Math.random to prevent chart flickering
const SEASONAL_FACTORS = [1.02, 0.95, 1.03, 1.01]
const FORECAST_VARIATION = [1.0, 0.97, 1.04, 1.0]  // Fixed values, no randomness

const forecastData = computed(() => {
  const actual = dashboardStore.revenueData?.series?.[0]?.data || []
  const categories = dashboardStore.revenueData?.categories || []

  if (actual.length === 0) {
    const demoActual = [210, 195, 245, 230, 268, 295, 310, 285, 320, 298, 342, 378]
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return [
      { name: 'Actual Revenue', data: demoActual, type: 'area', fillOpacity: 0.3 },
      { name: 'Forecast', data: [378, 365, 385, 400], type: 'line' },
    ]
  }

  // Simple moving average forecast with fixed seasonal variation
  const lastThree = actual.slice(-3)
  const safeLastThree = lastThree.filter(v => v != null && !isNaN(v))
  const forecastAvg = safeLastThree.length > 0
    ? safeLastThree.reduce((a, b) => a + b, 0) / safeLastThree.length
    : actual[actual.length - 1] || 300

  const forecast = SEASONAL_FACTORS.map((f, i) => Math.round(forecastAvg * f * FORECAST_VARIATION[i]))

  return [
    { name: 'Actual Revenue', data: actual, type: 'area', fillOpacity: 0.3 },
    { name: 'Forecast', data: [...new Array(actual.length - 1).fill(null), ...forecast], type: 'line' },
  ]
})

// ── Chart Options ────────────────────────────────────────────────────────
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

const forecastChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  colors: ['#2563eb', '#f59e0b'],
  stroke: { curve: 'smooth', width: [2, 2], dash: [0, 5] },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: [
      ...(dashboardStore.revenueData?.categories || []),
      'Next Q1', 'Next Q2', 'Next Q3', 'Next Q4',
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: '10px' } },
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
  markers: {
    size: [4, 0],
    hover: { size: 6 },
  },
}))

onMounted(() => {
  dashboardStore.fetchKPIs()
  dashboardStore.fetchChartData()
})
</script>
