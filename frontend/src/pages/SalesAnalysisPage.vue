<template>
  <div class="space-y-6">
    <!-- Sales Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        v-for="(kpi, i) in salesKpis"
        :key="kpi.label"
        v-bind="kpi"
        :index="i"
      />
    </div>

    <!-- Monthly Revenue Trend -->
    <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5 } }">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Monthly Revenue Trend
        </h3>
      </div>
      <apexchart
        type="line"
        height="350"
        :options="monthlyChartOptions"
        :series="monthlySeries"
      />
    </div>

    <!-- Quarterly Sales -->
    <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Quarterly Sales Performance
        </h3>
      </div>
      <apexchart
        type="bar"
        height="350"
        :options="quarterlyChartOptions"
        :series="quarterlySeries"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import KpiCard from '@/components/common/KpiCard.vue'

const salesStore = useSalesStore()

const salesKpis = computed(() => [
  { label: 'Total Revenue', value: salesStore.totalRevenue, prefix: '$', type: 'revenue', badge: 12.5 },
  { label: 'Total Profit', value: salesStore.totalProfit, prefix: '$', type: 'profit', badge: 8.3 },
  { label: 'Total Orders', value: salesStore.totalOrders, type: 'orders', badge: -3.2 },
  { label: 'Avg Order Value', value: salesStore.averageOrderValue, prefix: '$', type: 'margin', badge: 2.1 },
])

const monthlySeries = computed(() => [
  { name: 'Revenue', data: salesStore.trends.map(t => t.revenue) },
  { name: 'Profit', data: salesStore.trends.map(t => t.profit) },
])

const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthlyChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  colors: ['#2563eb', '#22c55e'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'solid', opacity: [0.1, 0.1] },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: monthlyLabels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
  yaxis: { labels: { formatter: (val) => val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val}`, style: { fontSize: '11px' } } },
  legend: { position: 'top', fontSize: '12px', markers: { size: 6 } },
  tooltip: { theme: 'light', y: { formatter: (val) => `$${val.toLocaleString()}` } },
}))

const quarterlySeries = computed(() => [
  { name: 'Revenue', data: salesStore.quarterlyData.map(q => q.revenue) },
  { name: 'Profit', data: salesStore.quarterlyData.map(q => q.profit) },
])

const quarterlyChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#94a3b8',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
    stacked: false,
  },
  colors: ['#2563eb', '#22c55e'],
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: '50%', horizontal: false },
  },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { formatter: (val) => `$${(val / 1000).toFixed(0)}K` } },
  legend: { position: 'top', fontSize: '12px' },
  tooltip: { theme: 'light', y: { formatter: (val) => `$${val.toLocaleString()}` } },
}))

onMounted(() => {
  salesStore.fetchTrends()
  salesStore.fetchQuarterly()
})
</script>
