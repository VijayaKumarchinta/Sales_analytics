<template>
  <div class="space-y-6">
    <!-- Region KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Regions Active" :value="6" type="revenue" :badge="0" :index="0" />
      <KpiCard label="Top Region" value="N. America" type="profit" subtext="$1.25M revenue" :index="1" />
      <KpiCard label="Fastest Growth" value="APAC" type="growth" subtext="+23.4% YoY" :index="2" />
      <KpiCard label="Global Revenue" :value="2845000" prefix="$" type="margin" :badge="12.5" :index="3" />
    </div>

    <!-- Region Chart -->
    <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5 } }">
      <h3 class="section-title">
        <span class="w-2 h-2 rounded-full bg-primary-500"></span>
        Revenue by Region
      </h3>
      <apexchart type="bar" height="350" :options="regionChartOptions" :series="regionSeries" />
    </div>

    <!-- Region Details Table -->
    <div class="glass-card overflow-hidden" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
      <div class="px-6 py-4 border-b border-surface-100">
        <h3 class="section-title mb-0">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Regional Performance Details
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider border-b border-surface-100">
              <th class="px-6 py-4">Region</th>
              <th class="px-6 py-4 text-right">Revenue</th>
              <th class="px-6 py-4 text-right">Profit</th>
              <th class="px-6 py-4 text-right">Orders</th>
              <th class="px-6 py-4 text-right">Growth</th>
              <th class="px-6 py-4 text-right">Market Share</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="r in regions" :key="r.region" class="hover:bg-surface-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs" :class="r.bgColor">
                    {{ r.emoji }}
                  </div>
                  <span class="text-sm font-medium text-surface-700">{{ r.region }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-surface-700 text-right">${{ r.revenue.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-surface-500 text-right">${{ r.profit.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-surface-500 text-right">{{ r.orders }}</td>
              <td class="px-6 py-4 text-right">
                <span class="stat-badge" :class="r.growth >= 0 ? 'up' : 'down'">{{ r.growth >= 0 ? '+' : '' }}{{ r.growth }}%</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-20 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                    <div class="h-full rounded-full bg-primary-500" :style="{ width: r.share + '%' }"></div>
                  </div>
                  <span class="text-xs text-surface-400 w-10 text-right">{{ r.share }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import KpiCard from '@/components/common/KpiCard.vue'

const regionSeries = [
  { name: 'Revenue', data: [1250000, 890000, 456000, 128000, 95000, 42000] },
  { name: 'Profit', data: [375000, 267000, 136800, 38400, 28500, 12600] },
]

const regionChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#2563eb', '#22c55e'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', horizontal: false } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
  yaxis: { labels: { formatter: (val) => `$${(val / 1000).toFixed(0)}K`, style: { fontSize: '11px' } } },
  legend: { position: 'top', fontSize: '12px', markers: { size: 6 } },
  tooltip: { theme: 'light', y: { formatter: (val) => `$${val.toLocaleString()}` } },
}

const regions = [
  { region: 'North America', emoji: '🇺🇸', bgColor: 'bg-blue-50', revenue: 1250000, profit: 375000, orders: 4890, growth: 14.2, share: 43.9 },
  { region: 'Europe', emoji: '🇪🇺', bgColor: 'bg-indigo-50', revenue: 890000, profit: 267000, orders: 3450, growth: 8.5, share: 31.3 },
  { region: 'Asia Pacific', emoji: '🌏', bgColor: 'bg-green-50', revenue: 456000, profit: 136800, orders: 1980, growth: 23.4, share: 16.0 },
  { region: 'Latin America', emoji: '🌎', bgColor: 'bg-yellow-50', revenue: 128000, profit: 38400, orders: 560, growth: 5.2, share: 4.5 },
  { region: 'Middle East', emoji: '🏜️', bgColor: 'bg-orange-50', revenue: 95000, profit: 28500, orders: 320, growth: 11.8, share: 3.3 },
  { region: 'Africa', emoji: '🌍', bgColor: 'bg-purple-50', revenue: 42000, profit: 12600, orders: 180, growth: -2.1, share: 1.5 },
]
</script>
