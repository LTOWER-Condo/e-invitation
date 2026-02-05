import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/e-invitation/', // ឈ្មោះ Repo របស់អ្នកសម្រាប់ GitHub Pages
})