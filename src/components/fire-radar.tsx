'use client'

import { FireScore } from '@/types'

interface FireRadarProps {
  score: FireScore
  average: number
  size?: number
}

export function FireRadar({ score, average, size = 220 }: FireRadarProps) {
  const center = size / 2
  const radius = (size / 2) - 30
  const maxScore = 10

  // Axes: F (top), I (right), R (bottom), E (left)
  const axes = [
    { key: 'f' as const, label: 'F', fullLabel: 'First Impression', color: '#E8A230', angle: -90 },
    { key: 'i' as const, label: 'I', fullLabel: 'Interest Hook', color: '#DC2626', angle: 0 },
    { key: 'r' as const, label: 'R', fullLabel: 'Reaction Trigger', color: '#8B5CF6', angle: 90 },
    { key: 'e' as const, label: 'E', fullLabel: 'Engagement Pull', color: '#059669', angle: 180 },
  ]

  const getPoint = (angleDeg: number, value: number) => {
    const angleRad = (angleDeg * Math.PI) / 180
    const r = (value / maxScore) * radius
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    }
  }

  // Generate polygon points for the score
  const polygonPoints = axes
    .map(axis => {
      const point = getPoint(axis.angle, score[axis.key])
      return `${point.x},${point.y}`
    })
    .join(' ')

  // Generate grid circles
  const gridLevels = [2.5, 5, 7.5, 10]

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Grid circles */}
        {gridLevels.map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / maxScore) * radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map(axis => {
          const end = getPoint(axis.angle, maxScore)
          return (
            <line
              key={axis.key}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          )
        })}

        {/* Score polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(232, 162, 48, 0.15)"
          stroke="#E8A230"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Score points */}
        {axes.map(axis => {
          const point = getPoint(axis.angle, score[axis.key])
          return (
            <circle
              key={`point-${axis.key}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={axis.color}
              stroke="#08080D"
              strokeWidth="2"
            />
          )
        })}

        {/* Axis labels */}
        {axes.map(axis => {
          const labelPoint = getPoint(axis.angle, maxScore + 1.8)
          return (
            <text
              key={`label-${axis.key}`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xs font-mono font-bold"
              fill={axis.color}
            >
              {axis.label}
            </text>
          )
        })}

        {/* Center score */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          className="text-2xl font-mono font-extrabold"
          fill="#E8A230"
        >
          {average.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="text-[9px] font-sans uppercase tracking-widest"
          fill="#8A8A9A"
        >
          FIRE
        </text>
      </svg>
    </div>
  )
}
