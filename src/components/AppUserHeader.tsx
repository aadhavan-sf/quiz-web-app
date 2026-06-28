import { UserAvatar } from './UserAvatar'
import { useAuth } from '../context/AuthContext'

interface AppUserHeaderProps {
  onProfile?: () => void
}

export function AppUserHeader({ onProfile }: AppUserHeaderProps) {
  const { user, displayName, avatarUrl, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <div
        className="flex min-w-0 items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 shadow-sm sm:pr-4"
        title={displayName}
      >
        <UserAvatar name={displayName} avatarUrl={avatarUrl} size="md" />
        <span className="max-w-[120px] truncate text-sm font-semibold text-gray-900 sm:max-w-[180px]">
          {displayName}
        </span>
      </div>
      {onProfile && (
        <button
          type="button"
          onClick={onProfile}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Profile
        </button>
      )}
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  )
}
