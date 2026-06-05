import { defineStore } from 'pinia'
import { productsAPI } from '@/services/api'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    topProducts: [],
    profitabilityData: [],
    categoryAnalysis: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalProducts: (state) => state.products.length,
    averageMargin: (state) => {
      if (!state.products.length) return 0
      const total = state.products.reduce((sum, p) => {
        const margin = ((Number(p.selling_price) - Number(p.cost_price)) / Number(p.selling_price)) * 100
        return sum + margin
      }, 0)
      return (total / state.products.length).toFixed(1)
    },
    topPerforming: (state) => state.topProducts.slice(0, 5),
    bottomPerforming: (state) => [...state.topProducts].reverse().slice(0, 5),
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const { data } = await productsAPI.list()
        this.products = data.results || data
      } catch {
        this.products = [
          { id: 1, name: 'Smartphone X', category: 'Electronics', cost_price: 400, selling_price: 799, units_sold: 1234, revenue: 985966 },
          { id: 2, name: 'Laptop Pro', category: 'Electronics', cost_price: 800, selling_price: 1499, units_sold: 856, revenue: 1283144 },
          { id: 3, name: 'Running Shoes', category: 'Sports', cost_price: 45, selling_price: 120, units_sold: 2341, revenue: 280920 },
          { id: 4, name: 'Desk Chair', category: 'Home & Garden', cost_price: 120, selling_price: 299, units_sold: 567, revenue: 169533 },
          { id: 5, name: 'Wireless Earbuds', category: 'Electronics', cost_price: 30, selling_price: 89, units_sold: 3456, revenue: 307584 },
        ]
      } finally {
        this.loading = false
      }
    },

    async fetchTopProducts() {
      try {
        const { data } = await productsAPI.topProducts()
        this.topProducts = data
      } catch {
        this.topProducts = [
          { name: 'Laptop Pro', revenue: 1283144, profit: 598144, margin: 46.6 },
          { name: 'Smartphone X', revenue: 985966, profit: 492366, margin: 49.9 },
          { name: 'Wireless Earbuds', revenue: 307584, profit: 203904, margin: 66.3 },
          { name: 'Running Shoes', revenue: 280920, profit: 175575, margin: 62.5 },
          { name: 'Coffee Maker', revenue: 198450, profit: 119070, margin: 60.0 },
          { name: 'Desk Chair', revenue: 169533, profit: 101511, margin: 59.9 },
          { name: 'Yoga Mat', revenue: 98760, profit: 69062, margin: 69.9 },
          { name: 'Backpack', revenue: 87650, profit: 52590, margin: 60.0 },
        ]
      }
    },

    async fetchProfitability() {
      try {
        const { data } = await productsAPI.profitability()
        this.profitabilityData = data
      } catch {
        this.profitabilityData = [
          { category: 'Electronics', revenue: 2576694, profit: 1094414, margin: 42.5, count: 3 },
          { category: 'Sports', revenue: 379680, profit: 244637, margin: 64.4, count: 2 },
          { category: 'Home & Garden', revenue: 169533, profit: 101511, margin: 59.9, count: 1 },
        ]
      }
    },
  }
})
