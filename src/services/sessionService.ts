import type {
  InterviewReport,
  InterviewSessionState,
  PracticeMode,
  QuizResults,
  QuizState,
  SessionConfig,
  StoredPracticeSession,
} from '../types/question'
import { supabase } from '../lib/supabase'
import { isSameTopic, sessionTopic } from '../utils/sessionProgress'

function requireClient() {
  if (!supabase) throw new Error('Sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.')
  return supabase
}

export const DAILY_NEW_SESSION_LIMIT = 3

function startOfLocalDayIso(): string {
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  return day.toISOString()
}

export function dailySessionLimitMessage(used: number, limit = DAILY_NEW_SESSION_LIMIT): string {
  return `Daily limit reached. You can start up to ${limit} new sessions per day (${used}/${limit} used). Resume an existing session or try again tomorrow.`
}

/** Sessions created since local midnight — used for the daily new-session cap. */
export async function countSessionsStartedToday(userId: string): Promise<number> {
  const client = requireClient()
  const { count, error } = await client
    .from('practice_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('started_at', startOfLocalDayIso())

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getDailySessionUsage(
  userId: string,
): Promise<{ used: number; limit: number; remaining: number; allowed: boolean }> {
  const used = await countSessionsStartedToday(userId)
  const limit = DAILY_NEW_SESSION_LIMIT
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    allowed: used < limit,
  }
}

export async function createPracticeSession(
  userId: string,
  mode: PracticeMode,
  config: SessionConfig | QuizState['config'],
  state: QuizState | InterviewSessionState,
): Promise<string> {
  const client = requireClient()

  const topic = 'topic' in config ? config.topic : ''
  const existing = await fetchInProgressSessionForModeAndTopic(userId, mode, topic)
  if (existing) {
    throw new Error(
      `You already have an unfinished ${mode === 'mcq' ? 'MCQ' : 'interview'} session on ${sessionTopic(existing)}. Continue it or start fresh before creating another.`,
    )
  }

  const usage = await getDailySessionUsage(userId)
  if (!usage.allowed) {
    throw new Error(dailySessionLimitMessage(usage.used, usage.limit))
  }

  const startedAt = new Date(
    'startedAt' in state ? state.startedAt : Date.now(),
  ).toISOString()

  const { data, error } = await client
    .from('practice_sessions')
    .insert({
      user_id: userId,
      mode,
      status: 'in_progress',
      config,
      state,
      started_at: startedAt,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function updatePracticeSession(
  sessionId: string,
  state: QuizState | InterviewSessionState,
): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('practice_sessions')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function completePracticeSession(
  sessionId: string,
  state: QuizState | InterviewSessionState,
  results: QuizResults | InterviewReport,
): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('practice_sessions')
    .update({
      status: 'completed',
      state,
      results,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function fetchInProgressSessions(userId: string): Promise<StoredPracticeSession[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as StoredPracticeSession[]
}

/** Most recent in-progress session for a mode, if any. */
export async function fetchInProgressSessionForMode(
  userId: string,
  mode: PracticeMode,
): Promise<StoredPracticeSession | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', mode)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as StoredPracticeSession | null) ?? null
}

/** In-progress session for a mode and topic, if any. */
export async function fetchInProgressSessionForModeAndTopic(
  userId: string,
  mode: PracticeMode,
  topic: string,
): Promise<StoredPracticeSession | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', mode)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  const sessions = (data ?? []) as StoredPracticeSession[]
  return sessions.find((s) => isSameTopic(sessionTopic(s), topic)) ?? null
}

/** One session per mode — keeps the most recently updated. */
export function latestSessionPerMode(
  sessions: StoredPracticeSession[],
): StoredPracticeSession[] {
  const byMode = new Map<PracticeMode, StoredPracticeSession>()

  for (const session of sessions) {
    const existing = byMode.get(session.mode)
    if (
      !existing ||
      new Date(session.updated_at).getTime() > new Date(existing.updated_at).getTime()
    ) {
      byMode.set(session.mode, session)
    }
  }

  return [...byMode.values()].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
}

export async function fetchCompletedSessions(userId: string): Promise<StoredPracticeSession[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as StoredPracticeSession[]
}

export async function fetchSessionById(sessionId: string): Promise<StoredPracticeSession | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as StoredPracticeSession | null) ?? null
}

export async function deletePracticeSession(sessionId: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('practice_sessions').delete().eq('id', sessionId)
  if (error) throw new Error(error.message)
}
