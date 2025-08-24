import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/FocuzStreak/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});