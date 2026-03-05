import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { CAMPAIGN_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { sector, research, posts, productContext, usedTopics } = await req.json()

    if (!sector) {
      return Response.json({ error: 'Sector es requerido' }, { status: 400 })
    }

    const context = []
    if (research) {
      context.push(`Tendencias detectadas: ${research.trends?.map((t: Record<string, string>) => t.title).join(', ')}`)
      context.push(`Oportunidades: ${research.opportunities?.map((o: Record<string, string>) => o.title).join(', ')}`)
    }
    if (posts && posts.length > 0) {
      context.push(`Posts ya generados sobre: ${posts.map((p: Record<string, string>) => p.hook).join('; ')}`)
    }

    if (productContext) {
      context.push(`Contexto de marca: ${productContext}`)
    }

    // Anti-repetition: include previously used topics
    let antiRepetition = ''
    if (usedTopics && usedTopics.length > 0) {
      antiRepetition = `\n\nTEMAS YA USADOS EN CAMPAÑAS ANTERIORES (NO REPETIR NI PARAFRASEAR):\n${usedTopics.map((t: string) => `- ${t}`).join('\n')}\nGenera contenido con ángulos completamente diferentes.`
    }

    const { text } = await generateText({
      model: mainModel,
      system: CAMPAIGN_SYSTEM_PROMPT,
      prompt: `Sector: "${sector}"

${context.length > 0 ? `Contexto del proyecto:\n${context.join('\n')}` : ''}

Genera un calendario editorial semanal (Lunes a Viernes) para LinkedIn, optimizado para engagement B2B en este sector.${productContext ? ' Los temas deben posicionar naturalmente la marca descrita en el contexto.' : ''}${antiRepetition}`,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la campaña' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: unknown) {
    console.error('Campaign API error:', error)
    const message = error instanceof Error ? error.message : 'Error al generar la campaña'
    return Response.json({ error: message }, { status: 500 })
  }
}
