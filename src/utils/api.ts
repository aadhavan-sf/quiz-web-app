import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  InterviewEvaluateRequest,
  InterviewEvaluateResponse,
  InterviewReport,
  InterviewReportRequest,
  InterviewStartRequest,
  InterviewStartResponse,
} from '../types/question'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(
      'Cannot reach the API server. Run "npm run dev" locally or deploy to Vercel with GROQ_API_KEY set.',
    )
  }

  const text = await response.text()

  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
    throw new Error(
      'API returned HTML instead of JSON. The backend is not running — use "npm run dev" locally, or deploy to Vercel (GitHub Pages does not support the AI API).',
    )
  }

  let data: { error?: string }
  try {
    data = JSON.parse(text) as { error?: string }
  } catch {
    if (!response.ok) {
      throw new Error(
        text.trim() || `Server error (${response.status}). Check Vercel logs and ensure GROQ_API_KEY is set.`,
      )
    }
    throw new Error('Invalid response from server. Please try again.')
  }

  if (!response.ok) throw new Error(data.error ?? 'Request failed')
  return data as T
}

export function fetchQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
  return post('/api/generate-questions', request)
}

export function startInterview(request: InterviewStartRequest): Promise<InterviewStartResponse> {
  return post('/api/interview/start', request)
}

export function evaluateInterviewAnswer(
  request: InterviewEvaluateRequest,
): Promise<InterviewEvaluateResponse> {
  return post('/api/interview/evaluate', request)
}

export function fetchInterviewReport(
  request: InterviewReportRequest,
): Promise<{ report: InterviewReport }> {
  return post('/api/interview/report', request)
}

export async function fetchHealth(): Promise<{
  status: string
  aiConfigured: boolean
  provider?: 'groq' | 'openai'
}> {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) throw new Error('API health check failed')
  return response.json() as Promise<{
    status: string
    aiConfigured: boolean
    provider?: 'groq' | 'openai'
  }>
}
