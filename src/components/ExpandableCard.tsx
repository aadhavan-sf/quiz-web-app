import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'

interface ExpandableCardProps {
  title: string
  summary?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function ExpandableCard({ title, summary, defaultOpen = false, children }: ExpandableCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-gray-900">{title}</p>
          {summary && !open && (
            <p className="mt-0.5 truncate text-sm text-gray-500">{summary}</p>
          )}
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-600"
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 pb-4 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
