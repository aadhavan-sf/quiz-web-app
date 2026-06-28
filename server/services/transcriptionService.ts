import { toFile } from 'openai/uploads'
import { formatOpenAIError, getAiProvider, getOpenAIClient, isAiConfigured } from './aiClient.js'

/** Full model — more accurate than turbo for fast or dense speech. */
const DEFAULT_GROQ_WHISPER_MODEL = 'whisper-large-v3'
const DEFAULT_OPENAI_WHISPER_MODEL = 'whisper-1'

function getWhisperModel(): string {
  if (getAiProvider() === 'groq') {
    return process.env.GROQ_WHISPER_MODEL?.trim() || DEFAULT_GROQ_WHISPER_MODEL
  }
  return process.env.OPENAI_WHISPER_MODEL?.trim() || DEFAULT_OPENAI_WHISPER_MODEL
}

function buildWhisperPrompt(topic?: string): string {
  const subject = topic?.trim()
  if (subject) {
    return (
      `Clear technical interview answer about ${subject}. ` +
      'Spoken English with full sentences, proper punctuation, and accurate technical terms.'
    )
  }
  return 'Clear technical interview answer in spoken English with full sentences and proper punctuation.'
}

export function validateTranscribeRequest(body: unknown): {
  audioBase64: string
  mimeType: string
  topic?: string
} {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body')
  }

  const { audioBase64, mimeType, topic } = body as Record<string, unknown>

  if (typeof audioBase64 !== 'string' || audioBase64.length < 100) {
    throw new Error('No audio data received. Record for at least one second and try again.')
  }

  if (typeof mimeType !== 'string' || !mimeType.startsWith('audio/')) {
    throw new Error('Invalid audio format')
  }

  return {
    audioBase64,
    mimeType,
    topic: typeof topic === 'string' && topic.trim() ? topic.trim() : undefined,
  }
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
  topic?: string,
): Promise<string> {
  if (!isAiConfigured()) {
    throw new Error('AI is not configured. Add GROQ_API_KEY to .env for speech transcription.')
  }

  const client = getOpenAIClient()
  if (!client) {
    throw new Error('AI is not configured. Add GROQ_API_KEY to .env for speech transcription.')
  }

  const buffer = Buffer.from(audioBase64, 'base64')
  if (buffer.length < 1000) {
    throw new Error('Recording too short. Speak for at least one second and try again.')
  }

  const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'audio'
  const file = await toFile(buffer, `recording.${extension}`, { type: mimeType })

  try {
    const result = await client.audio.transcriptions.create({
      file,
      model: getWhisperModel(),
      language: 'en',
      response_format: 'text',
      temperature: 0,
      prompt: buildWhisperPrompt(topic),
    })

    const text = typeof result === 'string' ? result : String(result)
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error('No speech detected. Speak slowly, clearly, and try again.')
    }
    return trimmed
  } catch (error) {
    throw new Error(formatOpenAIError(error))
  }
}
