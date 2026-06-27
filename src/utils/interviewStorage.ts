const INTERVIEW_STATE_KEY = 'ai-interview-session-state'

export function getInterviewStateKey(): string {
  return INTERVIEW_STATE_KEY
}

export function clearInterviewData(): void {
  localStorage.removeItem(INTERVIEW_STATE_KEY)
}
