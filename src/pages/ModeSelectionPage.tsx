import { motion } from 'framer-motion'
import type { PracticeMode } from '../types/question'

interface ModeSelectionPageProps {
  onSelect: (mode: PracticeMode) => void
}

const MODES = [
  {
    id: 'mcq' as const,
    icon: '☑️',
    title: 'MCQ Practice',
    subtitle: 'Best for learning concepts quickly',
    description:
      'AI generates multiple-choice questions with four options, instant feedback, and detailed explanations after each answer.',
    features: ['Four options per question', 'Instant correct/incorrect feedback', 'Detailed explanations'],
  },
  {
    id: 'interview' as const,
    icon: '💬',
    title: 'Interview Practice',
    subtitle: 'Best for preparing for real interviews',
    description:
      'AI acts as a senior interviewer with open-ended questions. Type your answer and receive detailed evaluation with an ideal model answer.',
    features: ['Topic-specific open-ended questions', 'Type your answer', 'AI evaluation, corrections & ideal answer'],
  },
]

export function ModeSelectionPage({ onSelect }: ModeSelectionPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25">
            ✨
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            AI Interview Practice
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Choose how you want to practice before generating your session.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {MODES.map((mode, index) => (
            <motion.button
              key={mode.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(mode.id)}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-7 text-left shadow-sm transition-shadow hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
            >
              <span className="mb-4 text-3xl">{mode.icon}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{mode.title}</h2>
              <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{mode.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {mode.description}
              </p>
              <ul className="mt-5 space-y-2">
                {mode.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <span className="mt-6 text-sm font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                Select {mode.title} →
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
