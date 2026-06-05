import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomersStore } from '@/stores/customers'

vi.mock('@/services/api', () => ({
  customersAPI: {
    list: vi.fn(),
    segments: vi.fn(),
    retention: vi.fn(),
  },
}))

import { customersAPI } from '@/services/api'

describe('customers store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('has initial state with default values', () => {
    const store = useCustomersStore()
    expect(store.customers).toEqual([])
    expect(store.segments).toEqual([])
    expect(store.retentionData).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('fetchCustomers falls back to demo data on API failure', async () => {
    customersAPI.list.mockRejectedValue(new Error('Server error'))

    const store = useCustomersStore()
    await store.fetchCustomers()

    expect(store.customers.length).toBe(5)
    expect(store.customers[0].name).toBe('Acme Corp')
    expect(store.customers[0].segment).toBe('Premium')
    expect(store.loading).toBe(false)
  })

  it('fetchSegments falls back to demo data on API failure', async () => {
    customersAPI.segments.mockRejectedValue(new Error('Server error'))

    const store = useCustomersStore()
    await store.fetchSegments()

    expect(store.segments.length).toBe(3)
    expect(store.segments[0].name).toBe('Premium')
    expect(store.segments[0].count).toBe(420)
  })

  it('fetchRetention falls back to demo data on API failure', async () => {
    customersAPI.retention.mockRejectedValue(new Error('Server error'))

    const store = useCustomersStore()
    await store.fetchRetention()

    expect(store.retentionData.length).toBe(12)
    expect(store.retentionData[0].month).toBe('Jan')
    expect(store.retentionData[0].rate).toBe(92)
  })

  it('getter totalCustomers returns the count', () => {
    const store = useCustomersStore()
    store.customers = [{ id: 1 }, { id: 2 }]
    expect(store.totalCustomers).toBe(2)
  })
})
