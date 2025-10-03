import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-polyfills',
      transformIndexHtml(html) {
        // Inject polyfills before the main script
        return html.replace(
          '</head>',
          `<script>
// Critical polyfills - must run before any module code
if (!window.Request || !window.Response) {
  console.warn('⚠️ Request/Response polyfills required');
}

// Polyfill Request
if (typeof window.Request === 'undefined') {
  window.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = init.headers || {};
      this.body = init.body;
      this.credentials = init.credentials || 'same-origin';
      this.cache = init.cache || 'default';
      this.mode = init.mode || 'cors';
      this.redirect = init.redirect || 'follow';
      this.referrer = init.referrer || '';
      this.integrity = init.integrity || '';
    }
    clone() {
      return new Request(this.url, this);
    }
  };
  globalThis.Request = window.Request;
}

// Polyfill Response  
if (typeof window.Response === 'undefined') {
  window.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = init.headers || {};
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'basic';
      this.url = '';
    }
    clone() {
      return new Response(this.body, this);
    }
    json() {
      try {
        return Promise.resolve(JSON.parse(this.body));
      } catch(e) {
        return Promise.reject(e);
      }
    }
    text() {
      return Promise.resolve(String(this.body));
    }
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
    blob() {
      return Promise.resolve(new Blob([this.body]));
    }
  };
  globalThis.Response = window.Response;
}

console.log('✅ Polyfills loaded:', { Request: !!window.Request, Response: !!window.Response });
</script>
</head>`
        );
      }
    }
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
