import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'extension' ? './' : '/FocuzStreak/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: mode === 'extension'
        ? { main: 'index.extension.html', content: 'src/content.tsx' }
        : { main: 'index.html', content: 'src/content.tsx' },
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
}));