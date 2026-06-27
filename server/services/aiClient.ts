import OpenAI from 'openai'

export type AiProvider = 'groq' | 'openai'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

function isPlaceholderKey(key: string): boolean {
  const trimmed = key.trim()
  if (!trimmed) return true
  if (trimmed === 'your_openai_api_key_here' || trimmed === 'your_groq_api_key_here') {
    return true
  }
  return trimmed.includes('your_') && trimmed.includes('_api_key')
}

export function getAiProvider(): AiProvider {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase()
  return raw === 'openai' ? 'openai' : 'groq'
}

function getApiKeyForProvider(provider: AiProvider): string | null {
  const envKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY
  const apiKey = envKey?.trim()
  if (!apiKey || isPlaceholderKey(apiKey)) return null
  return apiKey
}

export function getAiSetupMessage(): string {
  if (getAiProvider() === 'openai') {
    return 'AI is not configured. Add OPENAI_API_KEY to .env locally, or in Vercel Project Settings → Environment Variables.'
  }
  return 'AI is not configured. Add GROQ_API_KEY in Vercel Project Settings → Environment Variables (or in .env for local dev).'
}

export const AI_NOT_CONFIGURED_MESSAGE = getAiSetupMessage()

export function isAiConfigured(): boolean {
  return getApiKeyForProvider(getAiProvider()) !== null
}

export function getOpenAIClient(): OpenAI | null {
  const provider = getAiProvider()
  const apiKey = getApiKeyForProvider(provider)
  if (!apiKey) return null

  if (provider === 'groq') {
    return new OpenAI({ apiKey, baseURL: GROQ_BASE_URL })
  }

  return new OpenAI({ apiKey })
}

export function requireOpenAIClient(): OpenAI {
  const client = getOpenAIClient()
  if (!client) throw new Error(getAiSetupMessage())
  return client
}

export function getOpenAIModel(): string {
  const provider = getAiProvider()
  if (provider === 'groq') {
    return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL
  }
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL
}

export function formatOpenAIError(error: unknown): string {
  const provider = getAiProvider()
  const providerLabel = provider === 'groq' ? 'Groq' : 'OpenAI'

  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status
    const message =
      'message' in error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : ''

    if (status === 401) {
      if (provider === 'groq') {
        return 'Groq rejected your API key. Update GROQ_API_KEY in .env and restart npm run dev.'
      }
      return 'OpenAI rejected your API key. Update OPENAI_API_KEY in .env and restart npm run dev.'
    }
    if (status === 429) {
      if (provider === 'groq') {
        return 'Groq free-tier rate limit reached. Wait a minute and try again, or upgrade at console.groq.com.'
      }
      if (message.toLowerCase().includes('quota')) {
        return 'OpenAI quota exceeded. Add billing at https://platform.openai.com/account/billing, or switch to Groq (free) with AI_PROVIDER=groq in .env.'
      }
      return `${providerLabel} rate limit reached. Wait a moment and try again.`
    }
  }

  return error instanceof Error ? error.message : 'AI request failed'
}
