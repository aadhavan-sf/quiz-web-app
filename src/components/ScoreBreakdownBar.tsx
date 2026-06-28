interface ScoreBreakdownBarProps {
  correct: number
  wrong: number
  total: number
  className?: string
}

/** Static green/red bar — correct share vs wrong share of the test. */
export function ScoreBreakdownBar({ correct, wrong, total, className = '' }: ScoreBreakdownBarProps) {
  const safeTotal = Math.max(total, 1)
  const correctPct = (correct / safeTotal) * 100
  const wrongPct = (wrong / safeTotal) * 100

  return (
    <div
      className={`flex h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(correctPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${correct} correct, ${wrong} wrong out of ${total}`}
    >
      {correctPct > 0 && (
        <div className="h-full bg-green-500" style={{ width: `${correctPct}%` }} />
      )}
      {wrongPct > 0 && (
        <div className="h-full bg-red-400" style={{ width: `${wrongPct}%` }} />
      )}
    </div>
  )
}
