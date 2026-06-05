import { defineStore } from 'pinia'
import { customersAPI } from '@/services/api'

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [],
    segments: [],
    lifetimeValues: [],
    retentionData: [],
    loading: false,
    error: null,
    filters: { page: 1, pageSize: 50 }
  }),

  getters: {
    totalCustomers: (state) => state.customers.length,
    segmentDistribution: (state) => {
      const counts = {}
      state.segments.forEach(s => { counts[s.name] = s.count })
      return counts
    },
  },

  actions: {
    async fetchCustomers() {
      this.loading = true
      try {
        const { data } = await customersAPI.list(this.filters)
        this.customers = data.results || data
      } catch {
        this.customers = [
          { id: 1, name: 'Acme Corp', email: 'contact@acme.com', city: 'New York', country: 'USA', total_spent: 145000, orders: 45, segment: 'Premium' },
          { id: 2, name: 'GlobalTech', email: 'info@globaltech.com', city: 'London', country: 'UK', total_spent: 98000, orders: 32, segment: 'Premium' },
          { id: 3, name: 'MegaShop', email: 'sales@megashop.com', city: 'Tokyo', country: 'Japan', total_spent: 72000, orders: 28, segment: 'Standard' },
          { id: 4, name: 'RetailPlus', email: 'hello@retailplus.com', city: 'Sydney', country: 'Australia', total_spent: 45000, orders: 18, segment: 'Standard' },
          { id: 5, name: 'SmallBiz Co', email: 'owner@smallbiz.com', city: 'Berlin', country: 'Germany', total_spent: 12000, orders: 8, segment: 'Basic' },
        ]
      } finally {
        this.loading = false
      }
    },

    async fetchSegments() {
      try {
        const { data } = await customersAPI.segments()
        this.segments = data
      } catch {
        this.segments = [
          { name: 'Premium', count: 420, value: 1240000 },
          { name: 'Standard', count: 1850, value: 2850000 },
          { name: 'Basic', count: 2622, value: 980000 },
        ]
      }
    },

    async fetchRetention() {
      try {
        const { data } = await customersAPI.retention()
        this.retentionData = data
      } catch {
        this.retentionData = [
          { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 },
          { month: 'Mar', rate: 94 }, { month: 'Apr', rate: 90 },
          { month: 'May', rate: 91 }, { month: 'Jun', rate: 93 },
          { month: 'Jul', rate: 89 }, { month: 'Aug', rate: 95 },
          { month: 'Sep', rate: 92 }, { month: 'Oct', rate: 91 },
          { month: 'Nov', rate: 94 }, { month: 'Dec', rate: 96 },
        ]
      }
    },
  }
})
