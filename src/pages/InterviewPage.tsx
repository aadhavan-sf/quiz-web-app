import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { InterviewAnswerInput } from '../components/InterviewAnswerInput'
import { InterviewBottomBar } from '../components/InterviewBottomBar'
import { InterviewEvaluatingScreen } from '../components/InterviewEvaluatingScreen'
import { InterviewFeedbackSections } from '../components/InterviewFeedbackSections'
import { LeaveSessionButton } from '../components/LeaveSessionButton'
import { ProgressBar } from '../components/ProgressBar'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
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
  const speech = useSpeechRecognition({ topic: config.topic })
  const { resetRecording } = speech
  const total = config.questionCount
  const progress = Math.round(((currentQuestionIndex + (phase === 'feedback' ? 1 : 0)) / total) * 100)
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  const lastEvaluation = history[history.length - 1]?.evaluation
  const isLastQuestion = currentQuestionIndex + 1 >= total

  const speechState = speech.isTranscribing
    ? 'transcribing'
    : speech.isRecording
      ? 'recording'
      : 'idle'

  useEffect(() => {
    setAnswer('')
    setError(null)
    resetRecording()
  }, [currentQuestionIndex, resetRecording])

  useEffect(() => {
    if (phase === 'feedback') {
      setFeedbackAcknowledged(false)
    }
  }, [phase, currentQuestionIndex])

  const handleStopRecording = useCallback(async () => {
    const finalText = await speech.stopRecording()
    setAnswer(finalText)
  }, [speech])

  const submitAnswer = useCallback(
    async (answerText: string) => {
      const trimmed = answerText.trim()
      if (!currentQuestion || !trimmed || isSubmitting || speech.isBusy) return

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
    [config, currentQuestion, currentQuestionIndex, history, isSubmitting, onUpdate, session, speech.isBusy],
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

  const controlsDisabled = isSubmitting || phase === 'evaluating' || speech.isBusy

  return (
    <div className="min-h-screen bg-gray-50">
      {phase === 'evaluating' && <InterviewEvaluatingScreen />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pt-3 pb-44 sm:px-6 sm:pt-6 sm:pb-40"
      >
        <header className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-500">{config.fullName}</p>
            <p className="truncate text-xs text-gray-400">{config.topic}</p>
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
          className="mb-4 rounded-2xl border border-gray-200 bg-white p-4"
          aria-label="Interview progress"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">
              Question {Math.min(currentQuestionIndex + 1, total)} / {total}
            </p>
            <p className="text-xs tabular-nums text-gray-500">{formatTime(elapsed)}</p>
          </div>
          <ProgressBar percentage={progress} className="h-2.5" />
        </section>

        {phase === 'feedback' && lastEvaluation && (
          <section className="space-y-4 pb-4" aria-label="Feedback">
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-base font-semibold text-green-800">Feedback ready</p>
              <p className="mt-1 text-sm leading-relaxed text-green-700">
                Review the evaluation below, then continue.
              </p>
            </div>
            <InterviewFeedbackSections evaluation={lastEvaluation} />
          </section>
        )}

        {phase === 'answering' && currentQuestion && (
          <>
            <section
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 sm:mb-5 sm:p-6"
              aria-label="Interview question"
            >
              {currentQuestion.contextualIntro && (
                <p className="mb-3 text-sm italic leading-relaxed text-blue-600 sm:text-base">
                  {currentQuestion.contextualIntro}
                </p>
              )}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {currentQuestion.subtopic}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <h1 className="text-lg font-bold leading-snug text-gray-900 sm:text-2xl">
                {currentQuestion.question}
              </h1>
            </section>

            <section className="flex-1" aria-label="Answer">
              <InterviewAnswerInput
                speech={speech}
                value={answer}
                onChange={setAnswer}
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-3 text-sm text-red-600" role="alert">
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
          speechState={phase === 'answering' ? speechState : 'idle'}
          hasAnswer={Boolean(answer.trim())}
          disabled={controlsDisabled}
          feedbackAcknowledged={feedbackAcknowledged}
          isLastQuestion={isLastQuestion}
          onSubmit={handleSubmit}
          onStopRecording={() => void handleStopRecording()}
          onContinue={handleNext}
          onAcknowledgeFeedback={() => setFeedbackAcknowledged(true)}
        />
      )}
    </div>
  )
}
