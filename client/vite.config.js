import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * App build — Vercel preview of the chat widget (center mode).
 * Embed library is built separately: npm run build:embed
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
