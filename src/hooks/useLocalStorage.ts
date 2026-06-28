import { useCallback, useEffect, useState } from 'react'

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

export function usePracticeTimer(startTime: number | null, timeLimitMinutes?: number | null) {
  const elapsedSeconds = useTimer(true, startTime)
  const hasLimit = timeLimitMinutes != null && timeLimitMinutes > 0
  const limitSeconds = hasLimit ? (timeLimitMinutes as number) * 60 : null
  const remainingSeconds =
    limitSeconds !== null ? Math.max(0, limitSeconds - elapsedSeconds) : null
  const isExpired = limitSeconds !== null && elapsedSeconds >= limitSeconds

  return { elapsedSeconds, remainingSeconds, isExpired, hasLimit, limitSeconds }
}
