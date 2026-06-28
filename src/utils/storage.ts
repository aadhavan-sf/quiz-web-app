const USER_NAME_KEY = 'ai-interview-user-name'
const QUIZ_STATE_KEY = 'ai-interview-quiz-state'

export function getUserName(): string | null {
  return localStorage.getItem(USER_NAME_KEY)
}

export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name)
}

export function getQuizStateKey(): string {
  return QUIZ_STATE_KEY
}

export function clearQuizData(): void {
  localStorage.removeItem(QUIZ_STATE_KEY)
}
