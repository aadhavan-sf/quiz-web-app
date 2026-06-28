import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface LeaveSessionButtonProps {
  onConfirm: () => void
  label?: string
  message?: string
}

export function LeaveSessionButton({
  onConfirm,
  label = 'Leave',
  message = 'Are you sure you want to leave? Your progress so far will be saved and you will see your results.',
}: LeaveSessionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        aria-haspopup="dialog"
      >
        {label}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-dialog-title"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="leave-dialog-title" className="text-lg font-semibold text-gray-900">
                Leave session?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onConfirm()
                  }}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
