import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAiProvider, isAiConfigured } from '../server/services/aiClient.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (_req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    status: 'ok',
    aiConfigured: isAiConfigured(),
    provider: getAiProvider(),
  })
}
