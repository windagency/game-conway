import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'; // If you installed and want to use it

export default defineConfig({
  plugins: [
    // basicSsl() // Uncomment if you want to use HTTPS for the dev server
  ],
  server: {
    port: 3000, // Optional: specify dev server port
    open: true    // Optional: automatically open browser
  },
  build: {
    outDir: 'dist' // Matches your tsconfig.json outDir
  }
});