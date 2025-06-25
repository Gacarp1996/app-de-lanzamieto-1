import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 1. Importamos el plugin
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // 2. Le decimos a Vite que use el plugin de React
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
})