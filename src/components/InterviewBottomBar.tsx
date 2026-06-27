import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface InterviewBottomBarProps {
  mode: 'answering' | 'feedback'
  hasAnswer: boolean
  disabled: boolean
  feedbackAcknowledged: boolean
  isLastQuestion: boolean
  onSubmit: () => void
  onContinue: () => void
  onAcknowledgeFeedback: () => void
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
  variant?: 'primary' | 'secondary'
  className?: string
  ariaLabel?: string
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700',
    secondary:
      'border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
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
      className={`flex min-h-12 w-full items-center justify-center rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function InterviewBottomBar({
  mode,
  hasAnswer,
  disabled,
  feedbackAcknowledged,
  isLastQuestion,
  onSubmit,
  onContinue,
  onAcknowledgeFeedback,
}: InterviewBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto max-w-lg">
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
              {isLastQuestion ? 'View Interview Report' : 'Next Question'}
            </ActionButton>
          )
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
