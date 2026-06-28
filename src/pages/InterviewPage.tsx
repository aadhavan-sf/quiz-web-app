import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { InterviewAnswerInput } from '../components/InterviewAnswerInput'
import { InterviewBottomBar } from '../components/InterviewBottomBar'
import { InterviewEvaluatingScreen } from '../components/InterviewEvaluatingScreen'
import { InterviewFeedbackSections } from '../components/InterviewFeedbackSections'
import { InterviewProgressCard } from '../components/InterviewProgressCard'
import { InterviewQuestionTracker } from '../components/InterviewQuestionTracker'
import { LeaveSessionButton } from '../components/LeaveSessionButton'
import { SessionPageHeader } from '../components/SessionPageHeader'
import { useAuth } from '../context/AuthContext'
import { usePracticeTimer } from '../hooks/useLocalStorage'
import { useInterviewSessionSync } from '../hooks/useSessionSync'
import { useTimedSpeechTips } from '../hooks/useTimedSpeechTips'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import type { InterviewQuestion, InterviewSessionState } from '../types/question'
import { evaluateInterviewAnswer, skipInterviewQuestion } from '../utils/api'
import {
  answeredIndices,
  canNavigateToIndex,
  findNextOpenIndex,
  getHistoryForIndex,
  isIndexAnswered,
  isInterviewComplete,
  pendingSkippedCount,
  skippedIndices,
  skippedQuestionsForApi,
} from '../utils/interviewSessionUtils'

interface InterviewPageProps {
  session: InterviewSessionState
  onUpdate: (session: InterviewSessionState) => void
  onComplete: (elapsedSeconds: number) => void
  onLeave: () => void
}

