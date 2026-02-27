import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { RESEARCH_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { sector, productContext, specificTopics } = await req.json()

    if (!sector) {
      return Response.json({ error: 'Sector es requerido' }, { status: 400 })
    }

    let prompt = `Investiga el sector: "${sector}".`

    if (productContext) {
      prompt += `\n\nCONTEXTO DE LA MARCA/PRODUCTO:\n${productContext}\n\nTODAS las tendencias, datos y oportunidades deben estar enfocadas en posicionar esta marca/producto. Las oportunidades de contenido deben mencionar y posicionar naturalmente esta marca.`
    }

    if (specificTopics) {
      prompt += `\n\nTEMAS ESPECÍFICOS A CUBRIR:\n${specificTopics}\n\nIncluye oportunidades de contenido que cubran estos temas específicos.`
    }

    if (!productContext) {
      prompt += ` Genera tendencias, estadísticas y oportunidades de contenido LinkedIn para una empresa B2B en este nicho.`
    }

    const { text } = await generateText({
      model: mainModel,
      system: RESEARCH_SYSTEM_PROMPT,
      prompt,
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
