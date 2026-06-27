import { motion } from 'framer-motion'
import type { Difficulty } from '../types/question'
import { formatTime, getAccuracy } from '../utils/quizUtils'
import { ProgressBar } from './ProgressBar'

interface QuizDashboardProps {
  userName: string
  topic: string
  difficulty: Difficulty
  currentQuestion: number
  totalQuestions: number
  progress: number
  correctCount: number
  wrongCount: number
  answeredCount: number
  elapsedSeconds: number
}

export function QuizDashboard({
  userName,
  topic,
  difficulty,
  currentQuestion,
  totalQuestions,
  progress,
  correctCount,
  wrongCount,
  answeredCount,
  elapsedSeconds,
}: QuizDashboardProps) {
  const remaining = totalQuestions - answeredCount
  const accuracy = getAccuracy(correctCount, answeredCount)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"
      aria-label="Quiz progress dashboard"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <span aria-hidden="true">👤</span>
            <span>Hello, {userName}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {topic}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {difficulty}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">
            Question {currentQuestion} / {totalQuestions}
          </span>
          <span className="text-green-600 dark:text-green-400">✅ Correct: {correctCount}</span>
          <span className="text-red-600 dark:text-red-400">❌ Wrong: {wrongCount}</span>
          <span className="text-gray-600 dark:text-gray-400">📋 Remaining: {remaining}</span>
          <span className="text-gray-600 dark:text-gray-400">🎯 Accuracy: {accuracy}%</span>
          <span className="text-gray-600 dark:text-gray-400">⏱ {formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar percentage={progress} />
        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{progress}%</p>
      </div>
    </motion.div>
  )
}
