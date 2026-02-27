import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { CAMPAIGN_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { sector, research, posts, productContext } = await req.json()

    if (!sector) {
      return Response.json({ error: 'Sector es requerido' }, { status: 400 })
    }

    const context = []
    if (research) {
      context.push(`Tendencias detectadas: ${research.trends?.map((t: any) => t.title).join(', ')}`)
      context.push(`Oportunidades: ${research.opportunities?.map((o: any) => o.title).join(', ')}`)
    }
    if (posts && posts.length > 0) {
      context.push(`Posts ya generados sobre: ${posts.map((p: any) => p.hook).join('; ')}`)
    }

    if (productContext) {
      context.push(`Contexto de marca: ${productContext}`)
    }

    const { text } = await generateText({
      model: mainModel,
      system: CAMPAIGN_SYSTEM_PROMPT,
      prompt: `Sector: "${sector}"

${context.length > 0 ? `Contexto del proyecto:\n${context.join('\n')}` : ''}

Genera un calendario editorial semanal (Lunes a Viernes) para LinkedIn, optimizado para engagement B2B en este sector.${productContext ? ' Los temas deben posicionar naturalmente la marca descrita en el contexto.' : ''}`,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la campaña' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: any) {
    console.error('Campaign API error:', error)
    return Response.json(
      { error: error.message || 'Error al generar la campaña' },
      { status: 500 }
    )
  }
}
