import { AnimatePresence, motion } from 'framer-motion'
import { QuizDashboard } from '../components/QuizDashboard'
import { QuestionCard } from '../components/QuestionCard'
import { LeaveSessionButton } from '../components/LeaveSessionButton'
import { useTimer } from '../hooks/useLocalStorage'
import type { useQuiz } from '../hooks/useQuiz'

type QuizHookReturn = ReturnType<typeof useQuiz>

interface QuizPageProps {
  quiz: QuizHookReturn
  onComplete: () => void
  onLeave: () => void
}

export function QuizPage({ quiz, onComplete, onLeave }: QuizPageProps) {
  const {
    quizState,
    currentQuestion,
    currentAnswer,
    currentIndex,
    submitAnswer,
    goToNextQuestion,
    stats,
    progress,
    isComplete,
  } = quiz

  const elapsedSeconds = useTimer(true, quizState?.startedAt ?? null)

  if (!quizState || !currentQuestion) return null

  const { config } = quizState
  const isLastQuestion = currentIndex === quizState.questions.length - 1
  const canGoNext = currentAnswer !== null

  const handleNext = () => {
    if (isLastQuestion && canGoNext) {
      onComplete()
    } else {
      goToNextQuestion()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-end">
          <LeaveSessionButton
            onConfirm={onLeave}
            message={
              stats.answered > 0
                ? 'You will be taken to your results based on the questions you have answered so far.'
                : 'You have not answered any questions yet. Leaving will return you to the home screen.'
            }
          />
        </div>

        <QuizDashboard
          userName={config.fullName}
          topic={config.topic}
          difficulty={config.difficulty}
          currentQuestion={currentIndex + 1}
          totalQuestions={quizState.questions.length}
          progress={progress}
          correctCount={stats.correct}
          wrongCount={stats.wrong}
          answeredCount={stats.answered}
          elapsedSeconds={elapsedSeconds}
        />

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
