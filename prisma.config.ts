import { defineConfig } from 'prisma/config'
import * as fs from 'fs'
import * as path from 'path'

// Manually load .env since prisma.config.ts suppresses automatic env loading
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}

// Build MySQL DATABASE_URL if missing or holding old sqlite file: url
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('mysql://')) {
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    const user = encodeURIComponent(process.env.DB_USER)
    const pass = encodeURIComponent(process.env.DB_PASSWORD)
    const host = process.env.DB_HOST
    const port = process.env.DB_PORT || '20457'
    const db = process.env.DB_NAME || 'intership_portel'
    process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}?ssl-mode=REQUIRED`
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
})
