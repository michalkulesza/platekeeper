import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174,
    host: true,
  },
})
