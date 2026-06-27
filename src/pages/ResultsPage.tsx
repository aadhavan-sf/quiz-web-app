import { motion } from 'framer-motion'
import { PerformanceBadge } from '../components/PerformanceBadge'
import type { QuizResults } from '../types/question'
import { formatTime, getOptionLabel } from '../utils/quizUtils'

interface ResultsPageProps {
  userName: string
  results: QuizResults
  onRestart: () => void
}

export function ResultsPage({ userName, results, onRestart }: ResultsPageProps) {
  const { correctCount, wrongCount, percentage, performance, incorrectQuestions, elapsedSeconds } =
    results

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Congratulations, {userName}!
          </h1>
          <p className="mt-2 text-gray-600">You completed all 100 questions.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <p className="text-5xl font-bold text-gray-900">{percentage}%</p>
            <PerformanceBadge level={performance} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Score" value={correctCount} />
            <StatCard label="Correct" value={correctCount} color="text-green-600" />
            <StatCard label="Wrong" value={wrongCount} color="text-red-600" />
            <StatCard label="Time" value={formatTime(elapsedSeconds)} />
          </div>
        </motion.div>

        {incorrectQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Review Incorrect Answers ({incorrectQuestions.length})
            </h2>
            <div className="space-y-4">
              {incorrectQuestions.map(({ question, selectedAnswer }) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    Question {question.id}
                  </p>
                  <p className="mb-3 font-medium text-gray-900">{question.question}</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-red-700">
                      <span className="font-medium">Your Answer:</span>{' '}
                      {getOptionLabel(selectedAnswer)} — {question.options[selectedAnswer]}
                    </p>
                    <p className="text-green-700">
                      <span className="font-medium">Correct Answer:</span>{' '}
                      {getOptionLabel(question.correctAnswer)} —{' '}
                      {question.options[question.correctAnswer]}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Explanation:</span> {question.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            type="button"
            onClick={onRestart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Restart Quiz
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  color = 'text-gray-900',
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
