import type { ReactNode } from 'react'
import { SessionHeaderTimer } from './SessionHeaderTimer'
import { UserAvatar } from './UserAvatar'

interface SessionPageHeaderProps {
  topic: string
  assessmentLabel: string
  userName: string
  avatarUrl?: string | null
  leaveButton: ReactNode
  remainingSeconds: number | null
  hasLimit: boolean
  onProfile?: () => void
}

export function SessionPageHeader({
  topic,
  assessmentLabel,
  userName,
  avatarUrl,
  leaveButton,
  remainingSeconds,
  hasLimit,
  onProfile,
}: SessionPageHeaderProps) {
  const timerProps = {
    remainingSeconds,
    hasLimit,
  }

  return (
    <header className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-gray-900 sm:text-xl">{topic}</p>
        <p className="truncate text-sm text-gray-600">{assessmentLabel}</p>
      </div>

      <SessionHeaderTimer {...timerProps} />

      <div className="shrink-0">{leaveButton}</div>

      <div className="ml-auto shrink-0 pl-2 sm:pl-4">
        {onProfile ? (
          <button
            type="button"
            onClick={onProfile}
            className="rounded-full transition-shadow hover:ring-2 hover:ring-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="View profile"
            title="View profile"
          >
            <UserAvatar name={userName} avatarUrl={avatarUrl} size="md" />
          </button>
        ) : (
          <UserAvatar name={userName} avatarUrl={avatarUrl} size="md" />
        )}
      </div>
    </header>
  )
}
