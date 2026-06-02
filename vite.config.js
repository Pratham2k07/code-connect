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
  }
})
