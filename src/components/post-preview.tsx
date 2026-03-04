'use client'

import { useState } from 'react'
import { GeneratedPost, POST_STYLE_CONFIG, PostStyle, SourceType } from '@/types'

const FALLBACK_STYLE = { label: 'Post', icon: '📝', description: '' }
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface PostPreviewProps {
  post: GeneratedPost
  onEvaluate?: (post: GeneratedPost) => void
  showActions?: boolean
}

export function PostPreview({ post, onEvaluate, showActions = true }: PostPreviewProps) {
  const [copied, setCopied] = useState(false)
  const style = POST_STYLE_CONFIG[post.style as PostStyle] || FALLBACK_STYLE

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const engagementColor = {
    alto: 'green',
    medio: 'amber',
    bajo: 'gray',
  } as const

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <Badge variant="amber">{style.label}</Badge>
        </div>
        <Badge variant={engagementColor[post.estimatedEngagement as keyof typeof engagementColor]}>
          Engagement {post.estimatedEngagement}
        </Badge>
      </div>

      <div className="post-preview bg-white/[0.02] rounded-lg p-4 border border-border">
        {post.content}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {post.hashtags.map(tag => (
          <span key={tag} className="text-xs text-blue-400 font-sans">{tag}</span>
        ))}
      </div>

      {/* Sources panel */}
      {post.sources && post.sources.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-sans">Fuentes citadas</p>
          <div className="space-y-1.5">
            {post.sources.map((source, i) => {
              const tagConfig: Record<SourceType, { label: string; icon: string; className: string }> = {
                verificable: { label: 'VERIFICABLE', icon: '✅', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
                estimacion: { label: 'ESTIMACIÓN', icon: '⚠️', className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                opinion: { label: 'OPINIÓN', icon: '💬', className: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
              }
              const tag = tagConfig[source.type] || tagConfig.opinion
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border whitespace-nowrap ${tag.className}`}>
                    {tag.icon} {tag.label}
                  </span>
                  <span className="text-xs text-text-secondary leading-relaxed">{source.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-2 border-t border-border">
          {onEvaluate && (
            <Button variant="secondary" size="sm" onClick={() => onEvaluate(post)}>
              Evaluar con FIRE-A
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      )}
    </Card>
  )
}
