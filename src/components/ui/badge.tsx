interface BadgeProps {
  children: React.ReactNode
  variant?: 'amber' | 'blue' | 'green' | 'red' | 'gray'
  className?: string
}

const badgeVariants = {
  amber: 'bg-amber/15 text-amber-300 border-amber/25',
  blue: 'bg-blue-deep/15 text-blue-400 border-blue-deep/25',
  green: 'bg-success/15 text-emerald-400 border-success/25',
  red: 'bg-alert/15 text-red-400 border-alert/25',
  gray: 'bg-white/[0.04] text-text-secondary border-border',
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`badge ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  )
}
