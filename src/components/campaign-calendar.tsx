'use client'

import { CampaignDay, POST_STYLE_CONFIG, FUNNEL_COLORS, PostStyle } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from './ui/button'
import { Card } from './ui/card'

const FALLBACK_STYLE = { label: 'Post', icon: '📝', description: '' }

interface CampaignCalendarProps {
  days: CampaignDay[]
  onGeneratePost?: (day: CampaignDay, index: number) => void
  onDeleteDay?: (index: number) => void
  onReorder?: (days: CampaignDay[]) => void
  loadingDay?: number | null
}

interface SortableCardProps {
  day: CampaignDay
  index: number
  sortId: string
  onGeneratePost?: (day: CampaignDay, index: number) => void
  onDeleteDay?: (index: number) => void
  loadingDay?: number | null
}

function SortableCard({ day, index, sortId, onGeneratePost, onDeleteDay, loadingDay }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId })

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const style = POST_STYLE_CONFIG[day.style as PostStyle] || FALLBACK_STYLE
  const funnelClass = FUNNEL_COLORS[day.funnel] || ''

  const handleDelete = () => {
    if (day.post) {
      if (!confirm('¿Eliminar esta card y su post generado?')) return
    }
    onDeleteDay?.(index)
  }

  return (
    <div ref={setNodeRef} style={cardStyle}>
      <Card className="flex flex-col gap-3 relative">
        {/* Drag handle + delete */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {onDeleteDay && (
            <button
              onClick={handleDelete}
              className="text-text-muted hover:text-alert text-xs transition-colors p-1"
              title="Eliminar card"
            >
              ✕
            </button>
          )}
          <button
            {...attributes}
            {...listeners}
            className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing p-1"
            title="Arrastrar para reordenar"
          >
            ⠿
          </button>
        </div>

        <div className="flex items-center justify-between pr-14">
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
          {(day.keywords || []).map(kw => (
            <span key={kw} className="text-[10px] text-text-muted bg-white/[0.03] px-1.5 py-0.5 rounded">
              {kw}
            </span>
          ))}
        </div>

        {onGeneratePost && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGeneratePost(day, index)}
            loading={loadingDay === index}
            className="mt-auto"
          >
            {day.post ? 'Regenerar' : 'Generar Post'}
          </Button>
        )}
      </Card>
    </div>
  )
}

export function CampaignCalendar({ days, onGeneratePost, onDeleteDay, onReorder, loadingDay }: CampaignCalendarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortIds = days.map((_, i) => `day-${i}`)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortIds.indexOf(active.id as string)
    const newIndex = sortIds.indexOf(over.id as string)
    const reordered = arrayMove(days, oldIndex, newIndex)
    onReorder?.(reordered)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {days.map((day, i) => (
            <SortableCard
              key={sortIds[i]}
              sortId={sortIds[i]}
              day={day}
              index={i}
              onGeneratePost={onGeneratePost}
              onDeleteDay={onDeleteDay}
              loadingDay={loadingDay}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
