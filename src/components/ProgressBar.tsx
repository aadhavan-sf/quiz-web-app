import { motion } from 'framer-motion'

interface ProgressBarProps {
  percentage: number
  className?: string
}

export function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Quiz progress: ${clamped}%`}
    >
      <motion.div
        className="h-full rounded-full bg-primary-600"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}
