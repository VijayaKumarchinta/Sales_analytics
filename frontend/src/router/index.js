import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue'),
    meta: { layout: 'landing' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'landing', guest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'landing', guest: true }
  },
  {
    path: '/dataset/import',
    name: 'DatasetImport',
    component: () => import('@/pages/DatasetImportPage.vue'),
    meta: { layout: 'landing' }
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },

    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/DashboardPage.vue')
      },
      {
        path: 'sales',
        name: 'SalesAnalysis',
        component: () => import('@/pages/SalesAnalysisPage.vue')
      },
      {
        path: 'profit',
        name: 'ProfitAnalysis',
        component: () => import('@/pages/ProfitAnalysisPage.vue')
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/pages/CustomersPage.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/pages/ProductsPage.vue')
      },
      {
        path: 'regions',
        name: 'Regions',
        component: () => import('@/pages/RegionsPage.vue')
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/ReportsPage.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/SettingsPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Auth guard — redirect to login if not authenticated
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const { supabase } = await import('@/services/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
