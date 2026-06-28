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
  onSessionId: (sessionId: string) => void,
) {
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const creatingRef = useRef(false)

  useEffect(() => {
    if (!user || !quizState) return

    if (!quizState.sessionId && !creatingRef.current) {
      creatingRef.current = true
      createPracticeSession(user.id, 'mcq', quizState.config, quizState)
        .then((id) => onSessionId(id))
        .catch(() => {})
        .finally(() => {
          creatingRef.current = false
        })
      return
    }

    if (!quizState.sessionId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePracticeSession(quizState.sessionId!, quizState).catch(() => {})
    }, SYNC_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [user, quizState, onSessionId])
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
) {
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const creatingRef = useRef(false)

  useEffect(() => {
    if (!user || !session) return

    if (!session.sessionId && !creatingRef.current) {
      creatingRef.current = true
      createPracticeSession(user.id, 'interview', session.config, session)
        .then((id) => onSessionId(id))
        .catch(() => {})
        .finally(() => {
          creatingRef.current = false
        })
      return
    }

    if (!session.sessionId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePracticeSession(session.sessionId!, session).catch(() => {})
    }, SYNC_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [user, session, onSessionId])
}

export async function persistCompletedInterview(
  session: InterviewSessionState,
  report: import('../types/question').InterviewReport,
): Promise<void> {
  if (!session.sessionId) return
  await completePracticeSession(session.sessionId, session, report)
}
