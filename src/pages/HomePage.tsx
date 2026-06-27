import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  DIFFICULTY_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  type Difficulty,
  type GenerateQuestionsRequest,
  type PracticeMode,
  type QuestionCount,
} from '../types/question'
import { fetchHealth } from '../utils/api'

interface HomePageProps {
  mode: PracticeMode
  onBack: () => void
  onGenerate: (request: GenerateQuestionsRequest) => void
}

const TOPIC_EXAMPLES = [
  'Power BI',
  'React',
  'JavaScript',
  'SQL',
  'Python',
  'AWS',
  'Docker',
  'System Design',
  'Figma',
  'UI Design',
]

function isGitHubPagesHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.endsWith('github.io')
}

function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

function isRenderHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.endsWith('.onrender.com')
}

function aiSetupHint(
  onGitHubPages: boolean,
  onLocalDev: boolean,
  onRender: boolean,
): string {
  if (onGitHubPages) {
    return 'AI server is not on GitHub Pages — use your Render URL instead.'
  }
  if (onRender) {
    return 'Add GROQ_API_KEY in Render Dashboard → Environment, then redeploy.'
  }
  if (onLocalDev) {
    return 'Add GROQ_API_KEY to .env and restart npm run dev.'
  }
  return 'AI key not configured on the server.'
}

export function HomePage({ mode, onBack, onGenerate }: HomePageProps) {
  const [fullName, setFullName] = useState('')
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(50)
  const [difficulty, setDifficulty] = useState<Difficulty>('Mixed')
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    fetchHealth()
      .then((health) => setAiConfigured(health.aiConfigured))
      .catch(() => setAiConfigured(false))
  }, [])

  const formComplete = fullName.trim().length >= 2 && topic.trim().length >= 2
  const canGenerate = formComplete

  const onGitHubPages = isGitHubPagesHost()
  const onLocalDev = isLocalDevHost()
  const onRender = isRenderHost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canGenerate) return
    onGenerate({
      fullName: fullName.trim(),
      topic: topic.trim(),
      difficulty,
      questionCount,
      mode,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to mode selection
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {mode === 'mcq' ? '☑️ MCQ Practice' : '💬 Interview Practice'}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Configure Session
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
            {mode === 'mcq'
              ? 'Set up your multiple-choice practice session.'
              : 'Set up your AI interviewer session. Questions are generated for your exact topic, difficulty, and count.'}
          </p>
        </motion.div>

        {aiConfigured === false && onLocalDev && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="font-semibold">Free AI key required (Groq)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Create a free key at{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  console.groq.com/keys
                </a>{' '}
                (no credit card)
              </li>
              <li>
                Open <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env</code> in the{' '}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">power-bi-interview-quiz</code>{' '}
                folder and set{' '}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">GROQ_API_KEY=gsk_...</code>
              </li>
              <li>
                Restart the dev server:{' '}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npm run dev</code>
              </li>
            </ol>
          </motion.div>
        )}

        {aiConfigured === false && onRender && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="font-semibold">Groq API key missing on Render</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Open your service on{' '}
                <a
                  href="https://dashboard.render.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  dashboard.render.com
                </a>
              </li>
              <li>
                Go to <strong>Environment</strong> in the left sidebar
              </li>
              <li>
                Add <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">AI_PROVIDER</code>{' '}
                = <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">groq</code>
              </li>
              <li>
                Add <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">GROQ_API_KEY</code>{' '}
                = your key from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  console.groq.com/keys
                </a>
              </li>
              <li>
                Click <strong>Save Changes</strong> — Render redeploys automatically
              </li>
            </ol>
            <p className="mt-2 text-xs">Visitors do not need their own key — only you set this once.</p>
          </motion.div>
        )}

        {aiConfigured === false && onGitHubPages && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="font-semibold">AI server not connected</p>
            <p className="mt-2">
              GitHub Pages only hosts the website files — it cannot run the AI backend. To start
              interviews, use the app on{' '}
              <strong>Render</strong> (recommended) or run{' '}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npm run dev</code> on
              your computer.
            </p>
            <p className="mt-2">
              Deploy to Render, add <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">GROQ_API_KEY</code>{' '}
              in Environment settings, then share that URL with users — they do not need their own API
              key.
            </p>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:space-y-8 sm:p-10"
        >
          <div className="space-y-3">
            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className="input-field"
              aria-required="true"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Interview Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Power BI, React, System Design"
              className="input-field"
              aria-required="true"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {TOPIC_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setTopic(example)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    topic === example
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300'
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
            {topic.trim() && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI will generate questions for: <span className="font-medium text-gray-700 dark:text-gray-300">{topic.trim()}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Questions
            </label>
            <select
              id="question-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value) as QuestionCount)}
              className="input-field select-field"
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-4">
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Difficulty
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DIFFICULTY_OPTIONS.map((level) => (
                <label
                  key={level}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    difficulty === level
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={() => setDifficulty(level)}
                    className="sr-only"
                  />
                  {level}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={!canGenerate}
              whileHover={canGenerate ? { scale: 1.02 } : undefined}
              whileTap={canGenerate ? { scale: 0.98 } : undefined}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:disabled:bg-gray-700"
            >
              {mode === 'mcq' ? 'Generate Questions' : 'Start Interview'}
            </motion.button>
            {formComplete && aiConfigured === false && (
              <p className="mt-3 text-center text-sm text-amber-700 dark:text-amber-300">
                {aiSetupHint(onGitHubPages, onLocalDev, onRender)}
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}
