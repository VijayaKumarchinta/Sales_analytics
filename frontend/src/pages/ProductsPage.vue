<template>
  <div class="space-y-6">
    <!-- Product KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Products" :value="productKpis.totalProducts" type="revenue" :badge="12.3" :index="0" />
      <KpiCard label="Avg Profit Margin" :value="productKpis.avgMargin" suffix="%" type="profit" :badge="4.5" :index="1" />
      <KpiCard label="Top Performer" :value="productKpis.topPerformer" type="margin" :subtext="productKpis.topPerformerRevenue" :index="2" />
      <KpiCard label="Categories" :value="productKpis.categoryCount" type="orders" :badge="1" :index="3" />
    </div>

    <!-- Top Products -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-success-500"></span>
          Top Performing Products
        </h3>
        <div class="space-y-3">
          <div v-for="(product, i) in topProducts" :key="product.name" class="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" :class="i < 3 ? 'bg-primary-50 text-primary-600' : 'bg-surface-100 text-surface-500'">
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-700 truncate">{{ product.name }}</p>
              <div class="flex items-center gap-2 text-xs text-surface-400">
                <span>${{ product.revenue.toLocaleString() }}</span>
                <span class="w-1 h-1 rounded-full bg-surface-300"></span>
                <span :class="product.margin >= 50 ? 'text-success-600' : 'text-warning-600'">{{ product.margin }}% margin</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-surface-700">${{ product.profit.toLocaleString() }}</div>
              <div class="text-xs text-surface-400">profit</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Analysis -->
      <div class="chart-container" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
        <h3 class="section-title">
          <span class="w-2 h-2 rounded-full bg-warning-500"></span>
          Category Analysis
        </h3>
        <apexchart type="radialBar" height="300" :options="categoryChartOptions" :series="categorySeries" />
      </div>
    </div>

    <!-- Profitability Matrix -->
    <div class="glass-card overflow-hidden" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }">
      <div class="px-6 py-4 border-b border-surface-100">
        <h3 class="section-title mb-0">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          Product Profitability Matrix
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider border-b border-surface-100">
              <th class="px-6 py-4">Product</th>
              <th class="px-6 py-4">Category</th>
              <th class="px-6 py-4 text-right">Cost Price</th>
              <th class="px-6 py-4 text-right">Selling Price</th>
              <th class="px-6 py-4 text-right">Units Sold</th>
              <th class="px-6 py-4 text-right">Revenue</th>
              <th class="px-6 py-4 text-right">Margin</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="p in products" :key="p.id" class="hover:bg-surface-50/50 transition-colors">
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-surface-700">{{ p.name }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="stat-badge neutral">{{ p.category }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-surface-500 text-right">${{ p.cost_price }}</td>
              <td class="px-6 py-4 text-sm text-surface-700 text-right font-medium">${{ p.selling_price }}</td>
              <td class="px-6 py-4 text-sm text-surface-500 text-right">{{ p.units_sold.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-surface-700 text-right">${{ p.revenue.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right">
                <span class="stat-badge" :class="marginClass(p)">{{ marginValue(p) }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import KpiCard from '@/components/common/KpiCard.vue'

const productsStore = useProductsStore()

const products = computed(() => productsStore.products)
const topProducts = computed(() => productsStore.topProducts)

const productKpis = computed(() => ({
  totalProducts: productsStore.totalProducts,
  avgMargin: Number(productsStore.averageMargin),
  topPerformer: productsStore.topProducts.length > 0 ? productsStore.topProducts[0].name : '—',
  topPerformerRevenue: productsStore.topProducts.length > 0
    ? `$${(productsStore.topProducts[0].revenue / 1000000).toFixed(2)}M revenue`
    : '',
  categoryCount: [...new Set(productsStore.products.map(p => p.category))].length,
}))

const categorySeries = computed(() => productsStore.profitabilityData.map(p => Math.round(p.margin)))

const categoryChartOptions = computed(() => ({
  chart: { type: 'radialBar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#94a3b8', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6'],
  plotOptions: {
    radialBar: {
      dataLabels: {
        total: { show: true, label: 'Avg', fontSize: '12px', color: '#94a3b8', formatter: () => `${Number(productsStore.averageMargin)}%` },
        value: { fontSize: '14px', fontWeight: 700, formatter: (val) => `${val}%` },
      },
    },
  },
  labels: productsStore.profitabilityData.map(p => p.category),
  legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } },
}))

function marginClass(product) {
  const margin = ((product.selling_price - product.cost_price) / product.selling_price) * 100
  return margin >= 50 ? 'up' : margin >= 30 ? 'neutral' : 'down'
}

function marginValue(product) {
  return (((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1)
}

onMounted(() => {
  productsStore.fetchProducts()
  productsStore.fetchTopProducts()
  productsStore.fetchProfitability()
})
</script>
