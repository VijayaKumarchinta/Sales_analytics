import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSalesStore } from '@/stores/sales'

vi.mock('@/services/api', () => ({
  salesAPI: {
    list: vi.fn(),
    trends: vi.fn(),
    quarterly: vi.fn(),
  },
}))

import { salesAPI } from '@/services/api'

describe('sales store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('has initial state with default values', () => {
    const store = useSalesStore()
    expect(store.sales).toEqual([])
    expect(store.trends).toEqual([])
    expect(store.quarterlyData).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.filters.page).toBe(1)
    expect(store.filters.pageSize).toBe(50)
  })

  it('getter totalRevenue sums sales_amount from sales', () => {
    const store = useSalesStore()
    store.sales = [
      { sales_amount: '1000', profit: '200' },
      { sales_amount: '2000', profit: '400' },
    ]
    expect(store.totalRevenue).toBe(3000)
  })

  it('getter totalProfit sums profit from sales', () => {
    const store = useSalesStore()
    store.sales = [
      { sales_amount: '1000', profit: '200' },
      { sales_amount: '2000', profit: '400' },
    ]
    expect(store.totalProfit).toBe(600)
  })

  it('getter totalOrders returns the number of sales', () => {
    const store = useSalesStore()
    store.sales = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(store.totalOrders).toBe(3)
  })

  it('fetchTrends falls back to demo data on API failure', async () => {
    salesAPI.trends.mockRejectedValue(new Error('Server error'))

    const store = useSalesStore()
    await store.fetchTrends()

    expect(store.trends.length).toBe(12)
    expect(store.trends[0].month).toBe('Jan')
    expect(store.trends[11].month).toBe('Dec')
  })

  it('fetchQuarterly falls back to demo data on API failure', async () => {
    salesAPI.quarterly.mockRejectedValue(new Error('Server error'))

    const store = useSalesStore()
    await store.fetchQuarterly()

    expect(store.quarterlyData.length).toBe(4)
    expect(store.quarterlyData[0].quarter).toBe('Q1')
    expect(store.quarterlyData[3].quarter).toBe('Q4')
  })

  it('setFilters resets page to 1 and calls fetchSales', async () => {
    salesAPI.list.mockResolvedValue({ data: { results: [], count: 0 } })

    const store = useSalesStore()
    store.filters.page = 5
    store.setFilters({ region: 'North' })

    expect(store.filters.region).toBe('North')
    expect(store.filters.page).toBe(1)
    expect(salesAPI.list).toHaveBeenCalled()
  })
})
