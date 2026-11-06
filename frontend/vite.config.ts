import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  resolve: {
    alias: {
      'react/jsx-runtime': 'react',
      'react/jsx-dev-runtime': 'react',
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
  },
});
