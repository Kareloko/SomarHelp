'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CampaignCalendar } from '@/components/campaign-calendar'
import { StoredProject, CampaignData, CampaignDay, GeneratedPost } from '@/types'
import { getProject, saveProject } from '@/lib/storage'

export default function CampaignPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<StoredProject | null>(null)
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDay, setLoadingDay] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = getProject(projectId)
    if (p) {
      setProject(p)
      if (p.campaign) setCampaign(p.campaign)
    }
  }, [projectId])

  const generateCampaign = async () => {
    if (!project) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: project.sector,
          research: project.research,
          posts: project.posts,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar campaña')
      }

      const data = await res.json()
      const campaignData: CampaignData = {
        id: nanoid(10),
        week: data.week,
        days: data.days,
      }

      setCampaign(campaignData)
      const updated = { ...project, campaign: campaignData }
      saveProject(updated)
      setProject(updated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateDayPost = async (day: CampaignDay, index: number) => {
    if (!project || !campaign) return
    setLoadingDay(index)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: day.topic,
          sector: project.sector,
          angle: day.brief,
          funnel: day.funnel,
        }),
      })

      if (!res.ok) throw new Error('Error al generar post')

      const data = await res.json()
      const matchingPost = data.posts.find((p: any) => p.style === day.style) || data.posts[0]

      const generatedPost: GeneratedPost = {
        id: nanoid(10),
        opportunityId: day.topic,
        style: matchingPost.style,
        content: matchingPost.content,
        hashtags: matchingPost.hashtags,
        estimatedEngagement: matchingPost.estimatedEngagement,
        hook: matchingPost.hook,
      }

      const updatedDays = [...campaign.days]
      updatedDays[index] = { ...updatedDays[index], post: generatedPost }
      const updatedCampaign = { ...campaign, days: updatedDays }
      setCampaign(updatedCampaign)

      const updated = {
        ...project,
        campaign: updatedCampaign,
        posts: [...project.posts, generatedPost],
      }
      saveProject(updated)
      setProject(updated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingDay(null)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-text mb-1 md:mb-2">Campaña Semanal</h1>
          <p className="text-text-secondary text-sm md:text-base font-sans">
            Calendario editorial de 5 días para LinkedIn
          </p>
        </div>
        <Button onClick={generateCampaign} loading={loading} size="lg" className="w-full sm:w-auto">
          {campaign ? 'Regenerar Campaña' : 'Generar Campaña'}
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
          <p className="text-text-secondary text-sm font-sans">Planificando campaña semanal...</p>
        </div>
      )}

      {campaign && !loading && (
        <div className="space-y-8 animate-fade-in">
          <Card>
            <p className="text-text-secondary text-sm font-sans">
              <span className="text-amber font-semibold">{campaign.week}</span>
            </p>
          </Card>

          <CampaignCalendar
            days={campaign.days}
            onGeneratePost={generateDayPost}
            loadingDay={loadingDay}
          />

          {/* Show generated day posts */}
          {campaign.days.some(d => d.post) && (
            <section>
              <h2 className="section-title mb-6">Posts generados</h2>
              <div className="space-y-4">
                {campaign.days
                  .filter(d => d.post)
                  .map((day, i) => (
                    <Card key={i}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber font-serif">{day.day}</span>
                        <span className="text-text-muted text-xs">—</span>
                        <span className="text-text-secondary text-sm">{day.topic}</span>
                      </div>
                      <div className="post-preview bg-white/[0.02] rounded-lg p-4 border border-border">
                        {day.post!.content}
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!loading && !campaign && (
        <div className="text-center py-20">
          <p className="text-text-muted font-sans text-lg mb-2">Sin campaña generada</p>
          <p className="text-text-muted font-sans text-sm">
            Genera una campaña semanal basada en tu research y posts
          </p>
        </div>
      )}
    </div>
  )
}
