import { useState } from 'react'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
} as const

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: keyof typeof sizeClasses | 'stretch'
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

function AvatarContent({
  name,
  avatarUrl,
  imgClassName,
  fallbackClassName,
}: {
  name: string
  avatarUrl?: string | null
  imgClassName: string
  fallbackClassName: string
}) {
  const [imageFailed, setImageFailed] = useState(false)

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={imgClassName}
      />
    )
  }

  return (
    <div aria-hidden className={fallbackClassName}>
      {initialsFromName(name || '?')}
    </div>
  )
}

export function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  if (size === 'stretch') {
    return (
      <AvatarContent
        name={name}
        avatarUrl={avatarUrl}
        imgClassName="h-full w-auto min-w-[4.5rem] aspect-square shrink-0 rounded-full object-cover ring-2 ring-white sm:min-w-[5rem]"
        fallbackClassName="flex h-full w-auto min-w-[4.5rem] aspect-square shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 ring-2 ring-white sm:min-w-[5rem]"
      />
    )
  }

  const sizeClass = sizeClasses[size]
  return (
    <AvatarContent
      name={name}
      avatarUrl={avatarUrl}
      imgClassName={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white`}
      fallbackClassName={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-2 ring-white`}
    />
  )
}
