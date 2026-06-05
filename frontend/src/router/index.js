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

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('access_token')
  if (requiresAuth && !token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
