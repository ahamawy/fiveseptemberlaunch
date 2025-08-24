import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: [
      'tests/investor-portal.spec.ts'
    ],
    exclude: [
      'e2e/**',
      'FEATURES/**',
      'lib/services/fee-engine/__tests__/**'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})