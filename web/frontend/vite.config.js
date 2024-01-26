import { defineConfig, loadEnv } from 'vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

if (
  process.env.npm_lifecycle_event === 'build' &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    '\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n'
  );
}

const BACKEND_PORT = 58939 || process.env.BACKEND_PORT;

const proxyOptions = {
  target: `http://127.0.0.1:${BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, '')
  : 'localhost';

let hmrConfig;
if (host === 'localhost') {
  hmrConfig = {
    protocol: 'ws',
    host: 'localhost',
    port: 64999,
    clientPort: 64999
  };
} else {
  hmrConfig = {
    protocol: 'wss',
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  define: {
    'process.env': process.env,
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY),
    'process.env.VITE_PRODUCER_SHOP_URL': JSON.stringify(
      process?.env?.PRODUCER_SHOP_URL || ''
    )
  },
  resolve: {
    preserveSymlinks: true
  },
  server: {
    host: 'localhost',
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      '^/(\\?.*)?$': proxyOptions,
      '^/api(/|(\\?.*)?$)': proxyOptions,
      '^/fdc(/|(\\?.*)?$)': proxyOptions,
      '^/ofn(/|(\\?.*)?$)': proxyOptions,
      '^/oidc(/|(\\?.*)?$)': proxyOptions,
      '^/auth(/|(\\?.*)?$)': proxyOptions,
      '^/hub(/|(\\?.*)?$)': proxyOptions
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      }
    }
  },

  build: {
    target: ['esnext']
  }
});
