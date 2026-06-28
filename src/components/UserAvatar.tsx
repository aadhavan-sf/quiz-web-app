import { useState } from 'react'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
} as const

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: keyof typeof sizeClasses
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const sizeClass = sizeClasses[size]

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-2 ring-white`}
    >
      {initialsFromName(name || '?')}
    </div>
  )
}
