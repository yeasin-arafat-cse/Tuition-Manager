import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Tuition Manager',
        short_name: 'TuitionApp',
        description: 'Manage your tuition classes, students, and AI exams.',
        theme_color: '#4f46e5',
        background_color: '#f3f4f6',
        display: 'standalone', // 👈 ব্রাউজারের অ্যাড্রেস বার হাইড করবে
        icons: [
          {
            src: 'pwa-192x192.png', // 👈 এই দুটি ছবি public ফোল্ডারে রাখতে হবে
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})