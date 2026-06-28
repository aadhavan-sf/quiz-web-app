import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export type InterviewBarSpeechState = 'idle' | 'recording' | 'transcribing'

interface InterviewBottomBarProps {
  mode: 'answering' | 'feedback'
  speechState?: InterviewBarSpeechState
  hasAnswer: boolean
  disabled: boolean
  feedbackAcknowledged: boolean
  isLastQuestion: boolean
  onSubmit: () => void
  onStopRecording: () => void
  onContinue: () => void
  onAcknowledgeFeedback: () => void
  continueLabel?: string
  showSkip?: boolean
  onSkip?: () => void
  skipDisabled?: boolean
  skipLabel?: string
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  ariaLabel,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  ariaLabel?: string
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-300',
    secondary: 'border border-gray-200 bg-white text-gray-800 active:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  }

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      aria-label={ariaLabel}
      className={`flex min-h-14 w-full touch-manipulation items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:py-3.5 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function InterviewBottomBar({
  mode,
  speechState = 'idle',
  hasAnswer,
  disabled,
  feedbackAcknowledged,
  isLastQuestion,
  onSubmit,
  onStopRecording,
  onContinue,
  onAcknowledgeFeedback,
  continueLabel,
  showSkip = false,
  onSkip,
  skipDisabled = false,
  skipLabel = 'Skip for now',
}: InterviewBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        {showSkip && mode === 'answering' && speechState === 'idle' && onSkip && (
          <ActionButton
            onClick={onSkip}
            disabled={skipDisabled}
            variant="secondary"
            ariaLabel="Skip this question for now"
            className="sm:hidden"
          >
            {skipLabel}
          </ActionButton>
        )}
        {mode === 'feedback' ? (
          !feedbackAcknowledged ? (
            <ActionButton
              onClick={onAcknowledgeFeedback}
              variant="secondary"
              ariaLabel="Mark feedback as reviewed"
            >
              I&apos;ve Reviewed the Feedback
            </ActionButton>
          ) : (
            <ActionButton onClick={onContinue} variant="primary" ariaLabel="Continue to next question">
              {continueLabel ??
                (isLastQuestion ? 'View Interview Report' : 'Next Question')}
            </ActionButton>
          )
        ) : speechState === 'recording' ? (
          <ActionButton
            onClick={onStopRecording}
            variant="danger"
            ariaLabel="Stop recording"
          >
            Stop Recording
          </ActionButton>
        ) : speechState === 'transcribing' ? (
          <ActionButton onClick={() => {}} disabled variant="primary" ariaLabel="Transcribing">
            Transcribing…
          </ActionButton>
        ) : (
          <ActionButton
            onClick={onSubmit}
            disabled={disabled || !hasAnswer}
            variant="primary"
            ariaLabel="Submit answer for AI evaluation"
          >
            Submit Answer
          </ActionButton>
        )}
      </div>
    </div>
  )
}
