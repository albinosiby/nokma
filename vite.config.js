import { defineConfig } from 'vite';

export default defineConfig({
  // Absolute root paths for Cloudflare Pages / custom domain hosting.
  base: '/',
  server: { port: 5173, open: false },
  preview: { port: 4173 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 900,
  },
});
