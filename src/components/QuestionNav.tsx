import { motion } from 'framer-motion'
import type { AnswerRecord } from '../types/question'

type QuestionStatus = 'current' | 'completed' | 'unanswered' | 'wrong'

interface QuestionNavProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<number, AnswerRecord>
  onNavigate: (index: number) => void
}

function getStatus(
  index: number,
  currentIndex: number,
  answers: Record<number, AnswerRecord>,
  questionId: number,
): QuestionStatus {
  if (index === currentIndex) return 'current'
  const answer = answers[questionId]
  if (!answer) return index < currentIndex ? 'unanswered' : 'unanswered'
  return answer.isCorrect ? 'completed' : 'wrong'
}

const statusStyles: Record<QuestionStatus, string> = {
  current: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200',
  completed: 'bg-green-600 text-white border-green-600',
  unanswered: 'bg-gray-100 text-gray-500 border-gray-200',
  wrong: 'bg-red-600 text-white border-red-600',
}

export function QuestionNav({
  totalQuestions,
  currentIndex,
  answers,
  onNavigate,
}: QuestionNavProps) {
  return (
    <nav aria-label="Question navigation" className="w-full">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionId = index + 1
          const status = getStatus(index, currentIndex, answers, questionId)
          const isDisabled = index > currentIndex

          return (
            <motion.button
              key={questionId}
              type="button"
              disabled={isDisabled}
              onClick={() => onNavigate(index)}
              whileHover={!isDisabled ? { scale: 1.05 } : undefined}
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors sm:h-9 sm:w-9 sm:text-sm ${statusStyles[status]} ${
                isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
              }`}
              aria-label={`Question ${questionId}${index === currentIndex ? ', current' : ''}${isDisabled ? ', locked' : ''}`}
              aria-current={index === currentIndex ? 'step' : undefined}
            >
              {questionId}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
