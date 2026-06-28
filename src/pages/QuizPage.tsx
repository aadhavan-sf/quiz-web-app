import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MobileSessionBar, mobileSessionBarPadding } from '../components/MobileSessionBar'
import { QuestionCard } from '../components/QuestionCard'
import { QuestionTracker } from '../components/QuestionTracker'
import { LeaveSessionButton } from '../components/LeaveSessionButton'
import { SessionPageHeader } from '../components/SessionPageHeader'
import { useAuth } from '../context/AuthContext'
import { useResumableSessionTimer } from '../hooks/useLocalStorage'
import { useQuizSessionSync } from '../hooks/useSessionSync'
import type { useQuiz } from '../hooks/useQuiz'

type QuizHookReturn = ReturnType<typeof useQuiz>

interface QuizPageProps {
  quiz: QuizHookReturn
  onSubmit: () => void
  onLeave: () => void
}

export function QuizPage({ quiz, onSubmit, onLeave }: QuizPageProps) {
  const { avatarUrl } = useAuth()
  const {
    quizState,
    currentQuestion,
    currentAnswer,
    currentIndex,
    skippedQuestionIds,
    submitAnswer,
    goToQuestion,
    skipCurrentQuestion,
    goToNextQuestion,
    canNavigateToIndex,
    attachSessionId,
    syncElapsedSeconds,
    stats,
    isComplete,
  } = quiz

  const sessionKey = quizState?.sessionId ?? quizState?.startedAt
  const { elapsedSeconds, remainingSeconds, isExpired, hasLimit } = useResumableSessionTimer(
    sessionKey,
    quizState?.elapsedSeconds,
    quizState?.config.timeLimitMinutes,
  )

  useQuizSessionSync(quizState, attachSessionId, elapsedSeconds)

  useEffect(() => {
    if (!quizState) return
    syncElapsedSeconds(elapsedSeconds)
  }, [elapsedSeconds, quizState, syncElapsedSeconds])

  useEffect(() => {
    if (isExpired && quizState && isComplete) onSubmit()
  }, [isExpired, onSubmit, quizState, isComplete])

  if (!quizState || !currentQuestion) return null

  const { config } = quizState
  const hasAnsweredCurrent = currentAnswer !== null
  const isCurrentSkipped =
    skippedQuestionIds.includes(currentQuestion.id) && !hasAnsweredCurrent
  const canSkip = !hasAnsweredCurrent && !isComplete
  const readyToSubmit = isComplete && hasAnsweredCurrent

  const handleNext = () => {
    if (!hasAnsweredCurrent) return
    if (readyToSubmit) {
      onSubmit()
    } else {
      goToNextQuestion()
    }
  }

  const nextLabel = readyToSubmit ? 'Submit Test' : 'Next Question'
  const showMobileBar = canSkip || hasAnsweredCurrent

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen px-4 py-4 sm:px-6 sm:py-6 ${mobileSessionBarPadding(showMobileBar)}`}
    >
      <div className="mx-auto max-w-6xl">
        <SessionPageHeader
          topic={config.topic}
          assessmentLabel={`MCQ Practice · ${config.difficulty}`}
          userName={config.fullName}
          avatarUrl={avatarUrl}
          remainingSeconds={remainingSeconds}
          hasLimit={hasLimit}
          leaveButton={
            <LeaveSessionButton
              onConfirm={onLeave}
              message={
                stats.answered > 0
                  ? 'Your progress is saved if you are signed in. Leaving now will not submit the test for review.'
                  : 'You have not answered any questions yet. Leaving will return you to the home screen.'
              }
            />
          }
        />

        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <QuestionTracker
            className="hidden w-56 shrink-0 lg:block xl:w-64"
            orientation="vertical"
            questions={quizState.questions}
            currentIndex={currentIndex}
            answers={quizState.answers}
            skippedIds={skippedQuestionIds}
            onSelect={goToQuestion}
            canNavigateTo={canNavigateToIndex}
          />

          <div className="min-w-0 flex-1 space-y-5">
            <QuestionTracker
              className="lg:hidden"
              orientation="horizontal"
              questions={quizState.questions}
              currentIndex={currentIndex}
              answers={quizState.answers}
              skippedIds={skippedQuestionIds}
              onSelect={goToQuestion}
              canNavigateTo={canNavigateToIndex}
            />

            {isComplete && !readyToSubmit && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Answer all questions before submitting. Use the question tracker to revisit skipped items.
              </p>
            )}

            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                answer={currentAnswer}
                onSelect={(index) =>
                  submitAnswer(currentQuestion.id, index, currentQuestion.correctAnswer)
                }
                canSkip={canSkip}
                onSkip={skipCurrentQuestion}
                showNext={hasAnsweredCurrent}
                nextLabel={nextLabel}
                onNext={handleNext}
                highlightSubmit={readyToSubmit}
              />
            </AnimatePresence>

            {isCurrentSkipped && (
              <p className="text-center text-sm text-amber-700">
                You skipped this question earlier — select an answer when ready.
              </p>
            )}
          </div>
        </div>
      </div>

      <MobileSessionBar
        secondary={
          canSkip
            ? { label: 'Skip for now', onClick: skipCurrentQuestion }
            : undefined
        }
        primary={
          hasAnsweredCurrent
            ? {
                label: nextLabel,
                onClick: handleNext,
                variant: readyToSubmit ? 'primary' : 'primary',
              }
            : undefined
        }
      />
    </motion.div>
  )
}
