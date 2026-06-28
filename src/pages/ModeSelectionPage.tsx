import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { PracticeMode } from '../types/question'
import { BrandLogo } from '../components/BrandLogo'
import { AppUserHeader } from '../components/AppUserHeader'
import { useAuth } from '../context/AuthContext'
import {
  fetchInProgressSessions,
} from '../services/sessionService'
import type { StoredPracticeSession } from '../types/question'
import { getSessionProgress, sessionTopic } from '../utils/sessionProgress'

interface ModeSelectionPageProps {
  onSelect: (mode: PracticeMode) => void
  onProfile: () => void
  onResume: (session: StoredPracticeSession) => void
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
      'AI acts as a senior interviewer with open-ended questions. Record or type your answer and receive detailed evaluation with an ideal model answer.',
    features: ['Topic-specific open-ended questions', 'Voice or typed answers', 'AI evaluation, corrections & ideal answer'],
  },
] as const

export function ModeSelectionPage({ onSelect, onProfile, onResume }: ModeSelectionPageProps) {
  const { user } = useAuth()
  const [inProgress, setInProgress] = useState<StoredPracticeSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    if (!user) {
      setInProgress([])
      return
    }
    setLoadingSessions(true)
    fetchInProgressSessions(user.id)
      .then((sessions) =>
        setInProgress(
          [...sessions].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),
        ),
      )
      .catch(() => setInProgress([]))
      .finally(() => setLoadingSessions(false))
  }, [user])

  const pendingByMode = useMemo(() => {
    const map: Partial<Record<PracticeMode, StoredPracticeSession>> = {}
    for (const session of inProgress) {
      map[session.mode] = session
    }
    return map
  }, [inProgress])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      {user && (
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <AppUserHeader onProfile={onProfile} />
        </div>
      )}

      <div className="w-full max-w-3xl">
        {!user && (
          <div className="mb-6">
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Local dev mode — add Supabase keys to <code className="rounded bg-amber-100 px-1">.env</code> to enable sign-in
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-6 flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Choose how you want to practice before generating your session.
          </p>
        </motion.div>

        {loadingSessions && (
          <p className="mb-4 text-center text-sm text-gray-500">Checking for saved sessions…</p>
        )}

        {inProgress.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Resume a session</h2>
            <p className="text-xs text-gray-600">
              Pick a session to continue. Starting the same topic again will ask whether to
              continue or start fresh.
            </p>
            {inProgress.map((session) => {
              const { completed, total } = getSessionProgress(session)

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onResume(session)}
                  className="flex w-full items-center justify-between rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-left hover:border-primary-300"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {session.mode === 'mcq' ? 'MCQ' : 'Interview'} · {sessionTopic(session)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {completed} of {total} completed
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">Resume →</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {MODES.map((mode, index) => {
            const pending = pendingByMode[mode.id]

            return (
              <motion.button
                key={mode.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(mode.id)}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-7 text-left shadow-sm transition-shadow hover:border-primary-300 hover:shadow-md"
              >
                <span className="mb-4 text-3xl">{mode.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{mode.title}</h2>
                {pending ? (
                  <p className="mt-1 text-sm font-medium text-primary-700">
                    In progress · {sessionTopic(pending)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-medium text-primary-600">{mode.subtitle}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{mode.description}</p>
                <ul className="mt-5 space-y-2">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 text-sm font-semibold text-primary-600 group-hover:underline">
                  Select {mode.title} →
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
