import { useEffect, useState } from 'react'

const DEFAULT_DURATION_MS = 60_000

/** Shows speech tips once per session, then hides after `durationMs`. */
export function useTimedSpeechTips(durationMs = DEFAULT_DURATION_MS): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), durationMs)
    return () => clearTimeout(timer)
  }, [durationMs])

  return visible
}
