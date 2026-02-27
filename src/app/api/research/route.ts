import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { RESEARCH_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { sector } = await req.json()

    if (!sector) {
      return Response.json({ error: 'Sector es requerido' }, { status: 400 })
    }

    const { text } = await generateText({
      model: mainModel,
      system: RESEARCH_SYSTEM_PROMPT,
      prompt: `Investiga el sector: "${sector}". Genera tendencias, estadísticas y oportunidades de contenido LinkedIn para una empresa B2B en este nicho.`,
      temperature: 0.7,
    })

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la respuesta de la IA' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: any) {
    console.error('Research API error:', error)
    return Response.json(
      { error: error.message || 'Error al investigar el sector' },
      { status: 500 }
    )
  }
}
