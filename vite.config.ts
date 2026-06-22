import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages deployment, set `base` to the repository name.
// If a custom domain is configured, set base to '/'.
// See: https://vitejs.dev/guide/static-deploy.html#github-pages
export default defineConfig({
  plugins: [react()],
  base: '/tokenforge-printdesk/',
})
