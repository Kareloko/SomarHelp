'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PipelineStep } from '@/types'

const steps: { key: PipelineStep; label: string; icon: string }[] = [
  { key: 'research', label: 'Research', icon: '🔍' },
  { key: 'generate', label: 'Generar', icon: '✍️' },
  { key: 'evaluate', label: 'Evaluar', icon: '🔥' },
  { key: 'campaign', label: 'Campaña', icon: '📅' },
  { key: 'export', label: 'Exportar', icon: '📤' },
  { key: 'launch', label: 'Launch', icon: '🚀' },
]

interface MobileNavProps {
  projectId: string
  completedSteps?: PipelineStep[]
}

export function MobileNav({ projectId, completedSteps = [] }: MobileNavProps) {
  const pathname = usePathname()

  const getCurrentStep = (): PipelineStep | null => {
    for (const step of steps) {
      if (pathname?.includes(`/${step.key}`)) return step.key
    }
    return null
  }

  const currentStep = getCurrentStep()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border">
      <div className="flex items-center justify-around px-1 py-2 safe-bottom">
        {steps.map(step => {
          const isActive = step.key === currentStep
          const isCompleted = completedSteps.includes(step.key)

          return (
            <Link
              key={step.key}
              href={`/project/${projectId}/${step.key}`}
              className={`
                flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0
                ${isActive
                  ? 'text-amber'
                  : isCompleted
                    ? 'text-amber/60'
                    : 'text-text-muted'
                }
              `}
            >
              <span className="text-base">{isCompleted && !isActive ? '✓' : step.icon}</span>
              <span className="text-[10px] font-sans truncate">{step.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
