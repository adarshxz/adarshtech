import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fetchGitHubContributionCalendar } from './server/githubContributions.js'

const DEFAULT_GITHUB_USERNAME = 'adarshxz'

const githubContributionsDevApi = (env) => ({
  name: 'github-contributions-dev-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/github-contributions')) {
        next()
        return
      }

      const requestUrl = new URL(req.url, 'http://localhost')
      const username = requestUrl.searchParams.get('username') || env.GITHUB_USERNAME || DEFAULT_GITHUB_USERNAME

      try {
        const data = await fetchGitHubContributionCalendar({
          username,
          token: env.GITHUB_TOKEN || env.GH_TOKEN,
        })

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify(data))
      } catch (error) {
        res.statusCode = error.statusCode || 500
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({
          error: error.message || 'Unable to load GitHub contributions',
        }))
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [githubContributionsDevApi(env), react(), tailwindcss()],
    // The 3D scene is lazy-loaded; pre-bundle it with React up front so dev never mixes React copies.
    optimizeDeps: { include: ['three', '@react-three/fiber'] },
    resolve: { dedupe: ['react', 'react-dom'] },
    build: {
      rollupOptions: {
        output: {
          // Keep the 3D stack in its own chunk that only the lazy scene pulls in.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (/node_modules\/(three|@react-three|react-reconciler|its-fine|zustand|suspend-react)\//.test(id)) {
              return 'vendor-three'
            }
            if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
              return 'vendor-react'
            }
            return undefined
          },
        },
      },
    },
  }
})
