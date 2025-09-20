import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/med-chatbot/',   // ✅ must match GitHub repo name
  build: {
    outDir: 'dist',
  }
})
