import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: process.env.PORT || 5173, // Use the PORT environment variable or default to 5173
    allowedHosts: ['quest-3ica.onrender.com'], // Allow requests from this host
    proxy: {
      '/api': {
        target: 'http://localhost:5012',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
