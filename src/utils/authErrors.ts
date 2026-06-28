/** Parse OAuth error params Supabase may append to the app URL after a failed redirect. */
export function consumeAuthCallbackError(): string | null {
  if (typeof window === 'undefined') return null

  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  const description =
    search.get('error_description') ?? hash.get('error_description') ?? search.get('error') ?? hash.get('error')

  if (!description) return null

  window.history.replaceState({}, '', window.location.pathname)

  const decoded = decodeURIComponent(description.replace(/\+/g, ' '))

  if (/provider is not enabled|unsupported provider/i.test(decoded)) {
    return 'Google sign-in is not enabled in Supabase yet. Open Authentication → Providers → Google, turn it on, and add your Google Client ID & Secret.'
  }

  return decoded
}

export function formatAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return 'Google sign-in is not enabled in Supabase yet. Open Authentication → Providers → Google, turn it on, and add your Google Client ID & Secret.'
  }

  return message || 'Authentication failed'
}
