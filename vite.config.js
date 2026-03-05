import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name is "bxh" — hardcoded since GITHUB_REPOSITORY auto-detection
// requires the workflow to pass it, which is now included in deploy.yml
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'bxh'

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})
