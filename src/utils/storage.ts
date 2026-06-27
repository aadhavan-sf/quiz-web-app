const USER_NAME_KEY = 'ai-interview-user-name'
const QUIZ_STATE_KEY = 'ai-interview-quiz-state'
const THEME_KEY = 'ai-interview-theme'

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

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme(): Theme {
  const theme = getTheme()
  document.documentElement.classList.toggle('dark', theme === 'dark')
  if (theme === 'dark') document.documentElement.style.colorScheme = 'dark'
  return theme
}
