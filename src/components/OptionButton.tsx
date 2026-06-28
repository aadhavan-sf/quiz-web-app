import { motion } from 'framer-motion'
import { getOptionLabel } from '../utils/quizUtils'

type OptionState = 'default' | 'selected-correct' | 'selected-wrong' | 'revealed-correct'

interface OptionButtonProps {
  label: string
  index: number
  state: OptionState
  disabled: boolean
  onSelect: () => void
}

const stateStyles: Record<OptionState, string> = {
  default:
    'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-gray-900',
  'selected-correct': 'border-green-500 bg-green-50 text-green-900',
  'selected-wrong': 'border-red-500 bg-red-50 text-red-900',
  'revealed-correct': 'border-green-500 bg-green-50 text-green-900',
}

export function OptionButton({ label, index, state, disabled, onSelect }: OptionButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm transition-colors sm:text-base ${
        stateStyles[state]
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      aria-label={`Option ${getOptionLabel(index)}: ${label}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          state === 'default'
            ? 'bg-gray-100 text-gray-600'
            : state === 'selected-wrong'
              ? 'bg-red-200 text-red-800'
              : 'bg-green-200 text-green-800'
        }`}
        aria-hidden="true"
      >
        {getOptionLabel(index)}
      </span>
      <span className="pt-0.5">{label}</span>
    </motion.button>
  )
}
