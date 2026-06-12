import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages sirve el sitio bajo /estetica/; local y Vercel usan raíz
  base: process.env.GITHUB_PAGES === 'true' ? '/estetica/' : '/',
})
