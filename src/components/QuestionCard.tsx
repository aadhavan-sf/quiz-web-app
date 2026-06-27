import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import type { AnswerRecord, Question } from '../types/question'
import { getOptionLabel } from '../utils/quizUtils'
import { OptionButton } from './OptionButton'

interface QuestionCardProps {
  question: Question
  answer: AnswerRecord | null
  onSelect: (index: number) => void
}

function getOptionState(
  index: number,
  answer: AnswerRecord | null,
  correctAnswer: number,
): 'default' | 'selected-correct' | 'selected-wrong' | 'revealed-correct' {
  if (!answer) return 'default'
  if (index === answer.selectedAnswer && answer.isCorrect) return 'selected-correct'
  if (index === answer.selectedAnswer && !answer.isCorrect) return 'selected-wrong'
  if (index === correctAnswer && !answer.isCorrect) return 'revealed-correct'
  return 'default'
}

export function QuestionCard({ question, answer, onSelect }: QuestionCardProps) {
  const isLocked = answer !== null

  useEffect(() => {
    if (isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 }
      const index = keyMap[e.key.toLowerCase()]
      if (index !== undefined) {
        e.preventDefault()
        onSelect(index)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLocked, onSelect])

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <h2 className="mb-6 text-lg font-semibold leading-relaxed text-gray-900 sm:text-xl">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, index) => (
          <OptionButton
            key={index}
            label={option}
            index={index}
            state={getOptionState(index, answer, question.correctAnswer)}
            disabled={isLocked}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>

      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 overflow-hidden"
          >
            {answer.isCorrect ? (
              <div className="rounded-xl bg-green-50 p-4">
                <p className="font-semibold text-green-800">✅ Correct!</p>
                <p className="mt-2 text-sm leading-relaxed text-green-700">
                  {question.explanation}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 p-4">
                <p className="font-semibold text-red-800">❌ Incorrect</p>
                <p className="mt-2 text-sm text-red-700">
                  <span className="font-medium">Correct Answer:</span>{' '}
                  {getOptionLabel(question.correctAnswer)} —{' '}
                  {question.options[question.correctAnswer]}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-red-700">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
