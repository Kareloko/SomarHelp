'use client'

import { useState } from 'react'
import { GeneratedPost, POST_STYLE_CONFIG } from '@/types'
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
  const style = POST_STYLE_CONFIG[post.style]

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

      {showActions && (
        <div className="flex gap-2 pt-2 border-t border-border">
          {onEvaluate && (
            <Button variant="secondary" size="sm" onClick={() => onEvaluate(post)}>
              Evaluar con FIRE
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
