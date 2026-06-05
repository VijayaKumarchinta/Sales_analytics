import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/token/refresh/', {
            refresh: refreshToken
          })
          localStorage.setItem('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.push('/login')
          return Promise.reject(refreshError)
        }
      } else {
        localStorage.removeItem('access_token')
        router.push('/login')
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  register: (data) => api.post('/register/', data),
  me: () => api.get('/me/'),
  refresh: (refresh) => api.post('/token/refresh/', { refresh }),
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
