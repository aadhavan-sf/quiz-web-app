import type { PracticeMode, StoredPracticeSession } from '../types/question'

export function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase()
}

export function isSameTopic(a: string, b: string): boolean {
  return normalizeTopic(a) === normalizeTopic(b)
}

export function getSessionProgress(session: StoredPracticeSession): {
  completed: number
  total: number
  remaining: number
} {
  const total = (session.config as { questionCount?: number }).questionCount ?? 0
  const state = session.state as { answers?: Record<string, unknown>; history?: unknown[] }
  const completed =
    session.mode === 'mcq'
      ? Object.keys(state.answers ?? {}).length
      : (state.history?.length ?? 0)

  return {
    completed,
    total,
    remaining: Math.max(0, total - completed),
  }
}

export function sessionTopic(session: StoredPracticeSession): string {
  return (session.config as { topic?: string }).topic ?? 'Practice'
}

export function assessmentLabel(mode: PracticeMode): string {
  return mode === 'mcq' ? 'MCQ' : 'Interview'
}
