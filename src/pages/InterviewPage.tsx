import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { InterviewBottomBar } from '../components/InterviewBottomBar'
import { InterviewEvaluatingScreen } from '../components/InterviewEvaluatingScreen'
import { InterviewFeedbackSections } from '../components/InterviewFeedbackSections'
import { LeaveSessionButton } from '../components/LeaveSessionButton'
import { ProgressBar } from '../components/ProgressBar'
import type { InterviewSessionState } from '../types/question'
import { evaluateInterviewAnswer } from '../utils/api'
import { formatTime } from '../utils/quizUtils'

interface InterviewPageProps {
  session: InterviewSessionState
  onUpdate: (session: InterviewSessionState) => void
  onComplete: () => void
  onLeave: () => void
}

export function InterviewPage({ session, onUpdate, onComplete, onLeave }: InterviewPageProps) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackAcknowledged, setFeedbackAcknowledged] = useState(false)

  const { config, currentQuestion, currentQuestionIndex, phase, history, startedAt } = session
  const total = config.questionCount
  const progress = Math.round(((currentQuestionIndex + (phase === 'feedback' ? 1 : 0)) / total) * 100)
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  const lastEvaluation = history[history.length - 1]?.evaluation
  const isLastQuestion = currentQuestionIndex + 1 >= total

  useEffect(() => {
    setAnswer('')
    setError(null)
  }, [currentQuestionIndex])

  useEffect(() => {
    if (phase === 'feedback') {
      setFeedbackAcknowledged(false)
    }
  }, [phase, currentQuestionIndex])

  const submitAnswer = useCallback(
    async (answerText: string) => {
      const trimmed = answerText.trim()
      if (!currentQuestion || !trimmed || isSubmitting) return

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

        const newHistory = [
          ...history,
          {
            question: currentQuestion,
            userAnswer: trimmed,
            evaluation: result.evaluation,
          },
        ]

        onUpdate({
          ...session,
          history: newHistory,
          phase: 'feedback',
          currentQuestion: result.nextQuestion,
        })
        setAnswer('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Evaluation failed')
        onUpdate({ ...session, phase: 'answering' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [config, currentQuestion, currentQuestionIndex, history, isSubmitting, onUpdate, session],
  )

  const handleSubmit = () => {
    void submitAnswer(answer)
  }

  const handleNext = () => {
    if (isLastQuestion || !session.currentQuestion) {
      onComplete()
      return
    }

    onUpdate({
      ...session,
      currentQuestionIndex: currentQuestionIndex + 1,
      phase: 'answering',
    })
  }

  const controlsDisabled = isSubmitting || phase === 'evaluating'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {phase === 'evaluating' && <InterviewEvaluatingScreen />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pt-4 pb-36 sm:px-6 sm:pt-6"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{config.fullName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{config.topic}</p>
          </div>
          <LeaveSessionButton
            onConfirm={onLeave}
            message={
              history.length > 0
                ? 'You will receive an interview report based on the questions you have completed so far.'
                : 'You have not completed any questions yet. Leaving will return you to the home screen.'
            }
          />
        </header>

        <section
          className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          aria-label="Interview progress"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Question {Math.min(currentQuestionIndex + 1, total)} / {total}
            </p>
            <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{formatTime(elapsed)}</p>
          </div>
          <ProgressBar percentage={progress} className="h-2.5" />
        </section>

        {phase === 'feedback' && lastEvaluation && (
          <section className="space-y-4" aria-label="Feedback">
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/40">
              <p className="text-base font-semibold text-green-800 dark:text-green-300">Feedback ready</p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                Review the AI evaluation below — including the ideal answer — then continue.
              </p>
            </div>
            <InterviewFeedbackSections evaluation={lastEvaluation} />
          </section>
        )}

        {phase === 'answering' && currentQuestion && (
          <>
            <section
              className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6"
              aria-label="Interview question"
            >
              {currentQuestion.contextualIntro && (
                <p className="mb-3 text-base italic leading-relaxed text-blue-600 dark:text-blue-400">
                  {currentQuestion.contextualIntro}
                </p>
              )}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium dark:bg-gray-800">
                  {currentQuestion.subtopic}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <h1 className="text-xl font-bold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                {currentQuestion.question}
              </h1>
            </section>

            <section className="flex-1" aria-label="Answer">
              <label
                htmlFor="interview-answer"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Your Answer
              </label>
              <textarea
                id="interview-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={controlsDisabled}
                placeholder="Type your interview answer here. The AI will evaluate it and suggest improvements."
                rows={10}
                className="input-field min-h-[12rem] resize-y text-base leading-relaxed disabled:opacity-60"
                aria-label="Your answer"
              />
              {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
            </section>
          </>
        )}
      </motion.div>

      {(phase === 'answering' || phase === 'feedback') && (
        <InterviewBottomBar
          mode={phase === 'feedback' ? 'feedback' : 'answering'}
          hasAnswer={Boolean(answer.trim())}
          disabled={controlsDisabled}
          feedbackAcknowledged={feedbackAcknowledged}
          isLastQuestion={isLastQuestion}
          onSubmit={handleSubmit}
          onContinue={handleNext}
          onAcknowledgeFeedback={() => setFeedbackAcknowledged(true)}
        />
      )}
    </div>
  )
}
