import { motion } from 'framer-motion'
import { UserAvatar } from '../components/UserAvatar'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchCompletedSessions } from '../services/sessionService'
import type { QuizResults, StoredPracticeSession } from '../types/question'
import { formatTime, getOptionLabel } from '../utils/quizUtils'

interface ProfilePageProps {
  onBack: () => void
  onViewCompletedTest: (session: StoredPracticeSession) => void
}

export function ProfilePage({ onBack, onViewCompletedTest }: ProfilePageProps) {
  const { user, displayName, avatarUrl, signOut, isConfigured } = useAuth()
  const [sessions, setSessions] = useState<StoredPracticeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchCompletedSessions(user.id)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
      .finally(() => setLoading(false))
  }, [user])

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-gray-600">Sign-in is not configured.</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-gray-600">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back
        </button>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-stretch gap-4">
            <UserAvatar name={displayName} avatarUrl={avatarUrl} size="stretch" />
            <div className="flex flex-col justify-center">
              <p className="text-sm text-gray-500">Profile</p>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{displayName}</h1>
              <p className="mt-1 text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Completed tests</h2>
          <p className="mt-1 text-sm text-gray-600">
            Only fully submitted tests appear here — abandoned sessions are not listed.
          </p>

          {loading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}
          {error && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && sessions.length === 0 && (
            <p className="mt-6 text-sm text-gray-500">No completed tests yet. Finish and submit a session to see it here.</p>
          )}

          <ul className="mt-6 space-y-3">
            {sessions.map((session) => {
              const config = session.config as { topic?: string; difficulty?: string; questionCount?: number }
              const results = session.results as QuizResults | null
              const score =
                results && session.mode === 'mcq'
                  ? `${results.percentage}%`
                  : results && session.mode === 'interview'
                    ? `${(results as { overallInterviewScore?: number }).overallInterviewScore ?? '—'}%`
                    : '—'

              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onViewCompletedTest(session)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {session.mode === 'mcq' ? 'MCQ' : 'Interview'} · {config.topic ?? 'Practice'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {config.difficulty} · {config.questionCount} questions
                        {session.completed_at &&
                          ` · ${new Date(session.completed_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-primary-600">{score}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </motion.div>
  )
}

interface CompletedTestReviewProps {
  session: StoredPracticeSession
  onBack: () => void
}

export function CompletedTestReview({ session, onBack }: CompletedTestReviewProps) {
  const results = session.results as QuizResults | null
  const state = session.state as import('../types/question').QuizState

  if (session.mode !== 'mcq' || !state?.questions) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-gray-600">Interview review coming soon.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-3xl lg:max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to profile
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Test review</h1>
        <p className="mt-1 text-sm text-gray-600">
          {(session.config as { topic?: string }).topic} · Score: {results?.percentage ?? '—'}%
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          {state.questions.map((question, index) => {
            const answer = state.answers[question.id]
            return (
              <article
                key={question.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-medium text-gray-500">Question {index + 1}</p>
                <h2 className="mt-1 font-semibold text-gray-900">{question.question}</h2>
                {answer ? (
                  <div className={`mt-3 rounded-xl p-3 ${answer.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-sm font-medium ${answer.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      Your answer: {getOptionLabel(answer.selectedAnswer)} —{' '}
                      {question.options[answer.selectedAnswer]}
                    </p>
                    {!answer.isCorrect && (
                      <p className="mt-1 text-sm text-red-700">
                        Correct: {getOptionLabel(question.correctAnswer)} —{' '}
                        {question.options[question.correctAnswer]}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-700">{question.explanation}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Not answered</p>
                )}
              </article>
            )
          })}
        </div>

        {results && (
          <p className="mt-8 text-center text-sm text-gray-600">
            Time taken: {formatTime(results.elapsedSeconds)}
          </p>
        )}
      </div>
    </motion.div>
  )
}