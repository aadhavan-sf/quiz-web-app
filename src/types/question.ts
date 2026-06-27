export interface Question {
  id: number
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation: string
}

export interface AnswerRecord {
  selectedAnswer: number
  isCorrect: boolean
}

export interface QuizState {
  answers: Record<number, AnswerRecord>
  currentQuestionIndex: number
  startedAt: number
}

export type AppScreen = 'home' | 'quiz' | 'results'

export type PerformanceLevel = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement'

export interface QuizResults {
  totalScore: number
  correctCount: number
  wrongCount: number
  percentage: number
  performance: PerformanceLevel
  incorrectQuestions: Array<{
    question: Question
    selectedAnswer: number
  }>
  elapsedSeconds: number
}
