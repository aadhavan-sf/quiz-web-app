import { useCallback } from 'react'
import type { InterviewSessionState } from '../types/question'
import { getInterviewStateKey } from '../utils/interviewStorage'
import { useLocalStorage } from './useLocalStorage'

export function useInterviewSession() {
  const [session, setSession, clearSession] = useLocalStorage<InterviewSessionState | null>(
    getInterviewStateKey(),
    null,
  )

  const initSession = useCallback(
    (state: InterviewSessionState) => setSession(state),
    [setSession],
  )

  const updateSession = useCallback(
    (updater: (prev: InterviewSessionState) => InterviewSessionState) => {
      setSession((prev) => (prev ? updater(prev) : prev))
    },
    [setSession],
  )

  const resetSession = useCallback(() => clearSession(), [clearSession])

  return { session, initSession, updateSession, resetSession }
}
