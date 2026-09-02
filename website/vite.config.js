import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite 8 / Rolldown rejects JSX inside .js unless the React plugin scans those files.
export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],
})
