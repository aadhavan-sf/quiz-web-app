import { useEffect, useRef } from 'react'
import type { AnswerRecord, Question } from '../types/question'

export type TrackerItemState = 'current' | 'correct' | 'wrong' | 'skipped' | 'unvisited'

interface QuestionTrackerProps {
  questions: Question[]
  currentIndex: number
  answers: Record<number, AnswerRecord>
  skippedIds: number[]
  onSelect: (index: number) => void
  canNavigateTo?: (index: number) => boolean
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

function getItemState(
  question: Question,
  index: number,
  currentIndex: number,
  answers: Record<number, AnswerRecord>,
  skippedIds: number[],
): TrackerItemState {
  if (index === currentIndex) return 'current'
  const answer = answers[question.id]
  if (answer) return answer.isCorrect ? 'correct' : 'wrong'
  if (skippedIds.includes(question.id)) return 'skipped'
  return 'unvisited'
}

const stateStyles: Record<TrackerItemState, string> = {
  current: 'border-primary-600 bg-primary-600 text-white ring-2 ring-primary-200',
  correct: 'border-green-500 bg-green-50 text-green-800',
  wrong: 'border-red-500 bg-red-50 text-red-800',
  skipped: 'border-amber-400 bg-amber-50 text-amber-800',
  unvisited: 'border-gray-200 bg-gray-50 text-gray-500',
}

export function QuestionTracker({
  questions,
  currentIndex,
  answers,
  skippedIds,
  onSelect,
  canNavigateTo,
  orientation = 'vertical',
  className = '',
}: QuestionTrackerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHorizontal = orientation === 'horizontal'

  useEffect(() => {
    if (!isHorizontal || !scrollRef.current) return
    const active = scrollRef.current.querySelector('[data-current="true"]')
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [currentIndex, isHorizontal])

  const answeredCount = Object.keys(answers).length
  const skippedCount = skippedIds.filter((id) => !answers[id]).length

  return (
    <nav
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      aria-label="Question tracker"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">Questions</p>
        <p className="text-xs text-gray-500">
          {answeredCount}/{questions.length} done
          {skippedCount > 0 && ` · ${skippedCount} skipped`}
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
        {questions.map((question, index) => {
          const state = getItemState(question, index, currentIndex, answers, skippedIds)
          const navigable = canNavigateTo ? canNavigateTo(index) : state !== 'unvisited'
          return (
            <button
              key={question.id}
              type="button"
              data-current={index === currentIndex ? 'true' : undefined}
              onClick={() => navigable && onSelect(index)}
              disabled={!navigable}
              className={`flex shrink-0 items-center justify-center rounded-xl border-2 text-sm font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isHorizontal ? 'h-11 min-w-11 px-3' : 'h-10 w-full'
              } ${stateStyles[state]}`}
              aria-label={`Question ${index + 1}${
                state === 'correct'
                  ? ', answered correctly'
                  : state === 'wrong'
                    ? ', answered incorrectly'
                    : state === 'skipped'
                      ? ', skipped'
                      : state === 'current'
                        ? ', current'
                        : ''
              }`}
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
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Correct
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Wrong
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Skipped
        </span>
      </div>
    </nav>
  )
}
