'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { StoredProject, ResearchData, FUNNEL_COLORS, ENGAGEMENT_COLORS } from '@/types'
import { getProject, saveProject } from '@/lib/storage'

export default function ResearchPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<StoredProject | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = getProject(projectId)
    if (p) setProject(p)
  }, [projectId])

  const runResearch = async () => {
    if (!project) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: project.sector,
          productContext: project.brandContext?.productContext || '',
          specificTopics: project.brandContext?.specificTopics || '',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error en la investigación')
      }

      const data: ResearchData = await res.json()
      data.sector = project.sector

      const updated = { ...project, research: data }
      saveProject(updated)
      setProject(updated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const research = project?.research

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Research</h1>
          <p className="text-text-secondary text-sm md:text-base font-sans">
            Investigación de tendencias y oportunidades en <span className="text-amber">{project?.sector}</span>
          </p>
        </div>
        <Button onClick={runResearch} loading={loading} size="lg" className="w-full sm:w-auto">
          {research ? 'Reinvestigar' : 'Iniciar Research'}
        </Button>
      </div>

      {project?.brandContext?.productContext && (
        <Card className="border-amber/10 bg-amber/[0.03]">
          <p className="text-xs text-text-muted font-sans mb-1">Contexto de marca</p>
          <p className="text-sm text-text-secondary font-sans leading-relaxed">{project.brandContext.productContext}</p>
          {project.brandContext.specificTopics && (
            <>
              <p className="text-xs text-text-muted font-sans mt-3 mb-1">Temas específicos</p>
              <p className="text-sm text-text-secondary font-sans">{project.brandContext.specificTopics}</p>
            </>
          )}
        </Card>
      )}

      {error && (
        <Card className="border-alert/30 bg-alert/5">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-sans">Investigando el sector...</p>
        </div>
      )}

      {research && !loading && (
        <div className="space-y-16 animate-fade-in">
          {/* Stats */}
          <section>
            <h2 className="section-title mb-6">Datos del sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {research.stats.map((stat, i) => (
                <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <Card>
                    <p className="stat-number mb-2">{stat.value}</p>
                    <p className="text-sm text-text font-sans mb-1">{stat.label}</p>
                    <p className="text-xs text-text-muted">{stat.source}</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* Trends */}
          <section>
            <h2 className="section-title mb-6">Tendencias detectadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {research.trends.map((trend, i) => {
                const relevanceVariant = trend.relevance === 'alta' ? 'green' : trend.relevance === 'media' ? 'amber' : 'gray'
                return (
                  <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <Card>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-serif text-lg text-text leading-tight">{trend.title}</h3>
                        <Badge variant={relevanceVariant}>{trend.relevance}</Badge>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed mb-3">{trend.description}</p>
                      <p className="text-xs text-text-muted">{trend.source}</p>
                    </Card>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Opportunities */}
          <section>
            <h2 className="section-title mb-6">Oportunidades de contenido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {research.opportunities.map((opp, i) => {
                const funnelClass = FUNNEL_COLORS[opp.funnel]
                const engagementClass = ENGAGEMENT_COLORS[opp.engagement]

                return (
                  <div key={opp.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <Card className="flex flex-col">
                      <div className="flex items-start gap-2 mb-3">
                        <span className={`badge ${funnelClass}`}>{opp.funnel}</span>
                        <span className={`text-xs font-medium ${engagementClass}`}>
                          Engagement {opp.engagement}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg text-text mb-2">{opp.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-2 flex-1">
                        {opp.description}
                      </p>
                      <p className="text-xs text-text-muted mb-4">
                        Ángulo: {opp.angle}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const searchParams = new URLSearchParams({
                            topic: opp.title,
                            angle: opp.angle,
                            funnel: opp.funnel,
                          })
                          router.push(`/project/${projectId}/generate?${searchParams.toString()}`)
                        }}
                      >
                        Generar Posts
                      </Button>
                    </Card>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
