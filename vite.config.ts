import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/functions': {
        target: 'https://subygkafktqvtehfwjmy.supabase.co/functions',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/functions/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const token = req.headers['authorization'];
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
          });
        },
      },
    },
  },
});
