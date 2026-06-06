<template>
  <div class="max-w-3xl mx-auto">
    <div class="glass-card p-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Import your dataset</h1>
        <p class="text-sm text-surface-500 dark:text-surface-400 mt-2">
          Upload a CSV file matching the expected columns (Product, Region, Month, Units_Sold, Unit_Price_USD, Discount_%, Revenue_USD).
        </p>
      </div>

      <form @submit.prevent="importDataset" class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            class="block w-full text-sm text-surface-600 dark:text-surface-300"
            @change="onFileChange"
          />
          <p v-if="error" class="text-sm text-danger-600 dark:text-danger-400">{{ error }}</p>
          <p v-else-if="fileName" class="text-sm text-surface-500 dark:text-surface-400">Selected: {{ fileName }}</p>
        </div>

        <label class="flex items-center gap-3 text-sm text-surface-700 dark:text-surface-300">
          <input type="checkbox" v-model="clearFirst" class="w-4 h-4" />
          Clear existing data before importing
        </label>

        <button
          class="btn-primary w-full py-3"
          type="submit"
          :disabled="loading || !file"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin mr-2 inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Importing...' : 'Import dataset' }}
        </button>
      </form>

      <div v-if="result" class="mt-6">
        <div class="p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/30">
          <p class="text-sm font-semibold text-primary-700 dark:text-primary-300">Import completed</p>
          <ul class="text-sm text-surface-600 dark:text-surface-300 mt-2">
            <li>CSV records: <span class="font-mono">{{ result.csv_records }}</span></li>
            <li>Products: <span class="font-mono">{{ result.products }}</span></li>
            <li>Customers: <span class="font-mono">{{ result.customers }}</span></li>
            <li>Sales: <span class="font-mono">{{ result.sales }}</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useDashboardStore } from '@/stores/dashboard'

const router = useRouter()
const dashboardStore = useDashboardStore()

const file = ref(null)
const fileName = ref('')
const clearFirst = ref(true)
const loading = ref(false)
const error = ref('')
const result = ref(null)

function onFileChange(e) {
  error.value = ''
  const f = e.target.files?.[0]
  file.value = f || null
  fileName.value = f?.name || ''
}

async function importDataset() {
  if (!file.value) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const form = new FormData()
    form.append('file', file.value)
    form.append('clear', clearFirst.value)

    // Use direct axios (no JWT)
    const baseURL = import.meta.env.VITE_API_URL || '/api'
    const resp = await axios.post(`${baseURL}/dataset/import/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    result.value = resp.data.import

    // Refresh dashboard data
    await dashboardStore.fetchKPIs()
    await dashboardStore.fetchChartData()

    router.push('/dashboard')
  } catch (e) {
    error.value = e?.response?.data?.detail || e?.message || 'Import failed'
  } finally {
    loading.value = false
  }
}
</script>

