interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 max-w-[8.5rem]',
  md: 'h-10 max-w-[10.5rem] sm:h-11',
  lg: 'h-12 max-w-[13rem] sm:h-14',
}

export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  return (
    <img
      src="/assessly-logo.png"
      alt="Assessly"
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  )
}
