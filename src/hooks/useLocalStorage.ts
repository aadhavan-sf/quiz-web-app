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
