import { motion } from 'framer-motion'
import { useState } from 'react'

interface HomePageProps {
  onStart: (name: string) => void
}

export function HomePage({ onStart }: HomePageProps) {
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const canStart = trimmed.length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canStart) onStart(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25">
            📊
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Power BI Interview Quiz
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Practice 100 real interview questions and instantly learn from every answer.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-required="true"
          />

          <motion.button
            type="submit"
            disabled={!canStart}
            whileHover={canStart ? { scale: 1.02 } : undefined}
            whileTap={canStart ? { scale: 0.98 } : undefined}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            Start Quiz
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  )
}
