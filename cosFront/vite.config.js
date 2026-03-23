import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** Chrome met souvent en cache les fichiers de `public/` plus qu’Edge ; évite les vieilles images en local. */
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
