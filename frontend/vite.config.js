import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        // Preserve all request headers — including Authorization — when
        // forwarding through the proxy. Without this, Vite can drop custom
        // headers on certain request types, causing JWT 422 errors.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward the Authorization header explicitly
            if (req.headers['authorization']) {
              proxyReq.setHeader('Authorization', req.headers['authorization'])
            }
          })
        },
      },
    },
  },
})
