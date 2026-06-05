<template>
  <div class="glass-card p-6" v-motion="placeholderMotion">
    <div class="flex items-center justify-between mb-6">
      <div class="skeleton h-5 w-36"></div>
      <div class="skeleton h-8 w-20 rounded-lg"></div>
    </div>
    <div class="space-y-3">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3">
        <div class="skeleton h-4 w-12"></div>
        <div class="flex-1 skeleton h-8 rounded-lg" :style="{ width: `${30 + Math.random() * 60}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const placeholderMotion = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5 } }
}
</script>
