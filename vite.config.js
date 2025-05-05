import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,      // pick a port you like
    strictPort: true // bail if it’s already in use
  },
  plugins: [react()],
})
