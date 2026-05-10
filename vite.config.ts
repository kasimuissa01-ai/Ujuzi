import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Ujuzi - Jifunze Kidogo',
          short_name: 'Ujuzi',
          description: 'Level up Maarifa Yako. Jifunze kidogo, matokeo makubwa, bila pleasure.',
          theme_color: '#ececf0',
          background_color: '#ececf0',
          display: 'standalone',
          icons: [
            {
              src: 'https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
            },
            {
              src: 'https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/i\.postimg\.cc\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'postimg-images',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'dicebear-images',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
