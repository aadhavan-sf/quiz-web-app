import { SpeechAnswerControls } from '../../components/SpeechAnswerControls'
import { useState } from 'react'

const MOCK_QUESTION =
  'Can you explain the difference between Import Mode and DirectQuery in Power BI? When would you choose each one?'

export function SpeechTestPage() {
  const [answer, setAnswer] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Dev only</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Speech-to-text test</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Uses <strong>server-side Groq Whisper</strong> (not the browser speech API — that fails
            in Dia with network errors). Tap Record, speak, tap Stop. Requires{' '}
            <code className="rounded bg-white px-1">npm run dev</code> and{' '}
            <code className="rounded bg-white px-1">GROQ_API_KEY</code> in .env.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            URL: <code className="rounded bg-white px-1">/?dev=speech</code> or{' '}
            <code className="rounded bg-white px-1">/dev/speech</code>
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sample question
          </p>
          <h2 className="text-lg font-semibold leading-snug text-gray-900">{MOCK_QUESTION}</h2>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-semibold text-gray-900">Your Answer</label>
          <SpeechAnswerControls
            value={answer}
            onChange={setAnswer}
            showDebug
            topic="Power BI"
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAnswer('')}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear answer
          </button>
          <a
            href="/"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to app
          </a>
        </div>
      </div>
    </div>
  )
}
