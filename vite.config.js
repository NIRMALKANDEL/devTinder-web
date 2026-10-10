import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Added: dev-only proxy so the local frontend's "/api" calls reach the local backend
  // (production is unaffected — there nginx proxies "/api" to the backend)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:7777",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        ws: true, // Added: chat (Socket.IO) runs through the same proxy
      },
    },
  },
})
