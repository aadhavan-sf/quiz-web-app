import { motion } from 'framer-motion'
import type { PerformanceLevel } from '../types/question'
import { getPerformanceBadgeStyles } from '../utils/quizUtils'

interface PerformanceBadgeProps {
  level: PerformanceLevel
}

export function PerformanceBadge({ level }: PerformanceBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${getPerformanceBadgeStyles(level)}`}
    >
      {level}
    </motion.span>
  )
}
