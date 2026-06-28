import { motion } from 'framer-motion'
import type { Difficulty } from '../types/question'
import { getAccuracy } from '../utils/quizUtils'
import { ProgressBar } from './ProgressBar'

interface QuizDashboardProps {
  topic: string
  difficulty: Difficulty
  currentQuestion: number
  totalQuestions: number
  progress: number
  correctCount: number
  wrongCount: number
  answeredCount: number
  skippedCount?: number
}

export function QuizDashboard({
  topic,
  difficulty,
  currentQuestion,
  totalQuestions,
  progress,
  correctCount,
  wrongCount,
  answeredCount,
  skippedCount = 0,
}: QuizDashboardProps) {
  const remaining = totalQuestions - answeredCount
  const accuracy = getAccuracy(correctCount, answeredCount)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Quiz progress dashboard"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
              {topic}
            </span>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-700">
              {difficulty}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-gray-900">
            Question {currentQuestion} / {totalQuestions}
          </span>
          <span className="text-green-600">✅ Correct: {correctCount}</span>
          <span className="text-red-600">❌ Wrong: {wrongCount}</span>
          <span className="text-gray-600">📋 Remaining: {remaining}</span>
          {skippedCount > 0 && (
            <span className="text-amber-600">⏭ Skipped: {skippedCount}</span>
          )}
          <span className="text-gray-600">🎯 Accuracy: {accuracy}%</span>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar percentage={progress} />
        <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
      </div>
    </motion.div>
  )
}
