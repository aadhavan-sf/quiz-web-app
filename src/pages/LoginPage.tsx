import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../context/AuthContext'
import { consumeAuthCallbackError, formatAuthError } from '../utils/authErrors'

interface LoginPageProps {
  onBack?: () => void
  onSuccess: () => void
  /** When true, login is the app entry point — no back navigation. */
  isGate?: boolean
}

export function LoginPage({ onBack, onSuccess, isGate = false }: LoginPageProps) {
  const { isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const callbackError = consumeAuthCallbackError()
    if (callbackError) setError(callbackError)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'sign-up') {
        if (fullName.trim().length < 2) {
          setError('Enter your full name.')
          return
        }
        await signUpWithEmail(email.trim(), password, fullName.trim())
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('sign-in')
      } else {
        await signInWithEmail(email.trim(), password)
        onSuccess()
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(formatAuthError(err))
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <BrandLogo size="md" className="mx-auto" />
          <h1 className="mt-6 text-lg font-bold text-gray-900">Sign-in not configured</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            To enable Google and email login, add these to your{' '}
            <code className="rounded bg-gray-100 px-1">.env</code> file:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-50 p-3 text-left text-xs text-gray-800">
{`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_key`}
          </pre>
          <p className="mt-3 text-xs text-gray-500">
            Then run <code className="rounded bg-gray-100 px-1">supabase/schema.sql</code> in your
            Supabase SQL editor and enable Google + Email under Authentication → Providers.
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="mt-6 w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Continue in local dev mode
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        {!isGate && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back
          </button>
        )}

        <div className="mb-8 flex justify-center">
          <BrandLogo size="lg" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">
            {mode === 'sign-in' ? 'Sign in to Assessly' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isGate
              ? 'Sign in to choose your assessment type and start practicing.'
              : 'Save progress, resume sessions, and review completed tests.'}
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="text-lg" aria-hidden="true">
              G
            </span>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'sign-up' && (
              <div>
                <label htmlFor="login-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in with email' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            {mode === 'sign-in' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => setMode('sign-up')}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('sign-in')}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
