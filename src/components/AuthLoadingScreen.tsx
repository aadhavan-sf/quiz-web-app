import { motion } from 'framer-motion'
import { BrandLogo } from './BrandLogo'

export function AuthLoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center px-4"
    >
      <BrandLogo size="lg" className="mb-8" />
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-600 border-t-transparent" />
      <p className="mt-4 text-sm text-gray-500">Loading…</p>
    </motion.div>
  )
}
