'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FireRadar } from '@/components/fire-radar'
import { StoredProject, GeneratedPost, FireEvaluation, POST_STYLE_CONFIG } from '@/types'
import { getProject, saveProject } from '@/lib/storage'

export default function EvaluatePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const preselectedPostId = searchParams.get('postId')

  const [project, setProject] = useState<StoredProject | null>(null)
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null)
  const [evaluation, setEvaluation] = useState<FireEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = getProject(projectId)
    if (p) {
      setProject(p)
      if (preselectedPostId) {
        const post = p.posts.find(post => post.id === preselectedPostId)
        if (post) {
          setSelectedPost(post)
          const existingEval = p.evaluations.find(e => e.postId === preselectedPostId)
          if (existingEval) setEvaluation(existingEval)
        }
      }
    }
  }, [projectId, preselectedPostId])

  const evaluatePost = async (post: GeneratedPost) => {
    setSelectedPost(post)
    setLoading(true)
    setError(null)
    setEvaluation(null)

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent: post.content,
          postStyle: post.style,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al evaluar')
      }

      const data = await res.json()
      const fireEval: FireEvaluation = {
        id: nanoid(10),
        postId: post.id,
        score: data.score,
        average: data.average,
        verdict: data.verdict,
        reason: data.reason,
        improvements: data.improvements || [],
      }

      setEvaluation(fireEval)

      if (project) {
        const updated = {
          ...project,
          evaluations: [...project.evaluations.filter(e => e.postId !== post.id), fireEval],
        }
        saveProject(updated)
        setProject(updated)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verdictConfig = {
    PUBLICAR: { badge: 'green' as const, icon: '✅', text: 'Listo para publicar' },
    MEJORAR: { badge: 'amber' as const, icon: '⚠️', text: 'Necesita mejoras' },
    DESCARTAR: { badge: 'red' as const, icon: '❌', text: 'Descartar y replantear' },
  }

  const fireAxes = [
    { key: 'f' as const, label: 'First Impression', color: '#E8A230', description: 'Detiene el scroll en 2 segundos' },
    { key: 'i' as const, label: 'Interest Hook', color: '#DC2626', description: 'Mantiene leyendo después de la 1ra línea' },
    { key: 'r' as const, label: 'Reaction Trigger', color: '#8B5CF6', description: 'Provoca like, comentario o compartir' },
    { key: 'e' as const, label: 'Engagement Pull', color: '#059669', description: 'Genera conversación real' },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Evaluar — FIRE Score</h1>
        <p className="text-text-secondary text-sm md:text-base font-sans">
          Un crítico de IA evalúa cada post en 4 ejes de rendimiento
        </p>
      </div>

      {error && (
        <Card className="border-alert/30 bg-alert/5">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts list */}
        <div className="space-y-4">
          <h2 className="section-title mb-4">Posts disponibles</h2>
          {project?.posts && project.posts.length > 0 ? (
            project.posts.map(post => {
              const isSelected = selectedPost?.id === post.id
              const hasEval = project.evaluations.find(e => e.postId === post.id)
              const style = POST_STYLE_CONFIG[post.style]

              return (
                <Card
                  key={post.id}
                  interactive
                  onClick={() => {
                    setSelectedPost(post)
                    const existingEval = project.evaluations.find(e => e.postId === post.id)
                    setEvaluation(existingEval || null)
                  }}
                  className={isSelected ? 'border-border-active' : ''}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{style.icon}</span>
                      <Badge variant="amber">{style.label}</Badge>
                    </div>
                    {hasEval && (
                      <span className="text-xs font-mono text-amber">{hasEval.average.toFixed(1)}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{post.hook}</p>

                  {isSelected && !hasEval && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        evaluatePost(post)
                      }}
                      loading={loading}
                    >
                      Evaluar con FIRE
                    </Button>
                  )}
                </Card>
              )
            })
          ) : (
            <Card>
              <p className="text-text-muted text-sm">No hay posts para evaluar. Genera posts primero.</p>
            </Card>
          )}
        </div>

        {/* Evaluation result */}
        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
              <p className="text-text-secondary text-sm font-sans">Evaluando post...</p>
            </div>
          )}

          {evaluation && !loading && (
            <div className="space-y-6 animate-fade-up">
              {/* Radar chart */}
              <Card className="flex flex-col items-center py-8">
                <FireRadar score={evaluation.score} average={evaluation.average} />
              </Card>

              {/* Score cards */}
              <div className="grid grid-cols-2 gap-3">
                {fireAxes.map(axis => (
                  <Card key={axis.key}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: axis.color }} />
                      <span className="text-xs font-semibold text-text uppercase">{axis.key.toUpperCase()}</span>
                    </div>
                    <p className="text-2xl font-extrabold font-mono" style={{ color: axis.color }}>
                      {evaluation.score[axis.key]}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">{axis.description}</p>
                  </Card>
                ))}
              </div>

              {/* Verdict */}
              <Card>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{verdictConfig[evaluation.verdict].icon}</span>
                  <div>
                    <Badge variant={verdictConfig[evaluation.verdict].badge} className="text-sm px-3 py-1">
                      {evaluation.verdict}
                    </Badge>
                    <p className="text-xs text-text-secondary mt-1">
                      {verdictConfig[evaluation.verdict].text}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{evaluation.reason}</p>

                {evaluation.improvements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Mejoras sugeridas</p>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-amber mt-0.5 text-xs">→</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Re-evaluate button */}
              {selectedPost && (
                <Button
                  variant="secondary"
                  onClick={() => evaluatePost(selectedPost)}
                  loading={loading}
                  className="w-full"
                >
                  Re-evaluar este post
                </Button>
              )}
            </div>
          )}

          {!evaluation && !loading && selectedPost && (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm">Haz clic en &quot;Evaluar con FIRE&quot; para obtener la evaluación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
