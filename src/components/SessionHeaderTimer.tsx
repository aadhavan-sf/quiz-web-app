import { formatTime } from '../utils/quizUtils'

interface SessionHeaderTimerProps {
  elapsedSeconds: number
  remainingSeconds: number | null
  hasLimit: boolean
  className?: string
}

export function SessionHeaderTimer({
  elapsedSeconds,
  remainingSeconds,
  hasLimit,
  className = '',
}: SessionHeaderTimerProps) {
  const showRemaining = hasLimit && remainingSeconds !== null
  const displaySeconds = showRemaining ? remainingSeconds : elapsedSeconds
  const urgent = showRemaining && remainingSeconds <= 300

  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      aria-live="polite"
      role="timer"
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-xs">
        {showRemaining ? 'Time remaining' : 'Elapsed'}
      </span>
      <span
        className={`mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-3xl ${
          urgent ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {formatTime(displaySeconds)}
      </span>
    </div>
  )
}
