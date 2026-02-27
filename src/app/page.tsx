'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { StoredProject } from '@/types'
import { getProjects, saveProject, deleteProject, getStats, clearAllData } from '@/lib/storage'

export default function HomePage() {
  const router = useRouter()
  const [sector, setSector] = useState('')
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [stats, setStats] = useState({ totalProjects: 0, totalPosts: 0, totalCampaigns: 0, avgFireScore: '—' })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setProjects(getProjects())
    setStats(getStats())
  }, [])

  const handleCreate = () => {
    if (!sector.trim()) return
    const project: StoredProject = {
      id: nanoid(10),
      sector: sector.trim(),
      createdAt: new Date().toISOString(),
      research: null,
      posts: [],
      evaluations: [],
      campaign: null,
    }
    saveProject(project)
    router.push(`/project/${project.id}/research`)
  }

  const handleDelete = (id: string) => {
    deleteProject(id)
    setProjects(getProjects())
    setStats(getStats())
  }

  const handleClearAll = () => {
    clearAllData()
    setProjects([])
    setStats({ totalProjects: 0, totalPosts: 0, totalCampaigns: 0, avgFireScore: '—' })
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/somarhelp-icon.svg"
              alt="SomarHelp"
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg"
            />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-text tracking-tight">
                Somar<span className="text-amber">Help</span>
              </h1>
              <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-sans">
                LinkedIn Content Automation — B2B
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-text-muted hover:text-text-secondary transition-colors text-sm font-sans"
          >
            Ajustes
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Settings panel */}
        {showSettings && (
          <div className="mb-8 md:mb-12 animate-fade-in">
            <Card className="border-alert/20">
              <h3 className="text-sm font-semibold text-text mb-3">Zona de peligro</h3>
              <p className="text-xs text-text-secondary mb-4">
                Eliminar todos los proyectos y datos guardados en este navegador.
              </p>
              <Button variant="danger" size="sm" onClick={handleClearAll}>
                Limpiar todos los datos
              </Button>
            </Card>
          </div>
        )}

        {/* Hero input */}
        <section className="mb-12 md:mb-20 animate-fade-up">
          <h2 className="font-serif text-3xl md:text-5xl text-text mb-3 md:mb-4 leading-tight">
            De una idea a un post<br />
            <span className="text-amber">listo para publicar.</span>
          </h2>
          <p className="text-text-secondary text-base md:text-lg mb-6 md:mb-10 max-w-xl font-sans">
            Ingresa tu sector o nicho y la IA ejecuta el pipeline completo:
            Research, Generación, Evaluación, Campaña y Exportación.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <Input
              placeholder="Ej: Ciberseguridad, Fintech, SaaS, Logística..."
              value={sector}
              onChange={e => setSector(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button size="lg" onClick={handleCreate} disabled={!sector.trim()} className="w-full sm:w-auto">
              Investigar
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12 md:mb-20 animate-fade-up stagger-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Proyectos" value={stats.totalProjects} />
            <StatCard label="Posts generados" value={stats.totalPosts} />
            <StatCard label="Campañas" value={stats.totalCampaigns} />
            <StatCard label="FIRE promedio" value={stats.avgFireScore} />
          </div>
        </section>

        {/* Projects list */}
        {projects.length > 0 && (
          <section className="animate-fade-up stagger-3">
            <h3 className="section-title mb-6">Proyectos anteriores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <Card interactive onClick={() => router.push(`/project/${project.id}/research`)}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-serif text-lg text-text">{project.sector}</h4>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleDelete(project.id)
                        }}
                        className="text-text-muted hover:text-alert text-xs transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="text-xs text-text-muted font-mono mb-3">
                      {new Date(project.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex gap-3 text-xs text-text-secondary font-sans">
                      <span>{project.posts.length} posts</span>
                      <span>{project.evaluations.length} evaluaciones</span>
                      {project.campaign && <span>1 campaña</span>}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
