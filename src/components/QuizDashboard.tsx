import { motion } from 'framer-motion'
import { formatTime } from '../utils/quizUtils'
import { ProgressBar } from './ProgressBar'

interface QuizDashboardProps {
  userName: string
  currentQuestion: number
  totalQuestions: number
  progress: number
  correctCount: number
  wrongCount: number
  elapsedSeconds: number
}

export function QuizDashboard({
  userName,
  currentQuestion,
  totalQuestions,
  progress,
  correctCount,
  wrongCount,
  elapsedSeconds,
}: QuizDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Quiz progress dashboard"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <span aria-hidden="true">👤</span>
          <span>{userName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-semibold text-gray-900">
            Question {currentQuestion} / {totalQuestions}
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <span aria-hidden="true">✅</span>
            <span>Correct: {correctCount}</span>
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <span aria-hidden="true">❌</span>
            <span>Wrong: {wrongCount}</span>
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <span aria-hidden="true">⏱</span>
            <span>Time: {formatTime(elapsedSeconds)}</span>
          </span>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar percentage={progress} />
        <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
      </div>
    </motion.div>
  )
}
