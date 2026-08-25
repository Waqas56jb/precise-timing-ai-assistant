import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Library build — single-file embed.js for website footer / GoDaddy.
 * Run: npm run build:embed
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'PreciseTimingChat',
      formats: ['iife'],
      fileName: () => 'embed.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: 'embed.[ext]',
      },
    },
    outDir: 'dist-embed',
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
