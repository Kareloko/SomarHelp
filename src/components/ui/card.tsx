interface CardProps {
  children: React.ReactNode
  interactive?: boolean
  className?: string
  onClick?: () => void
}

export function Card({ children, interactive = false, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        ${interactive ? 'card-interactive' : 'card-base'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
