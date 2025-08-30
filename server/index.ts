import express from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping"
  res.json({ message: ping })
})

// You'll need to define handleDemo or remove this line
// app.get("/api/demo", handleDemo)

// Serve static assets
app.use(express.static(join(__dirname, '../dist/client')))

// SSR handler
app.get('*', async (req, res) => {
  try {
    // Skip SSR for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).send('Not found')
    }
    
    const template = readFileSync(join(__dirname, '../dist/client/index.html'), 'utf-8')
    // Import the server-built entry-server.js
    const { render } = await import('../dist/server/entry-server.js')
    const html = template.replace('<!--ssr-outlet-->', render())
    res.send(html)
  } catch (error) {
    console.error('SSR Error:', error)
    // Fallback to client-side rendering
    const template = readFileSync(join(__dirname, '../dist/client/index.html'), 'utf-8')
    res.send(template.replace('<!--ssr-outlet-->', ''))
  }
})

export default app