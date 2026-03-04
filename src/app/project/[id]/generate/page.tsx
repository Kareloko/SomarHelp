'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PostPreview } from '@/components/post-preview'
import { StoredProject, GeneratedPost, POST_STYLE_CONFIG, PostStyle } from '@/types'
import { getProject, saveProject } from '@/lib/storage'

export default function GeneratePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string

  const topic = searchParams.get('topic') || ''
  const angle = searchParams.get('angle') || ''
  const funnel = searchParams.get('funnel') || 'MOFU'

  const [project, setProject] = useState<StoredProject | null>(null)
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PostStyle | 'all'>('all')

  useEffect(() => {
    const p = getProject(projectId)
    if (p) {
      setProject(p)
      if (p.posts.length > 0) setPosts(p.posts)
    }
  }, [projectId])

  const generatePosts = async () => {
    if (!project) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          sector: project.sector,
          angle,
          funnel,
          productContext: project.brandContext?.productContext || '',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar posts')
      }

      const data = await res.json()
      const generatedPosts: GeneratedPost[] = data.posts.map((p: any) => ({
        id: nanoid(10),
        opportunityId: topic,
        style: p.style,
        content: p.content,
        hashtags: p.hashtags,
        estimatedEngagement: p.estimatedEngagement,
        hook: p.hook,
        sources: p.sources || [],
      }))

      setPosts(generatedPosts)
      const updated = { ...project, posts: [...project.posts.filter(p => p.opportunityId !== topic), ...generatedPosts] }
      saveProject(updated)
      setProject(updated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = (post: GeneratedPost) => {
    const searchParams = new URLSearchParams({ postId: post.id })
    router.push(`/project/${projectId}/evaluate?${searchParams.toString()}`)
  }

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(p => p.style === activeTab)

  const styles: (PostStyle | 'all')[] = ['all', 'personal', 'factual', 'opinion', 'pregunta', 'micro-caso']

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Generar Posts</h1>
          {topic ? (
            <p className="text-text-secondary text-sm md:text-base font-sans">
              Tema: <span className="text-amber">{topic}</span>
            </p>
          ) : (
            <p className="text-text-secondary text-sm md:text-base font-sans">
              Genera 5 variantes para tu contenido LinkedIn
            </p>
          )}
        </div>
        <Button onClick={generatePosts} loading={loading} size="lg" className="w-full sm:w-auto">
          {posts.length > 0 ? 'Regenerar' : 'Generar 5 Variantes'}
        </Button>
      </div>

      {error && (
        <Card className="border-alert/30 bg-alert/5">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-sans">Generando 5 variantes...</p>
        </div>
      )}

      {posts.length > 0 && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible md:pb-0">
            {styles.map(style => (
              <button
                key={style}
                onClick={() => setActiveTab(style)}
                className={`
                  px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-sans transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${activeTab === style
                    ? 'bg-amber text-[#08080D] font-semibold'
                    : 'bg-white/[0.03] text-text-secondary hover:text-text hover:bg-white/[0.06] border border-border'
                  }
                `}
              >
                {style === 'all' ? 'Todas' : `${POST_STYLE_CONFIG[style].icon} ${POST_STYLE_CONFIG[style].label}`}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPosts.map((post, i) => (
              <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <PostPreview post={post} onEvaluate={handleEvaluate} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-text-muted font-sans text-lg mb-2">No hay posts generados aún</p>
          <p className="text-text-muted font-sans text-sm">
            {topic
              ? 'Haz clic en "Generar 5 Variantes" para crear contenido'
              : 'Selecciona una oportunidad desde Research para generar posts'}
          </p>
        </div>
      )}
    </div>
  )
}
