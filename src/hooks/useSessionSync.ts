import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  completePracticeSession,
  createPracticeSession,
  updatePracticeSession,
} from '../services/sessionService'
import type { InterviewSessionState, QuizResults, QuizState } from '../types/question'

const SYNC_DEBOUNCE_MS = 800

export function useQuizSessionSync(
  quizState: QuizState | null,
  onSessionId: (id: string) => void,
  elapsedSeconds: number,
) {
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const creatingRef = useRef(false)

  const stateToSync = quizState ? { ...quizState, elapsedSeconds } : null

  useEffect(() => {
    if (!user || !stateToSync) return

    if (!stateToSync.sessionId && !creatingRef.current) {
      creatingRef.current = true
      createPracticeSession(user.id, 'mcq', stateToSync.config, stateToSync)
        .then((id) => onSessionId(id))
        .catch(() => {})
        .finally(() => {
          creatingRef.current = false
        })
      return
    }

    if (!stateToSync.sessionId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePracticeSession(stateToSync.sessionId!, stateToSync).catch(() => {})
    }, SYNC_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (stateToSync.sessionId) {
        updatePracticeSession(stateToSync.sessionId, stateToSync).catch(() => {})
      }
    }
  }, [user, stateToSync, onSessionId])
}

export async function persistCompletedQuiz(
  quizState: QuizState,
  results: QuizResults,
): Promise<void> {
  if (!quizState.sessionId) return
  await completePracticeSession(quizState.sessionId, quizState, results)
}

export function useInterviewSessionSync(
  session: InterviewSessionState | null,
  onSessionId: (sessionId: string) => void,
  elapsedSeconds: number,
) {
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const creatingRef = useRef(false)

  const stateToSync = session ? { ...session, elapsedSeconds } : null

  useEffect(() => {
    if (!user || !stateToSync) return

    if (!stateToSync.sessionId && !creatingRef.current) {
      creatingRef.current = true
      createPracticeSession(user.id, 'interview', stateToSync.config, stateToSync)
        .then((id) => onSessionId(id))
        .catch(() => {})
        .finally(() => {
          creatingRef.current = false
        })
      return
    }

    if (!stateToSync.sessionId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePracticeSession(stateToSync.sessionId!, stateToSync).catch(() => {})
    }, SYNC_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (stateToSync.sessionId) {
        updatePracticeSession(stateToSync.sessionId, stateToSync).catch(() => {})
      }
    }
  }, [user, stateToSync, onSessionId])
}

export async function persistCompletedInterview(
  session: InterviewSessionState,
  report: import('../types/question').InterviewReport,
): Promise<void> {
  if (!session.sessionId) return
  await completePracticeSession(session.sessionId, session, report)
}
