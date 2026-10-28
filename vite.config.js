import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { brand } from './src/theme/tokens.js';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Solstice',
        short_name: 'Solstice',
        description: 'Sunrise, sunset, golden hour and blue hour, calculated on your device. Works offline.',
        theme_color: brand.themeColor,
        background_color: brand.backgroundColor,
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        lang: 'en',
        categories: ['photography', 'utilities', 'weather'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Precache everything the app needs, including every font subset,
        // so the app works with no network after the first visit.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache well across app updates.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion|@popperjs|stylis|react-transition-group)[\\/]/, priority: 20 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
