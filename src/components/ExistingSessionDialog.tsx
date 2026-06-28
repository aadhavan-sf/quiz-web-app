import { motion } from 'framer-motion'
import type { PracticeMode } from '../types/question'
import { assessmentLabel } from '../utils/sessionProgress'

interface ExistingSessionDialogProps {
  mode: PracticeMode
  topic: string
  completed: number
  total: number
  remaining: number
  onContinue: () => void
  onStartNew: () => void
  onCancel: () => void
  isReplacing?: boolean
}

export function ExistingSessionDialog({
  mode,
  topic,
  completed,
  total,
  remaining,
  onContinue,
  onStartNew,
  onCancel,
  isReplacing = false,
}: ExistingSessionDialogProps) {
  const typeLabel = assessmentLabel(mode)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="existing-session-title"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="existing-session-title" className="text-lg font-bold text-gray-900">
          Continue your session?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          You already started a {typeLabel} session on{' '}
          <span className="font-semibold text-gray-900">{topic}</span>.
        </p>

        <div className="mt-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-950">
          <p>
            <span className="font-semibold">{completed}</span> of{' '}
            <span className="font-semibold">{total}</span> questions completed
          </p>
          <p className="mt-1">
            <span className="font-semibold">{remaining}</span> remaining
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Would you like to continue where you left off, or start a new session? Starting new will
          remove the unfinished session.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onContinue}
            disabled={isReplacing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Continue session
          </button>
          <button
            type="button"
            onClick={onStartNew}
            disabled={isReplacing}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {isReplacing ? 'Starting new…' : 'Start new session'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isReplacing}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-60 sm:ml-auto"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}
