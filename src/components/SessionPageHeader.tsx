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
}

export function SessionPageHeader({
  topic,
  assessmentLabel,
  userName,
  avatarUrl,
  leaveButton,
  remainingSeconds,
  hasLimit,
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

      <div className="ml-auto flex min-w-0 items-center gap-2.5 pl-2 sm:pl-4">
        <UserAvatar name={userName} avatarUrl={avatarUrl} size="md" />
        <span className="max-w-[8rem] truncate text-sm font-semibold text-gray-900 sm:max-w-[10rem] sm:text-base">
          {userName}
        </span>
      </div>
    </header>
  )
}
