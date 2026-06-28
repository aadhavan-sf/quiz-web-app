import { formatTime } from '../utils/quizUtils'

interface SessionHeaderTimerProps {
  remainingSeconds: number | null
  hasLimit: boolean
  className?: string
}

export function SessionHeaderTimer({
  remainingSeconds,
  hasLimit,
  className = '',
}: SessionHeaderTimerProps) {
  if (!hasLimit) return null

  const urgent = remainingSeconds !== null && remainingSeconds <= 300

  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      aria-live="polite"
      role="timer"
    >
      <span
        className={`text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-3xl ${
          urgent ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {formatTime(remainingSeconds ?? 0)}
      </span>
    </div>
  )
}