export function InterviewPage({ session, onUpdate, onComplete, onLeave }: InterviewPageProps) {
  const { avatarUrl } = useAuth()
  const showTranscriptionTips = useTimedSpeechTips()
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [feedbackAcknowledged, setFeedbackAcknowledged] = useState(false)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const { config, currentQuestion, currentQuestionIndex, phase, history } = session
  const activeSinceRef = useRef(Date.now())
  const baseElapsed = session.elapsedSeconds ?? 0

  const { elapsedSeconds, remainingSeconds, isExpired, hasLimit } = usePracticeTimer(
    activeSinceRef.current,
    baseElapsed,
    config.timeLimitMinutes,
  )
  const speech = useSpeechRecognition({ topic: config.topic })
  const { resetRecording } = speech

  useInterviewSessionSync(session, (sessionId) => {
    if (session.sessionId !== sessionId) {
      onUpdate({ ...session, sessionId })
    }
  }, elapsedSeconds)

  useEffect(() => {
    if (session.elapsedSeconds === elapsedSeconds) return
    onUpdate({ ...session, elapsedSeconds })
  }, [elapsedSeconds, session, onUpdate])

  const total = config.questionCount
  const answered = answeredIndices(history)
  const skipped = skippedIndices(session)
  const complete = isInterviewComplete(session)
  const progress = Math.round((answered.length / total) * 100)
  const pendingSkipped = pendingSkippedCount(session)

  useEffect(() => {
    if (isExpired) onComplete(elapsedSeconds)
  }, [isExpired, onComplete, elapsedSeconds])

  const activeIndex = reviewIndex ?? currentQuestionIndex
  const reviewEntry = reviewIndex !== null ? getHistoryForIndex(history, reviewIndex) : null
  const isReviewMode = reviewIndex !== null && reviewEntry !== null

  const speechState = speech.isTranscribing
    ? 'transcribing'
    : speech.isRecording
      ? 'recording'
      : 'idle'

  const lastEvaluation = history[history.length - 1]?.evaluation
  const feedbackEvaluation = isReviewMode
    ? reviewEntry?.evaluation
    : phase === 'feedback'
      ? lastEvaluation
      : null

  useEffect(() => {
    setAnswer('')
    setError(null)
    resetRecording()
  }, [currentQuestionIndex, reviewIndex, resetRecording])

  useEffect(() => {
    if (phase === 'feedback') setFeedbackAcknowledged(false)
  }, [phase, currentQuestionIndex])

  const handleStopRecording = useCallback(async () => {
    const finalText = await speech.stopRecording()
    setAnswer(finalText)
  }, [speech])

  const submitAnswer = useCallback(
    async (answerText: string) => {
      const trimmed = answerText.trim()
      if (!currentQuestion || !trimmed || isSubmitting || speech.isBusy || isReviewMode) return

      setIsSubmitting(true)
      onUpdate({ ...session, phase: 'evaluating' })
      setError(null)

      try {
        const result = await evaluateInterviewAnswer({
          config,
          question: currentQuestion,
          userAnswer: trimmed,
          history,
          questionIndex: currentQuestionIndex,
        })

        const nextSkipped = skipped.filter((i) => i !== currentQuestionIndex)
        const nextBank = { ...(session.questionBank ?? {}), [currentQuestionIndex]: currentQuestion }
        if (result.nextQuestion) {
          nextBank[currentQuestionIndex + 1] = result.nextQuestion
        }

        onUpdate({
          ...session,
          history: [
            ...history,
            {
              questionIndex: currentQuestionIndex,
              question: currentQuestion,
              userAnswer: trimmed,
              evaluation: result.evaluation,
            },
          ],
          skippedQuestionIndices: nextSkipped,
          questionBank: nextBank,
          phase: 'feedback',
          currentQuestion: result.nextQuestion,
        })
        setAnswer('')
        setReviewIndex(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Evaluation failed')
        onUpdate({ ...session, phase: 'answering' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      config,
      currentQuestion,
      currentQuestionIndex,
      history,
      isReviewMode,
      isSubmitting,
      onUpdate,
      session,
      skipped,
      speech.isBusy,
    ],
  )

  const handleSkip = useCallback(async () => {
    if (!currentQuestion || isSubmitting || isSkipping || speech.isBusy || isReviewMode) return
    if (isIndexAnswered(history, currentQuestionIndex)) return

    setIsSkipping(true)
    setError(null)

    const nextSkipped = skipped.includes(currentQuestionIndex)
      ? skipped
      : [...skipped, currentQuestionIndex].sort((a, b) => a - b)

    const nextBank = {
      ...(session.questionBank ?? {}),
      [currentQuestionIndex]: currentQuestion,
    }

    try {
      let nextIndex: number | null = null
      let nextQuestion: InterviewQuestion | null = null

      if (currentQuestionIndex + 1 < total) {
        const { nextQuestion: generated } = await skipInterviewQuestion({
          config,
          history,
          questionIndex: currentQuestionIndex,
          skippedQuestions: skippedQuestionsForApi({
            ...session,
            skippedQuestionIndices: nextSkipped,
            questionBank: nextBank,
          }),
        })
        if (generated) {
          nextIndex = currentQuestionIndex + 1
          nextBank[nextIndex] = generated
          nextQuestion = generated
        }
      }

      if (nextIndex === null) {
        nextIndex = findNextOpenIndex(
          { ...session, skippedQuestionIndices: nextSkipped, questionBank: nextBank },
          currentQuestionIndex,
        )
        if (nextIndex !== null) {
          nextQuestion = nextBank[nextIndex] ?? null
        }
      }

      onUpdate({
        ...session,
        skippedQuestionIndices: nextSkipped,
        questionBank: nextBank,
        currentQuestionIndex: nextIndex ?? currentQuestionIndex,
        currentQuestion: nextQuestion ?? session.currentQuestion,
        phase: 'answering',
      })

      setAnswer('')
      setReviewIndex(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip question')
    } finally {
      setIsSkipping(false)
    }
  }, [
    config,
    currentQuestion,
    currentQuestionIndex,
    history,
    isReviewMode,
    isSkipping,
    isSubmitting,
    onUpdate,
    session,
    skipped,
    speech.isBusy,
    total,
  ])

  const handleTrackerSelect = useCallback(
    (index: number) => {
      if (!canNavigateToIndex(session, index)) return

      if (isIndexAnswered(history, index)) {
        setReviewIndex(index)
        return
      }

      const bank = session.questionBank ?? {}
      setReviewIndex(null)
      onUpdate({
        ...session,
        currentQuestionIndex: index,
        currentQuestion: bank[index] ?? session.currentQuestion,
        phase: 'answering',
      })
    },
    [history, onUpdate, session],
  )

  const handleContinueAfterFeedback = () => {
    if (isReviewMode) {
      setReviewIndex(null)
      return
    }

    if (!feedbackAcknowledged) {
      setFeedbackAcknowledged(true)
      return
    }

    if (complete) {
      onComplete(elapsedSeconds)
      return
    }

    const open = findNextOpenIndex(session, currentQuestionIndex)
    if (open === null) {
      onComplete(elapsedSeconds)
      return
    }

    const bank = session.questionBank ?? {}
    onUpdate({
      ...session,
      currentQuestionIndex: open,
      currentQuestion: bank[open] ?? session.currentQuestion,
      phase: 'answering',
    })
    setReviewIndex(null)
  }

  const controlsDisabled = isSubmitting || isSkipping || phase === 'evaluating' || speech.isBusy
  const hasAnswer = Boolean(answer.trim())
  const canSkip =
    !isReviewMode &&
    phase === 'answering' &&
    !isIndexAnswered(history, currentQuestionIndex) &&
    !complete

  const showFeedback =
    (phase === 'feedback' && lastEvaluation && !isReviewMode) ||
    (isReviewMode && feedbackEvaluation)

  const showQuestion =
    phase === 'answering' && currentQuestion && !isReviewMode

  const continueLabel = isReviewMode
    ? 'Back to current question'
    : complete && feedbackAcknowledged
      ? 'View Interview Report'
      : !feedbackAcknowledged
        ? "I've Reviewed the Feedback"
        : pendingSkipped > 0
          ? 'Next Question'
          : complete
            ? 'View Interview Report'
            : 'Next Question'

  return (
    <div className="min-h-screen bg-gray-50">
      {phase === 'evaluating' && <InterviewEvaluatingScreen />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 sm:pb-40 ${
          canSkip && showQuestion ? 'pb-52' : 'pb-44'
        }`}
      >
        <SessionPageHeader
          topic={config.topic}
          assessmentLabel={`Interview Practice · ${config.difficulty}`}
          userName={config.fullName}
          avatarUrl={avatarUrl}
          elapsedSeconds={elapsedSeconds}
          remainingSeconds={remainingSeconds}
          hasLimit={hasLimit}
          leaveButton={
            <LeaveSessionButton
              onConfirm={onLeave}
              message={
                history.length > 0
                  ? 'You will receive an interview report based on the questions you have completed so far.'
                  : 'You have not completed any questions yet. Leaving will return you to the home screen.'
              }
            />
          }
        />

        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <InterviewQuestionTracker
            className="hidden w-56 shrink-0 lg:block xl:w-64"
            orientation="vertical"
            total={total}
            currentIndex={activeIndex}
            answeredIndices={answered}
            skippedIndices={skipped}
            onSelect={handleTrackerSelect}
            canNavigateTo={(index) => canNavigateToIndex(session, index)}
          />

          <div className="min-w-0 flex-1 space-y-5">
            <InterviewQuestionTracker
              className="lg:hidden"
              orientation="horizontal"
              total={total}
              currentIndex={activeIndex}
              answeredIndices={answered}
              skippedIndices={skipped}
              onSelect={handleTrackerSelect}
              canNavigateTo={(index) => canNavigateToIndex(session, index)}
            />

            <InterviewProgressCard
              topic={config.topic}
              difficulty={config.difficulty}
              currentQuestion={activeIndex + 1}
              totalQuestions={total}
              progress={progress}
              completedCount={answered.length}
              skippedCount={pendingSkipped}
            />

            {isReviewMode && reviewEntry && (
              <p className="text-center text-sm text-primary-700">
                Reviewing question {reviewIndex! + 1} — read-only
              </p>
            )}

            {skipped.includes(currentQuestionIndex) &&
              !isIndexAnswered(history, currentQuestionIndex) &&
              showQuestion && (
                <p className="text-center text-sm text-amber-700">
                  You skipped this question earlier — record or type your answer when ready.
                </p>
              )}

            {showFeedback && feedbackEvaluation && (
              <section className="space-y-4" aria-label="Feedback">
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-base font-semibold text-green-800">Feedback ready</p>
                  <p className="mt-1 text-sm leading-relaxed text-green-700">
                    Review the evaluation below{isReviewMode ? '' : ', then continue'}.
                  </p>
                </div>
                <InterviewFeedbackSections evaluation={feedbackEvaluation} />
              </section>
            )}

            {showQuestion && (
              <>
                <section
                  className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
                  aria-label="Interview question"
                >
                  {currentQuestion.contextualIntro && (
                    <p className="mb-3 text-sm italic leading-relaxed text-primary-600 sm:text-base">
                      {currentQuestion.contextualIntro}
                    </p>
                  )}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {currentQuestion.subtopic}
                      </span>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    {canSkip && (
                      <button
                        type="button"
                        onClick={() => void handleSkip()}
                        disabled={controlsDisabled}
                        className="ml-auto hidden min-h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:inline-flex sm:items-center"
                      >
                        {isSkipping ? 'Skipping…' : 'Skip for now'}
                      </button>
                    )}
                  </div>
                  <h1 className="text-lg font-bold leading-snug text-gray-900 sm:text-2xl">
                    {currentQuestion.question}
                  </h1>
                </section>

                <section aria-label="Answer">
                  <InterviewAnswerInput
                    speech={speech}
                    value={answer}
                    onChange={setAnswer}
                    disabled={controlsDisabled}
                    showTranscriptionTips={showTranscriptionTips && activeIndex === 0}
                  />
                  {error && (
                    <p className="mt-3 text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {(phase === 'answering' || phase === 'feedback' || isReviewMode) && (
        <InterviewBottomBar
          mode={showFeedback ? 'feedback' : 'answering'}
          speechState={showQuestion ? speechState : 'idle'}
          hasAnswer={hasAnswer}
          disabled={controlsDisabled}
          feedbackAcknowledged={isReviewMode ? true : feedbackAcknowledged}
          isLastQuestion={complete && pendingSkipped === 0}
          onSubmit={() => void submitAnswer(answer)}
          onStopRecording={() => void handleStopRecording()}
          onContinue={handleContinueAfterFeedback}
          onAcknowledgeFeedback={() => setFeedbackAcknowledged(true)}
          continueLabel={continueLabel}
          showSkip={canSkip}
          onSkip={() => void handleSkip()}
          skipDisabled={controlsDisabled}
          skipLabel={isSkipping ? 'Skipping…' : 'Skip for now'}
        />
      )}
    </div>
  )
}
