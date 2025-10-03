import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to inject polyfills banner into bundle
const polyfillBannerPlugin = () => {
  return {
    name: 'polyfill-banner',
    transformIndexHtml(html) {
      // Inject inline script at the very beginning
      return html.replace(
        '<head>',
        `<head>
    <script>
      // Emergency polyfills injected by Vite
      if (!globalThis.Request) globalThis.Request = window.Request = class Request{constructor(e,t){t=t||{},this.url="string"==typeof e?e:e?e.url:"",this.method=t.method||"GET",this.headers=t.headers||{},this.body=t.body}clone(){return new Request(this.url,this)}};
      if (!globalThis.Response) globalThis.Response = window.Response = class Response{constructor(e,t){t=t||{},this.body=e,this.status=t.status||200,this.ok=this.status>=200&&this.status<300}clone(){return new Response(this.body,this)}json(){return Promise.resolve(JSON.parse(this.body))}};
      if (!globalThis.Headers) globalThis.Headers = window.Headers = class Headers{constructor(e){this._headers={};if(e)for(var t in e)this._headers[t.toLowerCase()]=e[t]}get(e){return this._headers[e.toLowerCase()]}set(e,t){this._headers[e.toLowerCase()]=t}};
    </script>`
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    polyfillBannerPlugin(),
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
