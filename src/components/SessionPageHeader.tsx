import type { ReactNode } from 'react'
import { SessionHeaderTimer } from './SessionHeaderTimer'
import { UserAvatar } from './UserAvatar'

interface SessionPageHeaderProps {
  userName: string
  avatarUrl?: string | null
  leaveButton: ReactNode
  elapsedSeconds: number
  remainingSeconds: number | null
  hasLimit: boolean
}

export function SessionPageHeader({
  userName,
  avatarUrl,
  leaveButton,
  elapsedSeconds,
  remainingSeconds,
  hasLimit,
}: SessionPageHeaderProps) {
  const timerProps = {
    elapsedSeconds,
    remainingSeconds,
    hasLimit,
  }

  return (
    <header className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:px-5 sm:py-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={userName} avatarUrl={avatarUrl} size="md" />
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">Hello</span>
            <span className="truncate text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {userName}
            </span>
          </div>
        </div>

        <SessionHeaderTimer className="justify-self-center" {...timerProps} />

        <div className="justify-self-end">{leaveButton}</div>
      </div>
    </header>
  )
}
