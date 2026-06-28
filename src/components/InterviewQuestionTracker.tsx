import { useEffect, useRef } from 'react'

export type InterviewTrackerState = 'current' | 'completed' | 'skipped' | 'unvisited'

interface InterviewQuestionTrackerProps {
  total: number
  currentIndex: number
  answeredIndices: number[]
  skippedIndices: number[]
  onSelect: (index: number) => void
  canNavigateTo: (index: number) => boolean
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

function getState(
  index: number,
  currentIndex: number,
  answeredIndices: number[],
  skippedIndices: number[],
): InterviewTrackerState {
  if (index === currentIndex) return 'current'
  if (answeredIndices.includes(index)) return 'completed'
  if (skippedIndices.includes(index)) return 'skipped'
  return 'unvisited'
}

const stateStyles: Record<InterviewTrackerState, string> = {
  current: 'border-primary-600 bg-primary-600 text-white ring-2 ring-primary-200',
  completed: 'border-green-500 bg-green-50 text-green-800',
  skipped: 'border-amber-400 bg-amber-50 text-amber-800',
  unvisited: 'border-gray-200 bg-gray-50 text-gray-500',
}

export function InterviewQuestionTracker({
  total,
  currentIndex,
  answeredIndices,
  skippedIndices,
  onSelect,
  canNavigateTo,
  orientation = 'vertical',
  className = '',
}: InterviewQuestionTrackerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHorizontal = orientation === 'horizontal'
  const slots = Array.from({ length: total }, (_, i) => i)
  const pendingSkipped = skippedIndices.filter((i) => !answeredIndices.includes(i)).length

  useEffect(() => {
    if (!isHorizontal || !scrollRef.current) return
    scrollRef.current.querySelector('[data-current="true"]')?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [currentIndex, isHorizontal])

  return (
    <nav
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      aria-label="Interview question tracker"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">Questions</p>
        <p className="text-xs text-gray-500">
          {answeredIndices.length}/{total} done
          {pendingSkipped > 0 && ` · ${pendingSkipped} skipped`}
        </p>
      </div>

      <div
        ref={scrollRef}
        className={
          isHorizontal
            ? 'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'grid max-h-[min(70vh,32rem)] grid-cols-5 gap-2 overflow-y-auto content-start'
        }
      >
        {slots.map((index) => {
          const state = getState(index, currentIndex, answeredIndices, skippedIndices)
          const navigable = canNavigateTo(index)
          return (
            <button
              key={index}
              type="button"
              data-current={index === currentIndex ? 'true' : undefined}
              onClick={() => navigable && onSelect(index)}
              disabled={!navigable}
              className={`flex shrink-0 items-center justify-center rounded-xl border-2 text-sm font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isHorizontal ? 'h-11 min-w-11 px-3' : 'h-10 w-full'
              } ${stateStyles[state]}`}
              aria-current={index === currentIndex ? 'step' : undefined}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500 sm:text-xs">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-600" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Skipped
        </span>
      </div>
    </nav>
  )
}
