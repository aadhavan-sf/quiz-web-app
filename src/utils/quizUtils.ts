import type { PerformanceLevel, Question, QuizResults } from '../types/question'

export function getPerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 75) return 'Good'
  if (percentage >= 50) return 'Average'
  return 'Needs Improvement'
}

export function calculateResults(
  questions: Question[],
  answers: Record<number, { selectedAnswer: number; isCorrect: boolean }>,
  elapsedSeconds: number,
): QuizResults {
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
  const wrongCount = Object.values(answers).filter((a) => !a.isCorrect).length
  const percentage = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0

  const incorrectQuestions = questions
    .filter((q) => {
      const answer = answers[q.id]
      return answer && !answer.isCorrect
    })
    .map((q) => ({
      question: q,
      selectedAnswer: answers[q.id].selectedAnswer,
    }))

  return {
    totalQuestions: questions.length,
    correctCount,
    wrongCount,
    percentage,
    performance: getPerformanceLevel(percentage),
    incorrectQuestions,
    elapsedSeconds,
  }
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getOptionLabel(index: number): string {
  return ['A', 'B', 'C', 'D'][index] ?? String(index + 1)
}

export function getPerformanceBadgeStyles(level: PerformanceLevel): string {
  switch (level) {
    case 'Excellent':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    case 'Good':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'Average':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'Needs Improvement':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
  }
}

export function getAccuracy(correct: number, answered: number): number {
  if (answered === 0) return 0
  return Math.round((correct / answered) * 100)
}
