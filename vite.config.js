import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Activa el Service Worker también en desarrollo (útil para probar)
      devOptions: { enabled: true },

      // Archivos estáticos adicionales a incluir en el caché
      includeAssets: [
        'apple-touch-icon.png',
        'icon.svg',
        'exercises/*.gif',
      ],

      manifest: {
        name: 'FitTracker — Training & Longevity',
        short_name: 'FitTracker',
        description: 'Tu app personal de entrenamiento y longevidad',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Cachea todos los assets generados por Vite (JS, CSS con hash)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,gif}'],

        runtimeCaching: [
          // GIFs de ejercicios: CacheFirst — nunca cambian, prioridad offline máxima
          {
            urlPattern: /\/exercises\/.*\.gif$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-gifs',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
          // Assets de Vite (JS/CSS con hash): CacheFirst — el hash garantiza frescura
          {
            urlPattern: /\/assets\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vite-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          // Todo lo demás: NetworkFirst con fallback a caché
          {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'general',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
              },
            },
          },
        ],
      },
    }),
  ],
})
