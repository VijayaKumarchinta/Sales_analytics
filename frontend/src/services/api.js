import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Auth removed: endpoints are public

export const authAPI = {
  login: () => Promise.reject(new Error('Auth disabled')),
  register: () => Promise.reject(new Error('Auth disabled')),
  me: () => Promise.reject(new Error('Auth disabled')),
  refresh: () => Promise.reject(new Error('Auth disabled')),
}


// Dashboard API
export const dashboardAPI = {
  kpis: () => api.get('/dashboard/kpis/'),
  revenue: (params) => api.get('/dashboard/revenue/', { params }),
  salesByRegion: (params) => api.get('/dashboard/sales-by-region/', { params }),
  categoryBreakdown: (params) => api.get('/dashboard/category-breakdown/', { params }),
}

// Sales API
export const salesAPI = {
  list: (params) => api.get('/sales/', { params }),
  detail: (id) => api.get(`/sales/${id}/`),
  trends: (params) => api.get('/sales/trends/', { params }),
  quarterly: (params) => api.get('/sales/quarterly/', { params }),
}

// Customers API
export const customersAPI = {
  list: (params) => api.get('/customers/', { params }),
  detail: (id) => api.get(`/customers/${id}/`),
  segments: () => api.get('/customers/segments/'),
  lifetimeValue: () => api.get('/customers/lifetime-value/'),
  retention: () => api.get('/customers/retention/'),
}

// Products API
export const productsAPI = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  topProducts: (params) => api.get('/products/top/', { params }),
  profitability: () => api.get('/products/profitability/'),
  categoryAnalysis: () => api.get('/products/category-analysis/'),
}

// Reports API
export const reportsAPI = {
  exportPDF: (params) => api.get('/reports/export/pdf/', { params, responseType: 'blob' }),
  exportCSV: (params) => api.get('/reports/export/csv/', { params, responseType: 'blob' }),
  email: (data) => api.post('/reports/email/', data),
}

// Regions API
export const regionsAPI = {
  list: () => api.get('/regions/'),
  performance: (params) => api.get('/regions/performance/', { params }),
}

export default api
