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
]

interface PipelineProgressProps {
  projectId: string
  completedSteps?: PipelineStep[]
}

export function PipelineProgress({ projectId, completedSteps = [] }: PipelineProgressProps) {
  const pathname = usePathname()

  const getCurrentStep = (): PipelineStep | null => {
    for (const step of steps) {
      if (pathname?.includes(`/${step.key}`)) return step.key
    }
    return null
  }

  const currentStep = getCurrentStep()

  const getStepStatus = (step: PipelineStep) => {
    if (step === currentStep) return 'active'
    if (completedSteps.includes(step)) return 'completed'
    return 'pending'
  }

  return (
    <div className="w-full hidden lg:block">
      <div className="glass rounded-2xl px-3 py-3">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const status = getStepStatus(step.key)
            const isActive = status === 'active'
            const isCompleted = status === 'completed'

            return (
              <div key={step.key} className="flex items-center flex-1">
                <Link
                  href={`/project/${projectId}/${step.key}`}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-medium
                    transition-all duration-300 whitespace-nowrap
                    ${isActive
                      ? 'bg-amber text-[#08080D] shadow-deep'
                      : isCompleted
                        ? 'text-amber-300 border border-amber/30 bg-amber/5'
                        : 'text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                  <span>{step.label}</span>
                </Link>

                {i < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-px relative">
                    <div className="absolute inset-0 bg-border" />
                    {(isActive || isCompleted) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber/40 to-amber/10 transition-all duration-500" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
