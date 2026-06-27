const USER_NAME_KEY = 'pbi-quiz-user-name'
const QUIZ_STATE_KEY = 'pbi-quiz-state'

export function getUserName(): string | null {
  return localStorage.getItem(USER_NAME_KEY)
}

export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name)
}

export function clearQuizData(): void {
  localStorage.removeItem(QUIZ_STATE_KEY)
}

export function getQuizStateKey(): string {
  return QUIZ_STATE_KEY
}
