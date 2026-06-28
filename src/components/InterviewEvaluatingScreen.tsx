import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reviewing your answer…',
  'Analyzing technical accuracy…',
  'Preparing interview feedback…',
]

export function InterviewEvaluatingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-[3px] border-primary-600 border-t-transparent" />
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-medium text-gray-900"
          >
            {MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="mt-3 text-sm text-gray-500">Please wait while the AI evaluates your response.</p>
      </div>
    </div>
  )
}
