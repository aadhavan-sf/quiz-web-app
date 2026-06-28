import { motion } from 'framer-motion'
import { PerformanceBadge } from '../components/PerformanceBadge'
import { MobileSessionBar } from '../components/MobileSessionBar'
import type { QuizResults } from '../types/question'
import { formatTime, getAccuracy, getOptionLabel, getPerformanceLevel } from '../utils/quizUtils'

interface ResultsPageProps {
  userName: string
  topic: string
  results: QuizResults
  onRestart: () => void
  onNewQuiz: () => void
}

function ResultsActions({
  onRestart,
  onNewQuiz,
  className = '',
}: {
  onRestart: () => void
  onNewQuiz: () => void
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:gap-3 ${className}`}>
      <motion.button
        type="button"
        onClick={onRestart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 sm:py-3.5"
      >
        Restart Quiz
      </motion.button>
      <motion.button
        type="button"
        onClick={onNewQuiz}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:py-3.5"
      >
        Generate New Quiz
      </motion.button>
    </div>
  )
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
      className="min-h-screen px-4 pb-36 sm:px-6 sm:pb-12"
    >
      <div className="mx-auto max-w-3xl">
        <header className="sticky top-0 z-10 -mx-4 border-b border-gray-200 bg-[#fafafa]/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-left">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                {leftEarly ? `Session Ended, ${userName}` : `Congratulations, ${userName}!`}
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                {leftEarly
                  ? `You answered ${answeredCount} of ${totalQuestions} ${topic} questions.`
                  : `You completed all ${totalQuestions} ${topic} questions.`}
              </p>
            </div>
            <ResultsActions
              onRestart={onRestart}
              onNewQuiz={onNewQuiz}
              className="hidden shrink-0 sm:flex"
            />
          </div>
        </header>

        <div className="pt-6 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex flex-col items-center gap-3">
              <p className="text-5xl font-bold text-gray-900">{displayPercentage}%</p>
              <PerformanceBadge level={displayPerformance} />
              {leftEarly && (
                <p className="text-xs text-gray-500">
                  Accuracy based on {answeredCount} answered question{answeredCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total" value={totalQuestions} />
              <StatCard label="Correct" value={correctCount} color="text-green-600" />
              <StatCard label="Incorrect" value={wrongCount} color="text-red-600" />
              <StatCard label="Time" value={formatTime(elapsedSeconds)} />
            </div>
          </motion.div>

          {incorrectQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {question.subtopic}
                      </span>
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">
                        {question.difficulty}
                      </span>
                    </div>
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
        </div>
      </div>

      <MobileSessionBar
        secondary={{ label: 'Restart Quiz', onClick: onRestart, variant: 'secondary' }}
        primary={{ label: 'Generate New Quiz', onClick: onNewQuiz }}
      />
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
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
