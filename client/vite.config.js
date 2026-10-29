import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // /api ki saari calls backend (port 5000) pe jaayengi
    proxy: { '/api': 'http://localhost:5000' },
  },
})
