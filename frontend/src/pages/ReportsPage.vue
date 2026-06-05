<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="glass-card p-6" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }">
      <h2 class="text-lg font-bold text-surface-800">Reports & Exports</h2>
      <p class="text-sm text-surface-500 mt-1">Generate and export professional reports in PDF or CSV format. Schedule automated email reports.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- PDF Export -->
      <div class="glass-card-hover p-6 flex flex-col items-center text-center" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05 } }">
        <div class="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-surface-800 mb-1">PDF Report</h3>
        <p class="text-sm text-surface-500 mb-6">Export a complete analytics report as a professional PDF document.</p>
        <div class="w-full space-y-3 mb-6">
          <select v-model="pdfPeriod" class="input-field text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <button @click="exportPDF" class="btn-primary w-full justify-center">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      <!-- CSV Export -->
      <div class="glass-card-hover p-6 flex flex-col items-center text-center" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }">
        <div class="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-surface-800 mb-1">CSV Export</h3>
        <p class="text-sm text-surface-500 mb-6">Download raw data as CSV for use in Excel, Sheets, or other tools.</p>
        <div class="w-full space-y-3 mb-6">
          <select v-model="csvType" class="input-field text-sm">
            <option value="sales">Sales Data</option>
            <option value="customers">Customer Data</option>
            <option value="products">Product Data</option>
            <option value="regions">Regional Data</option>
          </select>
        </div>
        <button @click="exportCSV" class="btn-secondary w-full justify-center">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <!-- Email Report -->
      <div class="glass-card-hover p-6 flex flex-col items-center text-center" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 } }">
        <div class="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-surface-800 mb-1">Email Report</h3>
        <p class="text-sm text-surface-500 mb-6">Schedule automated reports to be sent directly to your inbox.</p>
        <div class="w-full space-y-3 mb-6">
          <input v-model="emailAddress" type="email" placeholder="your@email.com" class="input-field text-sm" />
          <select v-model="emailFrequency" class="input-field text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button @click="scheduleEmail" class="btn-primary w-full justify-center">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule Report
        </button>
      </div>
    </div>

    <!-- Success Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="showToast" class="fixed bottom-8 right-8 glass-card px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-surface-800">{{ toastTitle }}</p>
            <p class="text-xs text-surface-500">{{ toastMessage }}</p>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { saveAs } from 'file-saver'

const pdfPeriod = ref('year')
const csvType = ref('sales')
const emailAddress = ref('')
const emailFrequency = ref('weekly')
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')

function showNotification(title, message) {
  toastTitle.value = title
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

function exportPDF() {
  // In production, this would call the backend API
  showNotification('PDF Generated', `Report for ${pdfPeriod.value} has been generated successfully.`)
}

function exportCSV() {
  // Generate CSV content
  const headers = {
    sales: 'Date,Product,Quantity,Amount,Profit,Region\n',
    customers: 'Name,Email,City,Country,Total Spent,Orders\n',
    products: 'Name,Category,Cost Price,Selling Price,Units Sold\n',
    regions: 'Region,Revenue,Profit,Orders,Growth\n',
  }
  const blob = new Blob([headers[csvType.value]], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${csvType.value}-export-${Date.now()}.csv`)
  showNotification('CSV Exported', `${csvType.value.charAt(0).toUpperCase() + csvType.value.slice(1)} data exported successfully.`)
}

function scheduleEmail() {
  if (!emailAddress.value) return
  showNotification('Report Scheduled', `Reports will be sent ${emailFrequency.value} to ${emailAddress.value}`)
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
