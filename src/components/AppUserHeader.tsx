import { UserAvatar } from './UserAvatar'
import { useAuth } from '../context/AuthContext'

interface AppUserHeaderProps {
  onProfile: () => void
}

export function AppUserHeader({ onProfile }: AppUserHeaderProps) {
  const { user, displayName, avatarUrl } = useAuth()

  if (!user) return null

  return (
    <button
      type="button"
      onClick={onProfile}
      className="flex min-w-0 items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 shadow-sm transition-colors hover:bg-gray-50 sm:pr-4"
      title={`${displayName} — View profile`}
      aria-label={`${displayName}, view profile`}
    >
      <UserAvatar name={displayName} avatarUrl={avatarUrl} size="md" />
      <span className="hidden max-w-[120px] truncate text-sm font-semibold text-gray-900 sm:inline sm:max-w-[180px]">
        {displayName}
      </span>
    </button>
  )
}
