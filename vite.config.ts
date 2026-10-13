import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // REQUIRED for Electron desktop apps and file:// protocol
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true, // Allow mobile phones on local network to access via IP
    port: 5173
  }
})
