import type { AnswerRecord, PerformanceLevel, Question, QuizResults } from '../types/question'

export function getPerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 75) return 'Good'
  if (percentage >= 50) return 'Average'
  return 'Needs Improvement'
}

export function calculateResults(
  questions: Question[],
  answers: Record<number, AnswerRecord>,
  elapsedSeconds: number,
): QuizResults {
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
  const wrongCount = Object.values(answers).filter((a) => !a.isCorrect).length
  const percentage = Math.round((correctCount / questions.length) * 100)

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
    totalScore: correctCount,
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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Good':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Average':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Needs Improvement':
      return 'bg-red-50 text-red-700 border-red-200'
  }
}
