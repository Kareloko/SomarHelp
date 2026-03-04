'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { StoredProject, POST_STYLE_CONFIG, PostStyle } from '@/types'
import { getProject } from '@/lib/storage'

const FALLBACK_STYLE = { label: 'Post', icon: '📝', description: '' }

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<StoredProject | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const p = getProject(projectId)
    if (p) setProject(p)
  }, [projectId])

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Proyecto no encontrado</p>
      </div>
    )
  }

  const bestPost = project.evaluations.length > 0
    ? (() => {
        const bestEval = project.evaluations.reduce((best, curr) =>
          curr.average > best.average ? curr : best
        )
        return project.posts.find(p => p.id === bestEval.postId) || null
      })()
    : project.posts[0] || null

  const bestScore = project.evaluations.length > 0
    ? project.evaluations.reduce((best, curr) => curr.average > best.average ? curr : best).average
    : null

  const handleCopyBest = async () => {
    if (!bestPost) return
    await navigator.clipboard.writeText(bestPost.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `somarhelp-${project.sector.toLowerCase().replace(/\s+/g, '-')}-${project.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadMarkdown = () => {
    let md = `# SomarHelp — ${project.sector}\n`
    md += `Fecha: ${new Date(project.createdAt).toLocaleDateString('es-ES')}\n\n`

    if (project.research) {
      md += `## Research\n\n`
      md += `### Tendencias\n`
      project.research.trends.forEach(t => {
        md += `- **${t.title}** (${t.relevance}): ${t.description}\n`
      })
      md += `\n### Estadísticas\n`
      project.research.stats.forEach(s => {
        md += `- **${s.value}** — ${s.label} (${s.source})\n`
      })
      md += `\n`
    }

    if (project.posts.length > 0) {
      md += `## Posts Generados\n\n`
      project.posts.forEach((post, i) => {
        const style = POST_STYLE_CONFIG[post.style as PostStyle] || FALLBACK_STYLE
        md += `### ${i + 1}. ${style.icon} ${style.label}\n\n`
        md += `${post.content}\n\n`
        md += `Hashtags: ${post.hashtags.join(' ')}\n\n`
        md += `---\n\n`
      })
    }

    if (project.evaluations.length > 0) {
      md += `## Evaluaciones FIRE-A\n\n`
      project.evaluations.forEach(ev => {
        const post = project.posts.find(p => p.id === ev.postId)
        const style = post ? (POST_STYLE_CONFIG[post.style as PostStyle] || FALLBACK_STYLE) : null
        md += `### ${style ? `${style.icon} ${style.label}` : 'Post'} — Score: ${ev.average.toFixed(1)}\n`
        md += `- F: ${ev.score.f} | I: ${ev.score.i} | R: ${ev.score.r} | E: ${ev.score.e} | A: ${ev.score.a ?? '—'}\n`
        md += `- Veredicto: ${ev.verdict}\n`
        md += `- ${ev.reason}\n\n`
      })
    }

    if (project.campaign) {
      md += `## Campaña: ${project.campaign.week}\n\n`
      project.campaign.days.forEach(day => {
        md += `### ${day.day} (${day.date})\n`
        md += `- Tema: ${day.topic}\n`
        md += `- Estilo: ${(POST_STYLE_CONFIG[day.style as PostStyle] || FALLBACK_STYLE).label}\n`
        md += `- Funnel: ${day.funnel}\n`
        md += `- Brief: ${day.brief}\n\n`
      })
    }

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `somarhelp-${project.sector.toLowerCase().replace(/\s+/g, '-')}-${project.id}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Exportar</h1>
        <p className="text-text-secondary text-sm md:text-base font-sans">
          Resumen del proyecto y opciones de exportación
        </p>
      </div>

      {/* Session stats */}
      <section className="animate-fade-up">
        <h2 className="section-title mb-6">Resumen de sesión</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Sector" value={project.sector} />
          <StatCard label="Posts generados" value={project.posts.length} />
          <StatCard label="Evaluaciones" value={project.evaluations.length} />
          <StatCard label="Mejor FIRE-A" value={bestScore ? bestScore.toFixed(1) : '—'} />
        </div>
      </section>

      {/* Best post */}
      {bestPost && (
        <section className="animate-fade-up stagger-2">
          <h2 className="section-title mb-6">Post recomendado</h2>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span>{(POST_STYLE_CONFIG[bestPost.style as PostStyle] || FALLBACK_STYLE).icon}</span>
                <Badge variant="amber">{(POST_STYLE_CONFIG[bestPost.style as PostStyle] || FALLBACK_STYLE).label}</Badge>
                {bestScore && (
                  <span className="text-xs font-mono text-amber">FIRE-A {bestScore.toFixed(1)}</span>
                )}
              </div>
              <Button variant="primary" size="sm" onClick={handleCopyBest} className="w-full sm:w-auto">
                {copied ? 'Copiado' : 'Copiar al portapapeles'}
              </Button>
            </div>
            <div className="post-preview bg-white/[0.02] rounded-lg p-5 border border-border">
              {bestPost.content}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {bestPost.hashtags.map(tag => (
                <span key={tag} className="text-xs text-blue-400">{tag}</span>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Export buttons */}
      <section className="animate-fade-up stagger-3">
        <h2 className="section-title mb-6">Descargar proyecto</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="secondary" size="lg" onClick={handleDownloadJSON} className="w-full sm:w-auto">
            Descargar JSON
          </Button>
          <Button variant="secondary" size="lg" onClick={handleDownloadMarkdown} className="w-full sm:w-auto">
            Descargar Markdown
          </Button>
        </div>
      </section>

      {/* New project button */}
      <section className="animate-fade-up stagger-4 pt-4">
        <button
          onClick={() => router.push('/')}
          className="w-full py-4 px-6 rounded-xl border-2 border-amber/40 bg-transparent text-amber hover:bg-amber/10 hover:border-amber/60 transition-all duration-200 font-sans font-semibold text-lg flex items-center justify-center gap-3"
        >
          <span className="text-xl">+</span>
          Nuevo Proyecto
        </button>
      </section>
    </div>
  )
}
