import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5173, open: false },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 900,
  },
});
