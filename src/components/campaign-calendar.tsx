'use client'

import { CampaignDay, POST_STYLE_CONFIG, FUNNEL_COLORS } from '@/types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface CampaignCalendarProps {
  days: CampaignDay[]
  onGeneratePost?: (day: CampaignDay, index: number) => void
  loadingDay?: number | null
}

export function CampaignCalendar({ days, onGeneratePost, loadingDay }: CampaignCalendarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {days.map((day, i) => {
        const style = POST_STYLE_CONFIG[day.style]
        const funnelClass = FUNNEL_COLORS[day.funnel]

        return (
          <Card key={i} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg text-text">{day.day}</p>
                <p className="text-xs text-text-muted font-mono">{day.date}</p>
              </div>
              <span className={`badge ${funnelClass}`}>{day.funnel}</span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-text mb-2">{day.topic}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{day.brief}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm">{style.icon}</span>
              <span className="text-xs text-text-secondary">{style.label}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {day.keywords.map(kw => (
                <span key={kw} className="text-[10px] text-text-muted bg-white/[0.03] px-1.5 py-0.5 rounded">
                  {kw}
                </span>
              ))}
            </div>

            {onGeneratePost && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onGeneratePost(day, i)}
                loading={loadingDay === i}
                className="mt-auto"
              >
                {day.post ? 'Regenerar' : 'Generar Post'}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
