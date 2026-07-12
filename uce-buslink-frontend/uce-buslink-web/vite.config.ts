import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Identificador unico por build: invalida la cache de React Query persistida
  // en IndexedDB cuando se despliega una version nueva (persistOptions.buster).
  define: {
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        // Required for Clerk and API calls to not be cached by SW incorrectly
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
        ]
      },
      manifest: {
        name: 'UCE BusLink',
        short_name: 'BusLink',
        description: 'Transporte Universitario UCE',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  envDir: __dirname,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
