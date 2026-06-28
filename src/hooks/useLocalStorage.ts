import { useCallback, useEffect, useRef, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

export function usePersistedState<T>(key: string, initialValue: T) {
  return useLocalStorage(key, initialValue)
}

export function useTimer(isRunning: boolean, startTime: number | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning || startTime === null) return

    const update = () => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [isRunning, startTime])

  return elapsedSeconds
}

export function usePracticeTimer(
  activeSince: number | null,
  baseElapsedSeconds: number,
  timeLimitMinutes?: number | null,
) {
  const segmentSeconds = useTimer(true, activeSince)
  const elapsedSeconds = baseElapsedSeconds + segmentSeconds
  const hasLimit = timeLimitMinutes != null && timeLimitMinutes > 0
  const limitSeconds = hasLimit ? (timeLimitMinutes as number) * 60 : null
  const remainingSeconds =
    limitSeconds !== null ? Math.max(0, limitSeconds - elapsedSeconds) : null
  const isExpired = limitSeconds !== null && elapsedSeconds >= limitSeconds

  return { elapsedSeconds, remainingSeconds, isExpired, hasLimit, limitSeconds }
}

/** Drop corrupt elapsed values written before the double-count timer bug was fixed. */
export function normalizeSavedElapsed(
  saved: number | undefined,
  timeLimitMinutes?: number | null,
): number {
  if (saved == null || saved < 0) return 0
  const limitSeconds =
    timeLimitMinutes != null && timeLimitMinutes > 0 ? timeLimitMinutes * 60 : null
  const maxSane = limitSeconds != null ? limitSeconds + 120 : 6 * 60 * 60
  return saved > maxSane ? 0 : saved
}

/**
 * Timer for sessions that can be left and resumed. Saved elapsed is captured once
 * per session key; live ticks are added on top without feeding back into the base.
 */
export function useResumableSessionTimer(
  sessionKey: string | number | null | undefined,
  savedElapsedSeconds: number | undefined,
  timeLimitMinutes?: number | null,
) {
  const baseRef = useRef(0)
  const sinceRef = useRef(Date.now())
  const keyRef = useRef<typeof sessionKey>(undefined)

  if (sessionKey != null && sessionKey !== keyRef.current) {
    keyRef.current = sessionKey
    baseRef.current = normalizeSavedElapsed(savedElapsedSeconds, timeLimitMinutes)
    sinceRef.current = Date.now()
  }

  return usePracticeTimer(
    sessionKey != null ? sinceRef.current : null,
    baseRef.current,
    timeLimitMinutes,
  )
}
