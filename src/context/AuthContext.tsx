import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type UserMetadata = {
  full_name?: string
  name?: string
  given_name?: string
  family_name?: string
  avatar_url?: string
  picture?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  isConfigured: boolean
  displayName: string
  avatarUrl: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function resolveDisplayName(user: User | null): string {
  if (!user) return ''
  const meta = user.user_metadata as UserMetadata | undefined
  const fromParts =
    meta?.given_name != null
      ? [meta.given_name, meta.family_name].filter(Boolean).join(' ')
      : ''
  const name = meta?.full_name ?? meta?.name ?? fromParts
  if (name) return name
  return user.email?.split('@')[0] ?? 'User'
}

function resolveAvatarUrl(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as UserMetadata | undefined
  const url = meta?.avatar_url ?? meta?.picture
  return typeof url === 'string' && url.length > 0 ? url : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Sign-in is not configured.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Sign-in is not configured.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) throw new Error('Sign-in is not configured.')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      displayName: resolveDisplayName(user),
      avatarUrl: resolveAvatarUrl(user),
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
