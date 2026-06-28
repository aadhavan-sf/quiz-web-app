export function isSpeechDevRoute(): boolean {
  if (!import.meta.env.DEV) return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('dev') === 'speech') return true

  return window.location.pathname.replace(/\/+$/, '').endsWith('/dev/speech')
}
