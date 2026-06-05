<template>
  <div class="space-y-6">
    <!-- Customer KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Customers" :value="4892" type="customers" :badge="15.7" :index="0" />
      <KpiCard label="Avg Lifetime Value" :value="1240" prefix="$" type="revenue" :badge="8.2" :index="1" />
      <KpiCard label="Retention Rate" :value="92.3" suffix="%" type="margin" :badge="3.1" :index="2" />
      <KpiCard label="Churn Rate" :value="7.7" suffix="%" type="growth" :badge="-2.4" :index="3" />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Customer Segmentation
        </h3>
        <apexchart type="donut" height="300" :options="segmentChartOptions" :series="segmentSeries" />
      </div>

      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Retention Rate Trend
        </h3>
        <apexchart type="line" height="300" :options="retentionChartOptions" :series="retentionSeries" />
      </div>
    </div>

    <!-- Customer Table -->
    <div class="glass-card overflow-hidden" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }">
      <div class="px-6 py-4 border-b border-surface-100">
        <h3 class="section-title mb-0">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Top Customers
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider border-b border-surface-100">
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">City</th>
              <th class="px-6 py-4">Segment</th>
              <th class="px-6 py-4 text-right">Total Spent</th>
              <th class="px-6 py-4 text-right">Orders</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="c in customers" :key="c.id" class="hover:bg-surface-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ c.name.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-surface-700">{{ c.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-surface-500">{{ c.email }}</td>
              <td class="px-6 py-4 text-sm text-surface-500">{{ c.city }}, {{ c.country }}</td>
              <td class="px-6 py-4">
                <span class="stat-badge" :class="segmentClass(c.segment)">{{ c.segment }}</span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-surface-700 text-right">${{ c.total_spent.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-surface-500 text-right">{{ c.orders }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import KpiCard from '@/components/common/KpiCard.vue'

const customersStore = useCustomersStore()

const customers = computed(() => customersStore.customers)

const segmentSeries = computed(() => customersStore.segments.map(s => s.count))
const segmentLabels = computed(() => customersStore.segments.map(s => s.name))

const segmentChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6'],
  labels: segmentLabels.value,
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } },
  stroke: { show: false },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
        labels: {
          show: true,
          total: { show: true, label: 'Total', fontSize: '12px', color: '#94a3b8', formatter: () => customersStore.totalCustomers }
        },
      },
    },
  },
}))

const retentionSeries = computed(() => [
  { name: 'Retention Rate', data: customersStore.retentionData.map(r => r.rate) || [92, 88, 94, 90, 91, 93, 89, 95, 92, 91, 94, 96] },
])

const retentionChartOptions = {
  chart: { type: 'line', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#22c55e'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'solid', opacity: 0.1 },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 70, max: 100, labels: { formatter: (val) => `${val}%` } },
  tooltip: { theme: 'light', y: { formatter: (val) => `${val}%` } },
  annotations: {
    yaxis: [{ y: 90, strokeDashArray: 3, borderColor: '#f59e0b', label: { text: 'Target 90%', style: { color: '#f59e0b', fontSize: '11px' } } }],
  },
}

function segmentClass(segment) {
  const map = { Premium: 'up', Standard: 'neutral', Basic: 'down' }
  return map[segment] || 'neutral'
}

onMounted(() => {
  customersStore.fetchCustomers()
  customersStore.fetchSegments()
  customersStore.fetchRetention()
})
</script>
