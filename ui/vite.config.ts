import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/', // Fixes static asset issues in production
    optimizeDeps: {
      exclude: ['pg', 'bcryptjs'], // Exclude backend dependencies
    },
    server: {
      port: 3000, // Ensures consistent dev server port
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:10000', // Ensure the env variable is correctly loaded
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined, // Handles chunking for better performance
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Allows importing with '@' instead of relative paths
      },
    },
  };
});
