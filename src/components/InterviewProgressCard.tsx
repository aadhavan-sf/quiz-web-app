import { motion } from 'framer-motion'
import type { Difficulty } from '../types/question'
import { ProgressBar } from './ProgressBar'

interface InterviewProgressCardProps {
  topic: string
  difficulty: Difficulty
  currentQuestion: number
  totalQuestions: number
  progress: number
  completedCount: number
  skippedCount: number
}

export function InterviewProgressCard({
  topic,
  difficulty,
  currentQuestion,
  totalQuestions,
  progress,
  completedCount,
  skippedCount,
}: InterviewProgressCardProps) {
  const remaining = totalQuestions - completedCount

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Interview progress"
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          {topic}
        </span>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
          {difficulty}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-gray-900">
          Question {currentQuestion} / {totalQuestions}
        </span>
        <span className="text-green-600">✅ Completed: {completedCount}</span>
        <span className="text-gray-600">📋 Remaining: {remaining}</span>
        {skippedCount > 0 && <span className="text-amber-600">⏭ Skipped: {skippedCount}</span>}
      </div>

      <div className="mt-3">
        <ProgressBar percentage={progress} className="h-2.5" />
        <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
      </div>
    </motion.div>
  )
}
