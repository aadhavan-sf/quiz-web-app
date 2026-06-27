import { motion } from 'framer-motion'
import { PerformanceBadge } from '../components/PerformanceBadge'
import type { QuizResults } from '../types/question'
import { formatTime, getAccuracy, getOptionLabel, getPerformanceLevel } from '../utils/quizUtils'

interface ResultsPageProps {
  userName: string
  topic: string
  results: QuizResults
  onRestart: () => void
  onNewQuiz: () => void
}

export function ResultsPage({
  userName,
  topic,
  results,
  onRestart,
  onNewQuiz,
}: ResultsPageProps) {
  const { totalQuestions, correctCount, wrongCount, percentage, performance, incorrectQuestions, elapsedSeconds } =
    results

  const answeredCount = correctCount + wrongCount
  const leftEarly = answeredCount < totalQuestions
  const displayPercentage = leftEarly
    ? getAccuracy(correctCount, answeredCount)
    : percentage
  const displayPerformance = leftEarly ? getPerformanceLevel(displayPercentage) : performance

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {leftEarly ? `Session Ended, ${userName}` : `Congratulations, ${userName}!`}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {leftEarly
              ? `You answered ${answeredCount} of ${totalQuestions} ${topic} questions.`
              : `You completed all ${totalQuestions} ${topic} questions.`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <p className="text-5xl font-bold text-gray-900 dark:text-white">{displayPercentage}%</p>
            <PerformanceBadge level={displayPerformance} />
            {leftEarly && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accuracy based on {answeredCount} answered question{answeredCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={totalQuestions} />
            <StatCard label="Correct" value={correctCount} color="text-green-600 dark:text-green-400" />
            <StatCard label="Incorrect" value={wrongCount} color="text-red-600 dark:text-red-400" />
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
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Review Incorrect Answers ({incorrectQuestions.length})
            </h2>
            <div className="space-y-4">
              {incorrectQuestions.map(({ question, selectedAnswer }) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {question.subtopic}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="mb-3 font-medium text-gray-900 dark:text-white">{question.question}</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-red-700 dark:text-red-400">
                      <span className="font-medium">Your Answer:</span>{' '}
                      {getOptionLabel(selectedAnswer)} — {question.options[selectedAnswer]}
                    </p>
                    <p className="text-green-700 dark:text-green-400">
                      <span className="font-medium">Correct Answer:</span>{' '}
                      {getOptionLabel(question.correctAnswer)} —{' '}
                      {question.options[question.correctAnswer]}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
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
          className="flex flex-col justify-center gap-3 sm:flex-row"
        >
          <motion.button
            type="button"
            onClick={onRestart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            Restart Quiz
          </motion.button>
          <motion.button
            type="button"
            onClick={onNewQuiz}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Generate New Quiz
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  color = 'text-gray-900 dark:text-white',
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
