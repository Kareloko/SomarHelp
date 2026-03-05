'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StoredProject, LaunchAd, AdPlatform, AdObjective, AdTone } from '@/types'
import { getProject, saveProject } from '@/lib/storage'

const PLATFORMS: { key: AdPlatform; label: string; icon: string; color: string }[] = [
  { key: 'facebook', label: 'Facebook', icon: '📘', color: 'border-[#1877f2] bg-[#1877f2]/10 text-[#1877f2]' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'border-[#0a66c2] bg-[#0a66c2]/10 text-[#0a66c2]' },
  { key: 'instagram', label: 'Instagram', icon: '📸', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
]

const OBJECTIVES: { key: AdObjective; label: string; description: string }[] = [
  { key: 'awareness', label: 'Awareness', description: 'Dar a conocer tu marca' },
  { key: 'conversion', label: 'Conversión', description: 'Generar ventas o registros' },
  { key: 'retargeting', label: 'Retargeting', description: 'Re-enganchar usuarios' },
]

const TONES: { key: AdTone; label: string; icon: string }[] = [
  { key: 'profesional', label: 'Profesional', icon: '🎩' },
  { key: 'urgente', label: 'Urgente', icon: '⚡' },
  { key: 'storytelling', label: 'Storytelling', icon: '📖' },
  { key: 'provocador', label: 'Provocador', icon: '🔥' },
]

function PlatformBadge({ platform }: { platform: string }) {
  const p = PLATFORMS.find(pl => pl.key === platform)
  if (!p) return <span className="text-xs text-text-muted">{platform}</span>
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-sans border ${p.color}`}>
      {p.icon} {p.label}
    </span>
  )
}

export default function LaunchPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<StoredProject | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>([])
  const [objective, setObjective] = useState<AdObjective>('awareness')
  const [tone, setTone] = useState<AdTone>('profesional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LaunchAd[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const p = getProject(projectId)
    if (p) setProject(p)
  }, [projectId])

  const togglePlatform = (platform: AdPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleProfile = (adId: string) => {
    setExpandedProfiles(prev => {
      const next = new Set(prev)
      if (next.has(adId)) next.delete(adId)
      else next.add(adId)
      return next
    })
  }

  const generateAds = async () => {
    if (!project || selectedPlatforms.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: project.sector,
          productContext: project.brandContext?.productContext || '',
          specificTopics: project.brandContext?.specificTopics || '',
          platforms: selectedPlatforms,
          objective,
          tone,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar anuncios')
      }

      const data = await res.json()
      const now = new Date().toISOString()

      const ads: LaunchAd[] = (data.ads || []).map((ad: Record<string, unknown>) => ({
        id: nanoid(10),
        platform: ad.platform as AdPlatform,
        objective,
        tone,
        headline: (ad.headline as string) || '',
        copy: (ad.copy as string) || '',
        cta: (ad.cta as string) || '',
        hashtags: (ad.hashtags as string[]) || [],
        psychProfile: (ad.psychProfile as string) || '',
        createdAt: now,
      }))

      setResults(ads)
      setExpandedProfiles(new Set(ads.map(a => a.id)))

      const existingLaunches = project.launches || []
      const updated = { ...project, launches: [...existingLaunches, ...ads] }
      saveProject(updated)
      setProject(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const copyAd = async (ad: LaunchAd) => {
    const text = `${ad.headline}\n\n${ad.copy}\n\n${ad.cta}\n\n${ad.hashtags.join(' ')}`
    await navigator.clipboard.writeText(text)
    setCopiedId(ad.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const previousLaunches = (project?.launches || []).filter(
    l => !results.find(r => r.id === l.id)
  )

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Proyecto no encontrado</p>
      </div>
    )
  }

  const hasProductContext = !!project.brandContext?.productContext

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Launch</h1>
        <p className="text-text-secondary text-sm md:text-base font-sans">
          Genera anuncios con neurocopywriting avanzado, listos para publicar
        </p>
      </div>

      {/* Warning: no product context */}
      {!hasProductContext && (
        <Card className="border-amber/30 bg-amber/5 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-amber text-sm font-sans flex-1">
              No tienes contexto de marca configurado. Los anuncios serán genéricos.
            </p>
            <Link href="/">
              <Button variant="secondary" size="sm">Completar en Inicio</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Brand context summary */}
      {hasProductContext && (
        <Card className="animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🏷️</span>
            <span className="text-text-secondary text-sm font-sans font-medium">Contexto de marca</span>
          </div>
          <p className="text-text-muted text-xs font-sans">
            <span className="text-amber">{project.sector}</span>
            {' — '}
            {project.brandContext.productContext.slice(0, 150)}
            {project.brandContext.productContext.length > 150 ? '...' : ''}
          </p>
        </Card>
      )}

      {/* Configuration */}
      <section className="space-y-8 animate-fade-up stagger-2">
        {/* Platforms */}
        <div>
          <h2 className="section-title mb-4">Plataformas</h2>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map(p => {
              const selected = selectedPlatforms.includes(p.key)
              return (
                <button
                  key={p.key}
                  onClick={() => togglePlatform(p.key)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-medium
                    transition-all duration-200 border-2
                    ${selected
                      ? p.color
                      : 'border-border bg-transparent text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Objective */}
        <div>
          <h2 className="section-title mb-4">Objetivo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {OBJECTIVES.map(o => (
              <button
                key={o.key}
                onClick={() => setObjective(o.key)}
                className={`
                  text-left px-5 py-4 rounded-xl font-sans transition-all duration-200 border-2
                  ${objective === o.key
                    ? 'border-amber bg-amber/10'
                    : 'border-border bg-transparent hover:border-border'
                  }
                `}
              >
                <p className={`text-sm font-semibold ${objective === o.key ? 'text-amber' : 'text-text'}`}>
                  {o.label}
                </p>
                <p className="text-xs text-text-muted mt-1">{o.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <h2 className="section-title mb-4">Tono</h2>
          <div className="flex flex-wrap gap-3">
            {TONES.map(t => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-medium
                  transition-all duration-200 border-2
                  ${tone === t.key
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-border bg-transparent text-text-muted hover:text-text-secondary'
                  }
                `}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={generateAds}
          loading={loading}
          size="lg"
          disabled={selectedPlatforms.length === 0}
          className="w-full sm:w-auto"
        >
          Generar Anuncios con IA ({selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? 's' : ''})
        </Button>
      </section>

      {error && (
        <Card className="border-alert/30 bg-alert/5">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-sans">Aplicando neurocopywriting...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <section className="space-y-6 animate-fade-up stagger-3">
          <h2 className="section-title">Anuncios generados</h2>
          <div className="space-y-6">
            {results.map(ad => (
              <Card key={ad.id} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <PlatformBadge platform={ad.platform} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyAd(ad)}
                  >
                    {copiedId === ad.id ? 'Copiado' : 'Copiar todo'}
                  </Button>
                </div>

                {/* Psych Profile - collapsible */}
                {ad.psychProfile && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleProfile(ad.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-sans">
                        🧠 Perfil Psicológico del Prospecto
                      </span>
                      <span className="text-text-muted text-xs">
                        {expandedProfiles.has(ad.id) ? '▲' : '▼'}
                      </span>
                    </button>
                    {expandedProfiles.has(ad.id) && (
                      <div className="px-4 pb-3 border-t border-border">
                        <p className="text-text-secondary text-xs font-sans leading-relaxed pt-3">
                          {ad.psychProfile}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">Headline</p>
                    <p className="text-text font-serif text-lg">{ad.headline}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">Copy</p>
                    <div className="post-preview bg-white/[0.02] rounded-lg p-4 border border-border text-sm text-text-secondary font-sans whitespace-pre-line leading-relaxed">
                      {ad.copy}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">CTA</p>
                    <span className="inline-block px-4 py-2 rounded-lg bg-amber/10 border border-amber/30 text-amber font-semibold font-sans text-sm">
                      {ad.cta}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ad.hashtags.map(tag => (
                      <span key={tag} className="text-xs text-blue-400">{tag}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Previous launches - collapsible */}
      {previousLaunches.length > 0 && (
        <section className="animate-fade-up">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="section-title flex items-center gap-2 mb-6 hover:text-amber transition-colors"
          >
            Historial ({previousLaunches.length})
            <span className="text-xs text-text-muted">{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {previousLaunches.map(ad => (
                <Card key={ad.id} className="flex flex-col gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={ad.platform} />
                      <span className="text-[10px] text-text-muted font-mono">
                        {new Date(ad.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => copyAd(ad)}>
                      {copiedId === ad.id ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="text-text font-serif">{ad.headline}</p>
                  <p className="text-text-muted text-xs font-sans line-clamp-2">{ad.copy}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && previousLaunches.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted font-sans text-lg mb-2">Sin anuncios generados</p>
          <p className="text-text-muted font-sans text-sm">
            Selecciona plataformas, objetivo y tono para generar anuncios
          </p>
        </div>
      )}
    </div>
  )
}
