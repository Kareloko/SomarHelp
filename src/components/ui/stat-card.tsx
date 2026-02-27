import { Card } from './card'

interface StatCardProps {
  label: string
  value: string | number
  className?: string
}

export function StatCard({ label, value, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <p className="text-text-secondary text-xs uppercase tracking-wider mb-2 font-sans">{label}</p>
      <p className="stat-number">{value}</p>
    </Card>
  )
}
