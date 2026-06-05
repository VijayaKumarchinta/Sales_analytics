<template>
  <div class="space-y-6">
    <!-- Profit KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Gross Profit" :value="856000" prefix="$" type="profit" :badge="8.3" :index="0" />
      <KpiCard label="Net Profit Margin" :value="30.1" suffix="%" type="margin" :badge="2.1" :index="1" />
      <KpiCard label="Operating Costs" :value="324000" prefix="$" type="orders" :badge="-4.2" :index="2" />
      <KpiCard label="Revenue per Employee" :value="142250" prefix="$" type="customers" :badge="5.7" :index="3" />
    </div>

    <!-- Profit Trend -->
    <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5 } }">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Profit & Margin Trend
        </h3>
      </div>
      <apexchart
        type="area"
        height="350"
        :options="profitChartOptions"
        :series="profitSeries"
      />
    </div>

    <!-- Profit Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-warning-500"></span>
          Revenue vs Costs
        </h3>
        <apexchart
          type="bar"
          height="300"
          :options="costChartOptions"
          :series="costSeries"
        />
      </div>

      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-danger-500"></span>
          Profit by Category
        </h3>
        <apexchart
          type="radialBar"
          height="300"
          :options="categoryProfitOptions"
          :series="categoryProfitSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const profitSeries = [
  { name: 'Profit', data: [63000, 58500, 73500, 69000, 80400, 88500, 93000, 85500, 96000, 89400, 102600, 113400] },
  { name: 'Margin %', data: [28, 26, 31, 29, 32, 30, 33, 28, 31, 29, 32, 34] },
]

const profitChartOptions = {
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#22c55e', '#f59e0b'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
  yaxis: [
    { labels: { formatter: (val) => `$${(val / 1000).toFixed(0)}K`, style: { fontSize: '11px' } } },
    { opposite: true, labels: { formatter: (val) => `${val.toFixed(0)}%`, style: { fontSize: '11px' } } },
  ],
  legend: { position: 'top', fontSize: '12px', markers: { size: 6 } },
  tooltip: { theme: 'light', y: { formatter: (val, { seriesIndex }) => seriesIndex === 0 ? `$${val.toLocaleString()}` : `${val}%` } },
}

const costSeries = [
  { name: 'Revenue', data: [210000, 245000, 268000, 310000, 320000, 378000] },
  { name: 'Cost of Goods', data: [147000, 171500, 187600, 217000, 224000, 264600] },
  { name: 'Operating Costs', data: [42000, 49000, 53600, 62000, 64000, 75600] },
]

const costChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 }, stacked: true },
  colors: ['#3b82f6', '#f59e0b', '#ef4444'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%', horizontal: false } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  xaxis: { categories: ['Jul','Aug','Sep','Oct','Nov','Dec'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { formatter: (val) => `$${(val / 1000).toFixed(0)}K` } },
  legend: { position: 'top', fontSize: '11px', markers: { size: 6 } },
  tooltip: { theme: 'light', y: { formatter: (val) => `$${val.toLocaleString()}` } },
}

const categoryProfitSeries = [76, 85, 62, 91]

const categoryProfitOptions = {
  chart: { type: 'radialBar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444'],
  plotOptions: {
    radialBar: {
      dataLabels: {
        total: { show: true, label: 'Avg Margin', fontSize: '12px', color: '#94a3b8', formatter: () => '72%' },
        value: { fontSize: '14px', fontWeight: 700, formatter: (val) => `${val}%` },
      },
    },
  },
  labels: ['Electronics', 'Sports', 'Home & Garden', 'Books'],
  legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } },
}
</script>
