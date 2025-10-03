import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
  server: {
    port: 3001,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          charts: ['recharts', 'react-circular-progressbar'],
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Polyfill for Request/Response objects if needed
      'node-fetch': 'isomorphic-fetch',
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'framer-motion', 
      'lucide-react',
      'whatwg-fetch'
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
    },
  }
})
