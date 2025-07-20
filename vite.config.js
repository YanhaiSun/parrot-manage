import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/parrot-web/', // <-- 加上这一行
  plugins: [react()],
})
