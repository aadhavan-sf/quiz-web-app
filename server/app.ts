import 'dotenv/config'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import { getAiProvider, isAiConfigured } from './services/aiClient.js'
import {
  evaluateAnswer,
  generateInterviewReport,
  startInterview,
  validateInterviewStart,
} from './services/interviewService.js'
import { generateQuestions, validateGenerateRequest } from './services/questionGenerator.js'
import { transcribeAudio, validateTranscribeRequest } from './services/transcriptionService.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '12mb' }))

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', aiConfigured: isAiConfigured(), provider: getAiProvider() })
  })

  app.post('/api/generate-questions', async (req: Request, res: Response) => {
    try {
      const request = validateGenerateRequest(req.body)
      const questions = await generateQuestions(request)

      res.json({
        questions,
        topic: request.topic,
        difficulty: request.difficulty,
        questionCount: request.questionCount,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate questions'
      res.status(400).json({ error: message })
    }
  })

  app.post('/api/interview/start', async (req: Request, res: Response) => {
    try {
      const request = validateInterviewStart(req.body)
      const question = await startInterview(request)
      res.json({ question, totalQuestions: request.questionCount })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start interview'
      res.status(400).json({ error: message })
    }
  })

  app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
    try {
      const body = req.body
      const { evaluation, nextQuestion } = await evaluateAnswer(body)
      const isComplete = body.questionIndex + 1 >= body.config.questionCount
      res.json({ evaluation, nextQuestion, isComplete })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate answer'
      res.status(400).json({ error: message })
    }
  })

  app.post('/api/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType, topic } = validateTranscribeRequest(req.body)
      const text = await transcribeAudio(audioBase64, mimeType, topic)
      res.json({ text })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed'
      res.status(400).json({ error: message })
    }
  })

  app.post('/api/interview/report', async (req: Request, res: Response) => {
    try {
      const report = await generateInterviewReport(req.body)
      res.json({ report })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate report'
      res.status(400).json({ error: message })
    }
  })

  return app
}
