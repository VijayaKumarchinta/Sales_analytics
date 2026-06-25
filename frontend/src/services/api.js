import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Supabase access token to every request
api.interceptors.request.use(async (config) => {
  const { supabase } = await import('@/services/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle 401 responses — try refreshing session before redirecting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      try {
        const { supabase } = await import('@/services/supabase')
        const { data: { session }, error: refreshError } = await supabase.auth.getSession()
        // If we have a session, maybe it was a stale token — retry the original request
        if (session && !refreshError) {
          error.config.headers.Authorization = `Bearer ${session.access_token}`
          return api.request(error.config)
        }
      } catch {
        // Refresh failed — redirect to login
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API — uses Supabase SDK directly (these are placeholders for backward compat)
export const authAPI = {
  login: () => Promise.reject(new Error('Use authStore.login() instead')),
  register: () => Promise.reject(new Error('Use authStore.signUp() instead')),
  me: () => api.get('/me/'),
  refresh: () => Promise.reject(new Error('Use Supabase refresh')),
}

// Dashboard API
export const dashboardAPI = {
  kpis: (params) => api.get('/dashboard/kpis/', { params }),
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
