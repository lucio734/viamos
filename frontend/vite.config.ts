import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Em desenvolvimento, chamadas a /api são encaminhadas ao backend local (evita CORS no dia a dia)
    proxy: { '/api': { target: 'http://localhost:3333', changeOrigin: true } },
  },
  build: { sourcemap: false },
});
