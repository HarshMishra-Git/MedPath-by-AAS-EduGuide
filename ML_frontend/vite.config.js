import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  // Add polyfills for Node.js globals
  define: {
    'process.env': {},
    global: 'globalThis',
  },
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
      ignoreDynamicRequires: true,
    },
    target: 'es2015',
    minify: 'esbuild',
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
      'lucide-react'
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
    },
  }
})
