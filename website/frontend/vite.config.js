// VITE CONFIG - the dev server and the production build of the KidBuddy website.
//
// In development the page runs on http://localhost:5173 and every /api and /web-api request is
// passed to the website backend (website/backend, default http://localhost:5050). So the browser
// only ever talks to ONE origin, and the login cookie works without any CORS setup.
// Change the backend address with the VITE_BACKEND_URL variable (in website/frontend/.env).

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_BACKEND_URL || 'http://localhost:5050';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: backend, changeOrigin: false },
        '/web-api': { target: backend, changeOrigin: false },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
    },
  };
});
