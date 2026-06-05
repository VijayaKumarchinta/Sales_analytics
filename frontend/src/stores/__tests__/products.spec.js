import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'

vi.mock('@/services/api', () => ({
  productsAPI: {
    list: vi.fn(),
    topProducts: vi.fn(),
    profitability: vi.fn(),
  },
}))

import { productsAPI } from '@/services/api'

describe('products store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('has initial state with default values', () => {
    const store = useProductsStore()
    expect(store.products).toEqual([])
    expect(store.topProducts).toEqual([])
    expect(store.profitabilityData).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('fetchProducts falls back to demo data on API failure', async () => {
    productsAPI.list.mockRejectedValue(new Error('Server error'))

    const store = useProductsStore()
    await store.fetchProducts()

    expect(store.products.length).toBe(5)
    expect(store.products[0].name).toBe('Smartphone X')
    expect(store.products[0].category).toBe('Electronics')
    expect(store.loading).toBe(false)
  })

  it('fetchTopProducts falls back to demo data on API failure', async () => {
    productsAPI.topProducts.mockRejectedValue(new Error('Server error'))

    const store = useProductsStore()
    await store.fetchTopProducts()

    expect(store.topProducts.length).toBe(8)
    expect(store.topProducts[0].name).toBe('Laptop Pro')
  })

  it('fetchProfitability falls back to demo data on API failure', async () => {
    productsAPI.profitability.mockRejectedValue(new Error('Server error'))

    const store = useProductsStore()
    await store.fetchProfitability()

    expect(store.profitabilityData.length).toBe(3)
    expect(store.profitabilityData[0].category).toBe('Electronics')
  })

  it('getter totalProducts returns the count', () => {
    const store = useProductsStore()
    store.products = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(store.totalProducts).toBe(3)
  })

  it('getter averageMargin computes average profit margin', () => {
    const store = useProductsStore()
    store.products = [
      { cost_price: 50, selling_price: 100 },
      { cost_price: 20, selling_price: 50 },
    ]
    // Product 1: (100-50)/100 = 50%
    // Product 2: (50-20)/50 = 60%
    // Average: 55.0
    expect(store.averageMargin).toBe('55.0')
  })
})
