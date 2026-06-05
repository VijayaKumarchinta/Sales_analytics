import { defineStore } from 'pinia'
import { dashboardAPI } from '@/services/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    kpis: {
      revenue: { value: 0, change: 0, prefix: '$' },
      profit: { value: 0, change: 0, prefix: '$' },
      profitMargin: { value: 0, change: 0, suffix: '%' },
      orders: { value: 0, change: 0 },
      customers: { value: 0, change: 0 },
      growthRate: { value: 0, change: 0, suffix: '%' },
    },
    revenueTrend: [],
    quarterlySales: [],
    regionPerformance: [],
    categoryBreakdown: [],
    loading: {
      kpis: false,
      charts: false,
    },
    error: null,
    dateRange: 'year'
  }),

  getters: {
    isLoading: (state) => state.loading.kpis || state.loading.charts,
    revenueData: (state) => ({
      series: [{
        name: 'Revenue',
        data: state.revenueTrend.map(r => r.amount)
      }],
      categories: state.revenueTrend.map(r => r.label)
    }),
    regionData: (state) => ({
      labels: state.regionPerformance.map(r => r.region),
      series: state.regionPerformance.map(r => r.total)
    }),
    categoryData: (state) => ({
      labels: state.categoryBreakdown.map(c => c.name),
      series: state.categoryBreakdown.map(c => c.total)
    }),
  },

  actions: {
    async fetchKPIs() {
      this.loading.kpis = true
      this.error = null
      try {
        const { data } = await dashboardAPI.kpis({ period: this.dateRange })
        this.kpis = { ...this.kpis, ...data }
      } catch (error) {
        this.error = error.message
        // Fall back to demo data
        this.kpis = {
          revenue: { value: 2845000, change: 12.5, prefix: '$' },
          profit: { value: 856000, change: 8.3, prefix: '$' },
          profitMargin: { value: 30.1, change: 2.1, suffix: '%' },
          orders: { value: 15234, change: -3.2 },
          customers: { value: 4892, change: 15.7 },
          growthRate: { value: 22.4, change: 4.8, suffix: '%' },
        }
      } finally {
        this.loading.kpis = false
      }
    },

    async fetchChartData() {
      this.loading.charts = true
      try {
        const [revenue, region, category] = await Promise.all([
          dashboardAPI.revenue({ period: this.dateRange }),
          dashboardAPI.salesByRegion({ period: this.dateRange }),
          dashboardAPI.categoryBreakdown({ period: this.dateRange }),
        ])
        this.revenueTrend = revenue.data
        this.regionPerformance = region.data
        this.categoryBreakdown = category.data
      } catch {
        // Fall back to demo data
        this.revenueTrend = [
          { label: 'Jan', amount: 210000 },
          { label: 'Feb', amount: 195000 },
          { label: 'Mar', amount: 245000 },
          { label: 'Apr', amount: 230000 },
          { label: 'May', amount: 268000 },
          { label: 'Jun', amount: 295000 },
          { label: 'Jul', amount: 310000 },
          { label: 'Aug', amount: 285000 },
          { label: 'Sep', amount: 320000 },
          { label: 'Oct', amount: 298000 },
          { label: 'Nov', amount: 342000 },
          { label: 'Dec', amount: 378000 },
        ]
        this.regionPerformance = [
          { region: 'North America', total: 1250000 },
          { region: 'Europe', total: 890000 },
          { region: 'Asia Pacific', total: 456000 },
          { region: 'Latin America', total: 128000 },
          { region: 'Middle East', total: 95000 },
          { region: 'Africa', total: 42000 },
        ]
        this.categoryBreakdown = [
          { name: 'Electronics', total: 980000 },
          { name: 'Clothing', total: 650000 },
          { name: 'Home & Garden', total: 420000 },
          { name: 'Sports', total: 310000 },
          { name: 'Books', total: 185000 },
          { name: 'Other', total: 298000 },
        ]
      } finally {
        this.loading.charts = false
      }
    },

    setDateRange(range) {
      this.dateRange = range
      this.fetchKPIs()
      this.fetchChartData()
    }
  }
})
