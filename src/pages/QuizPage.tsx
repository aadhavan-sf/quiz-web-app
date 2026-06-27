import { AnimatePresence, motion } from 'framer-motion'
import { QuizDashboard } from '../components/QuizDashboard'
import { QuestionCard } from '../components/QuestionCard'
import { QuestionNav } from '../components/QuestionNav'
import { useTimer } from '../hooks/useLocalStorage'
import type { Question } from '../types/question'
import type { useQuiz } from '../hooks/useQuiz'

type QuizHookReturn = ReturnType<typeof useQuiz>

interface QuizPageProps {
  userName: string
  questions: Question[]
  quiz: QuizHookReturn
  onComplete: () => void
}

export function QuizPage({ userName, questions, quiz, onComplete }: QuizPageProps) {
  const {
    quizState,
    currentQuestion,
    currentAnswer,
    currentIndex,
    submitAnswer,
    goToQuestion,
    goToNextQuestion,
    stats,
    progress,
    isComplete,
  } = quiz

  const elapsedSeconds = useTimer(true, quizState.startedAt)

  const isLastQuestion = currentIndex === questions.length - 1
  const canGoNext = currentAnswer !== null

  const handleNext = () => {
    if (isLastQuestion && canGoNext) {
      onComplete()
    } else {
      goToNextQuestion()
    }
  }

  if (!currentQuestion) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <QuizDashboard
          userName={userName}
          currentQuestion={currentIndex + 1}
          totalQuestions={questions.length}
          progress={progress}
          correctCount={stats.correct}
          wrongCount={stats.wrong}
          elapsedSeconds={elapsedSeconds}
        />

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <QuestionNav
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={quizState.answers}
            onNavigate={goToQuestion}
          />
        </div>

        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            answer={currentAnswer}
            onSelect={(index) =>
              submitAnswer(currentQuestion.id, index, currentQuestion.correctAnswer)
            }
          />
        </AnimatePresence>

        {canGoNext && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {isLastQuestion || isComplete ? 'View Results' : 'Next Question'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
