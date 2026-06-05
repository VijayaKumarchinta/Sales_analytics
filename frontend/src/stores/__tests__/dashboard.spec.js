import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'

// Mock the API service
vi.mock('@/services/api', () => ({
  dashboardAPI: {
    kpis: vi.fn(),
    revenue: vi.fn(),
    salesByRegion: vi.fn(),
    categoryBreakdown: vi.fn(),
  },
}))

import { dashboardAPI } from '@/services/api'

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('has initial state with default values', () => {
    const store = useDashboardStore()
    expect(store.kpis.revenue.value).toBe(0)
    expect(store.kpis.profit.value).toBe(0)
    expect(store.kpis.orders.value).toBe(0)
    expect(store.kpis.customers.value).toBe(0)
    expect(store.revenueTrend).toEqual([])
    expect(store.regionPerformance).toEqual([])
    expect(store.categoryBreakdown).toEqual([])
    expect(store.dateRange).toBe('year')
    expect(store.loading.kpis).toBe(false)
    expect(store.loading.charts).toBe(false)
    expect(store.error).toBeNull()
  })

  it('getter isLoading returns true when KPIs are loading', () => {
    const store = useDashboardStore()
    expect(store.isLoading).toBe(false)
    store.loading.kpis = true
    expect(store.isLoading).toBe(true)
    store.loading.kpis = false
    store.loading.charts = true
    expect(store.isLoading).toBe(true)
  })

  it('getter revenueData maps revenueTrend to series and categories', () => {
    const store = useDashboardStore()
    store.revenueTrend = [
      { label: 'Jan', amount: 1000 },
      { label: 'Feb', amount: 2000 },
    ]
    expect(store.revenueData).toEqual({
      series: [{ name: 'Revenue', data: [1000, 2000] }],
      categories: ['Jan', 'Feb'],
    })
  })

  it('getter regionData maps regionPerformance to labels and series', () => {
    const store = useDashboardStore()
    store.regionPerformance = [
      { region: 'North', total: 500 },
      { region: 'South', total: 300 },
    ]
    expect(store.regionData).toEqual({
      labels: ['North', 'South'],
      series: [500, 300],
    })
  })

  it('getter categoryData maps categoryBreakdown to labels and series', () => {
    const store = useDashboardStore()
    store.categoryBreakdown = [
      { name: 'Electronics', total: 1000 },
      { name: 'Clothing', total: 500 },
    ]
    expect(store.categoryData).toEqual({
      labels: ['Electronics', 'Clothing'],
      series: [1000, 500],
    })
  })

  it('fetchKPIs sets KPIs from API on success', async () => {
    dashboardAPI.kpis.mockResolvedValue({
      data: {
        revenue: { value: 100000, change: 10, prefix: '$' },
        profit: { value: 30000, change: 5, prefix: '$' },
      },
    })

    const store = useDashboardStore()
    await store.fetchKPIs()

    expect(store.kpis.revenue.value).toBe(100000)
    expect(store.kpis.revenue.change).toBe(10)
    // Other KPIs should keep defaults merged
    expect(store.kpis.orders.value).toBe(0)
    expect(store.loading.kpis).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchKPIs falls back to demo data on API failure', async () => {
    dashboardAPI.kpis.mockRejectedValue(new Error('Network error'))

    const store = useDashboardStore()
    await store.fetchKPIs()

    expect(store.kpis.revenue.value).toBe(2845000)
    expect(store.kpis.profit.value).toBe(856000)
    expect(store.kpis.orders.value).toBe(15234)
    expect(store.kpis.customers.value).toBe(4892)
    expect(store.loading.kpis).toBe(false)
  })

  it('fetchChartData sets chart data from API on success', async () => {
    dashboardAPI.revenue.mockResolvedValue({
      data: [{ label: 'Jan', amount: 5000 }],
    })
    dashboardAPI.salesByRegion.mockResolvedValue({
      data: [{ region: 'East', total: 3000 }],
    })
    dashboardAPI.categoryBreakdown.mockResolvedValue({
      data: [{ name: 'Books', total: 1500 }],
    })

    const store = useDashboardStore()
    await store.fetchChartData()

    expect(store.revenueTrend).toEqual([{ label: 'Jan', amount: 5000 }])
    expect(store.regionPerformance).toEqual([{ region: 'East', total: 3000 }])
    expect(store.categoryBreakdown).toEqual([{ name: 'Books', total: 1500 }])
    expect(store.loading.charts).toBe(false)
  })

  it('fetchChartData falls back to demo data on API failure', async () => {
    dashboardAPI.revenue.mockRejectedValue(new Error('Server error'))
    dashboardAPI.salesByRegion.mockRejectedValue(new Error('Server error'))
    dashboardAPI.categoryBreakdown.mockRejectedValue(new Error('Server error'))

    const store = useDashboardStore()
    await store.fetchChartData()

    expect(store.revenueTrend.length).toBe(12)
    expect(store.revenueTrend[0].label).toBe('Jan')
    expect(store.regionPerformance.length).toBe(6)
    expect(store.categoryBreakdown.length).toBe(6)
    expect(store.loading.charts).toBe(false)
  })

  it('setDateRange updates dateRange and calls fetchKPIs and fetchChartData', async () => {
    dashboardAPI.kpis.mockResolvedValue({ data: {} })
    dashboardAPI.revenue.mockResolvedValue({ data: [] })
    dashboardAPI.salesByRegion.mockResolvedValue({ data: [] })
    dashboardAPI.categoryBreakdown.mockResolvedValue({ data: [] })

    const store = useDashboardStore()
    store.setDateRange('30d')

    expect(store.dateRange).toBe('30d')
    // Wait for the async calls
    await new Promise(process.nextTick)
    expect(dashboardAPI.kpis).toHaveBeenCalledWith({ period: '30d' })
    expect(dashboardAPI.revenue).toHaveBeenCalledWith({ period: '30d' })
    expect(dashboardAPI.salesByRegion).toHaveBeenCalledWith({ period: '30d' })
    expect(dashboardAPI.categoryBreakdown).toHaveBeenCalledWith({ period: '30d' })
  })
})
