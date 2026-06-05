<template>
  <div class="glass-card p-6" v-motion="skeletonMotion">
    <div class="space-y-4">
      <!-- Icon placeholder -->
      <div class="skeleton h-10 w-10 rounded-xl"></div>
      <!-- Label placeholder -->
      <div class="skeleton h-3 w-20"></div>
      <!-- Value placeholder -->
      <div class="skeleton h-8 w-32"></div>
      <!-- Badge placeholder -->
      <div class="skeleton h-4 w-16"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  index: { type: Number, default: 0 }
})

const skeletonMotion = {
  initial: { opacity: 0, scale: 0.95 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, delay: props.index * 0.05 }
  }
}
</script>
