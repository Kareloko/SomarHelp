'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PipelineProgress } from '@/components/pipeline-progress'
import { MobileNav } from '@/components/mobile-nav'
import { getProject, deleteProject } from '@/lib/storage'
import { PipelineStep, StoredProject } from '@/types'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<StoredProject | null>(null)

  useEffect(() => {
    setProject(getProject(projectId))
  }, [projectId])

  const handleDelete = () => {
    if (!confirm('¿Eliminar este proyecto y todo su contenido?')) return
    deleteProject(projectId)
    router.push('/')
  }

  const completedSteps: PipelineStep[] = []
  if (project?.research) completedSteps.push('research')
  if (project?.posts && project.posts.length > 0) completedSteps.push('generate')
  if (project?.evaluations && project.evaluations.length > 0) completedSteps.push('evaluate')
  if (project?.campaign) completedSteps.push('campaign')
  if (project?.launches && project.launches.length > 0) completedSteps.push('launch')

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/"
              className="text-text-muted hover:text-text-secondary text-xs font-sans transition-colors"
            >
              ← Inicio
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/somarhelp-icon.svg"
                alt="SomarHelp"
                className="w-7 h-7 md:w-8 md:h-8 rounded-md"
              />
              <span className="font-serif text-lg md:text-xl text-text tracking-tight hidden sm:inline">
                Somar<span className="text-amber">Help</span>
              </span>
            </Link>
          </div>
          {project && (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-text-secondary text-xs md:text-sm font-sans hidden sm:inline">Sector:</span>
              <span className="text-amber text-xs md:text-sm font-semibold font-sans truncate max-w-[150px] md:max-w-none">{project.sector}</span>
              <button
                onClick={handleDelete}
                className="text-text-muted hover:text-alert text-xs font-sans transition-colors ml-2"
                title="Eliminar proyecto"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Pipeline progress — desktop only */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <PipelineProgress projectId={projectId} completedSteps={completedSteps} />
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav projectId={projectId} completedSteps={completedSteps} />
    </div>
  )
}
