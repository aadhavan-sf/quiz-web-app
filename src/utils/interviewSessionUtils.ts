import type { InterviewHistoryEntry, InterviewSessionState } from '../types/question'

export function skippedIndices(session: InterviewSessionState): number[] {
  return session.skippedQuestionIndices ?? []
}

export function answeredIndices(history: InterviewHistoryEntry[]): number[] {
  return history.map((entry, i) => entry.questionIndex ?? i)
}

export function isIndexAnswered(history: InterviewHistoryEntry[], index: number): boolean {
  return history.some((entry, i) => (entry.questionIndex ?? i) === index)
}

export function getHistoryForIndex(
  history: InterviewHistoryEntry[],
  index: number,
): InterviewHistoryEntry | undefined {
  return history.find((entry, i) => (entry.questionIndex ?? i) === index)
}

export function pendingSkippedCount(session: InterviewSessionState): number {
  const skipped = skippedIndices(session)
  return skipped.filter((index) => !isIndexAnswered(session.history, index)).length
}

export function isInterviewComplete(session: InterviewSessionState): boolean {
  const total = session.config.questionCount
  if (session.history.length < total) return false
  for (let i = 0; i < total; i++) {
    if (!isIndexAnswered(session.history, i)) return false
  }
  return true
}

export function findNextOpenIndex(session: InterviewSessionState, afterIndex: number): number | null {
  const total = session.config.questionCount
  const skipped = skippedIndices(session)

  for (let i = afterIndex + 1; i < total; i++) {
    if (!isIndexAnswered(session.history, i) && !skipped.includes(i)) return i
  }
  for (let i = 0; i <= afterIndex; i++) {
    if (!isIndexAnswered(session.history, i) && !skipped.includes(i)) return i
  }
  for (let i = 0; i < total; i++) {
    if (!isIndexAnswered(session.history, i)) return i
  }
  return null
}

export function skippedQuestionsForApi(session: InterviewSessionState) {
  const bank = session.questionBank ?? {}
  return skippedIndices(session)
    .filter((index) => !isIndexAnswered(session.history, index))
    .map((index) => bank[index])
    .filter(Boolean)
}

export function canNavigateToIndex(session: InterviewSessionState, index: number): boolean {
  if (index < 0 || index >= session.config.questionCount) return false
  if (index === session.currentQuestionIndex) return true
  if (isIndexAnswered(session.history, index)) return true
  if (skippedIndices(session).includes(index)) return true
  return false
}
