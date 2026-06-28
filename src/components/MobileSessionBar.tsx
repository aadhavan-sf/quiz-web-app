import { motion } from 'framer-motion'

interface MobileSessionBarAction {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

interface MobileSessionBarProps {
  primary?: MobileSessionBarAction
  secondary?: MobileSessionBarAction
}

export function MobileSessionBar({ primary, secondary }: MobileSessionBarProps) {
  if (!primary && !secondary) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        {secondary && (
          <motion.button
            type="button"
            onClick={secondary.onClick}
            disabled={secondary.disabled}
            whileTap={secondary.disabled ? undefined : { scale: 0.98 }}
            className="flex min-h-14 w-full touch-manipulation items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {secondary.label}
          </motion.button>
        )}
        {primary && (
          <motion.button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled}
            whileTap={primary.disabled ? undefined : { scale: 0.98 }}
            className={`flex min-h-14 w-full touch-manipulation items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
              primary.variant === 'secondary'
                ? 'border border-gray-200 bg-white text-gray-800'
                : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-300'
            }`}
          >
            {primary.label}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export function mobileSessionBarPadding(active: boolean): string {
  return active ? 'pb-36 sm:pb-6' : ''
}
