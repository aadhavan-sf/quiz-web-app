import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateQuestions, validateGenerateRequest } from '../server/services/questionGenerator.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const request = validateGenerateRequest(req.body)
    const questions = await generateQuestions(request)

    return res.status(200).json({
      questions,
      topic: request.topic,
      difficulty: request.difficulty,
      questionCount: request.questionCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate questions'
    return res.status(400).json({ error: message })
  }
}
