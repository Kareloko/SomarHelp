import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { GENERATE_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { topic, sector, angle, funnel } = await req.json()

    if (!topic || !sector) {
      return Response.json({ error: 'Topic y sector son requeridos' }, { status: 400 })
    }

    const { text } = await generateText({
      model: mainModel,
      system: GENERATE_SYSTEM_PROMPT,
      prompt: `Sector: "${sector}"
Tema: "${topic}"
Ángulo sugerido: "${angle || 'libre'}"
Etapa del funnel: "${funnel || 'MOFU'}"

Genera 5 variantes de posts de LinkedIn sobre este tema, cada una con un estilo diferente (contrarian, storytelling, dato-shock, pregunta-abierta, micro-caso).`,
      temperature: 0.8,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la respuesta' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: any) {
    console.error('Generate API error:', error)
    return Response.json(
      { error: error.message || 'Error al generar posts' },
      { status: 500 }
    )
  }
}
