<template>
  <div class="flex flex-col items-center justify-center py-16 px-4" v-motion="errorMotion">
    <div class="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
      <svg class="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-surface-800 mb-1">Something went wrong</h3>
    <p class="text-sm text-surface-500 mb-6 text-center max-w-md">{{ message || 'An unexpected error occurred. Please try again.' }}</p>
    <button v-if="showRetry" @click="$emit('retry')" class="btn-primary">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Try Again
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  showRetry: { type: Boolean, default: true }
})

defineEmits(['retry'])

const errorMotion = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
}
</script>
