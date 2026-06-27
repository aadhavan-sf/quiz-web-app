import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(projectRoot, '.env') })

function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    async configureServer(server) {
      dotenv.config({ path: path.join(projectRoot, '.env'), override: true })
      const { createApp } = await import('./server/app.ts')
      const app = createApp()

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        // Express accepts Node's req/res at runtime; types differ from connect
        app(req as never, res as never, next)
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || (mode === 'production' ? '/quiz-web-app/' : '/'),
  plugins: [react(), tailwindcss(), apiDevServer()],
}))
