export interface ResearchTrend {
  title: string
  description: string
  source: string
  relevance: 'alta' | 'media' | 'baja'
}

export interface ResearchStat {
  value: string
  label: string
  source: string
  impact: string
}

export interface ContentOpportunity {
  id: string
  title: string
  description: string
  funnel: 'TOFU' | 'MOFU' | 'BOFU'
  engagement: 'alto' | 'medio' | 'bajo'
  angle: string
}

export interface ResearchData {
  sector: string
  trends: ResearchTrend[]
  stats: ResearchStat[]
  opportunities: ContentOpportunity[]
}

export type PostStyle = 'contrarian' | 'storytelling' | 'dato-shock' | 'pregunta-abierta' | 'micro-caso'

export interface GeneratedPost {
  id: string
  opportunityId: string
  style: PostStyle
  content: string
  hashtags: string[]
  estimatedEngagement: string
  hook: string
}

export interface FireScore {
  f: number // First Impression
  i: number // Interest Hook
  r: number // Reaction Trigger
  e: number // Engagement Pull
}

export interface FireEvaluation {
  id: string
  postId: string
  score: FireScore
  average: number
  verdict: 'PUBLICAR' | 'MEJORAR' | 'DESCARTAR'
  reason: string
  improvements: string[]
}

export interface CampaignDay {
  day: string // Lunes, Martes, etc.
  date: string
  topic: string
  style: PostStyle
  funnel: 'TOFU' | 'MOFU' | 'BOFU'
  keywords: string[]
  brief: string
  post?: GeneratedPost
}

export interface CampaignData {
  id: string
  week: string
  days: CampaignDay[]
}

export interface StoredProject {
  id: string
  sector: string
  createdAt: string
  research: ResearchData | null
  posts: GeneratedPost[]
  evaluations: FireEvaluation[]
  campaign: CampaignData | null
}

export type PipelineStep = 'research' | 'generate' | 'evaluate' | 'campaign' | 'export'

export const POST_STYLE_CONFIG: Record<PostStyle, { label: string; icon: string; description: string }> = {
  'contrarian': { label: 'Contrarian', icon: '⚡', description: 'Posición opuesta al consenso del sector' },
  'storytelling': { label: 'Storytelling', icon: '📖', description: 'Historia en primera persona, narrativa' },
  'dato-shock': { label: 'Dato Shock', icon: '📊', description: 'Abre con estadística impactante' },
  'pregunta-abierta': { label: 'Pregunta Abierta', icon: '❓', description: 'Pregunta que genera debate en comentarios' },
  'micro-caso': { label: 'Micro-Caso', icon: '🔬', description: 'Mini caso de éxito en 200 palabras' },
}

export const FUNNEL_COLORS: Record<string, string> = {
  'TOFU': 'bg-blue-deep/20 text-blue-400 border-blue-deep/30',
  'MOFU': 'bg-amber/20 text-amber-300 border-amber/30',
  'BOFU': 'bg-success/20 text-emerald-400 border-success/30',
}

export const ENGAGEMENT_COLORS: Record<string, string> = {
  'alto': 'text-emerald-400',
  'medio': 'text-amber-400',
  'bajo': 'text-text-secondary',
}
