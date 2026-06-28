import type { PracticeMode } from '../types/question'

interface GeneratingSkeletonProps {
  count: number
  mode?: PracticeMode
  loadingReport?: boolean
}

export function GeneratingSkeleton({
  count,
  mode = 'mcq',
  loadingReport = false,
}: GeneratingSkeletonProps) {
  const message = loadingReport
    ? 'Generating your complete interview report…'
    : mode === 'interview'
      ? `AI interviewer is preparing your ${count}-question session…`
      : `AI is researching your topic and generating ${count} questions…`

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12" aria-live="polite" aria-busy="true">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />

        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-gray-100"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">{message}</p>
    </div>
  )
}
