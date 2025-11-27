import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Custom plugin to copy static files to dist
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const iconsDir = resolve(distDir, 'icons');
      
      // Ensure icons directory exists
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }
      
      // Copy service worker and manifest
      copyFileSync(resolve(__dirname, 'service-worker.js'), resolve(distDir, 'service-worker.js'));
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'));
      
      // Copy icons
      const sourceIconsDir = resolve(__dirname, 'icons');
      if (existsSync(sourceIconsDir)) {
        readdirSync(sourceIconsDir).forEach(file => {
          copyFileSync(resolve(sourceIconsDir, file), resolve(iconsDir, file));
        });
      }
    }
  };
}

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  plugins: [copyStaticFiles()]
});
