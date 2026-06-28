import { motion } from 'framer-motion'
import { MobileSessionBar } from '../components/MobileSessionBar'
import type { AnswerRecord, Question, QuizState } from '../types/question'
import { getOptionLabel } from '../utils/quizUtils'

interface QuizReviewPageProps {
  quizState: QuizState
  onViewResults: () => void
}

function ReviewItem({
  index,
  question,
  answer,
}: {
  index: number
  question: Question
  answer: AnswerRecord | undefined
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          Q{index + 1}
        </span>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
          {question.difficulty}
        </span>
      </div>
      <h2 className="text-base font-semibold leading-relaxed text-gray-900 sm:text-lg">
        {question.question}
      </h2>

      <ul className="mt-4 space-y-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = answer?.selectedAnswer === optionIndex
          const isCorrect = optionIndex === question.correctAnswer
          let className = 'rounded-xl border px-4 py-3 text-sm '
          if (isCorrect) className += 'border-green-300 bg-green-50 text-green-900'
          else if (isSelected) className += 'border-red-300 bg-red-50 text-red-900'
          else className += 'border-gray-100 bg-gray-50 text-gray-600'

          return (
            <li key={optionIndex} className={className}>
              <span className="font-medium">{getOptionLabel(optionIndex)}.</span> {option}
              {isCorrect && <span className="ml-2 text-xs font-semibold text-green-700">Correct</span>}
              {isSelected && !isCorrect && (
                <span className="ml-2 text-xs font-semibold text-red-700">Your answer</span>
              )}
            </li>
          )
        })}
      </ul>

      {answer && (
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          <span className="font-medium">Explanation:</span> {question.explanation}
        </p>
      )}
    </article>
  )
}

export function QuizReviewPage({ quizState, onViewResults }: QuizReviewPageProps) {
  const answeredCount = Object.keys(quizState.answers).length
  const total = quizState.questions.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pb-36 sm:px-6 sm:pb-12"
    >
      <div className="mx-auto max-w-3xl lg:max-w-6xl">
        <header className="sticky top-0 z-10 -mx-4 border-b border-gray-200 bg-[#fafafa]/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-left">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Review your test</h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                {quizState.config.topic} · {answeredCount} of {total} questions answered
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onViewResults}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden shrink-0 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:inline-flex sm:px-8 sm:py-3.5"
            >
              View score summary
            </motion.button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 pt-6 lg:grid-cols-2 lg:pt-8">
          {quizState.questions.map((question, index) => (
            <ReviewItem
              key={question.id}
              index={index}
              question={question}
              answer={quizState.answers[question.id]}
            />
          ))}
        </div>
      </div>

      <MobileSessionBar
        primary={{ label: 'View score summary', onClick: onViewResults }}
      />
    </motion.div>
  )
}
