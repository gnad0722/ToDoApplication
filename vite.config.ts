import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_API_BASE_URL || 'http://localhost:8080';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      port: 5173,
      // In development the browser calls /api on the Vite server, which forwards
      // to the backend, so the backend needs no CORS configuration.
      // `/push-token` (device registration for push notifications) lives outside /api.
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/push-token': { target: backend, changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@tanstack/react-query', 'axios', 'zod', 'react-hook-form', '@hookform/resolvers', 'date-fns', 'sonner'],
          },
        },
      },
    },
  };
});
