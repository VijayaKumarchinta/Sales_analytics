import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    root: resolve(__dirname, 'src'),
    include: ['**/*.spec.js'],
    setupFiles: [resolve(__dirname, 'src/tests/setup.js')],
  }
})
