import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Wandbox API calls to avoid CORS issues in browser dev mode
      '/api/wandbox': {
        target: 'https://wandbox.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wandbox/, '/api'),
        secure: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    env: {
      VITE_SUPABASE_URL: 'https://mock-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-key'
    }
  }
})
