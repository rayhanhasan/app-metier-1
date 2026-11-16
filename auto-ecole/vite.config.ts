import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 2500 },
  // accessible depuis l'aperçu distant de la session
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
})
