import { generateText } from 'ai'
import { evaluatorModel } from '@/lib/ai'
import { EVALUATE_SYSTEM_PROMPT } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const { postContent, postStyle } = await req.json()

    if (!postContent) {
      return Response.json({ error: 'Post content es requerido' }, { status: 400 })
    }

    const { text } = await generateText({
      model: evaluatorModel,
      system: EVALUATE_SYSTEM_PROMPT,
      prompt: `Evalúa el siguiente post de LinkedIn (estilo: ${postStyle || 'general'}) con el sistema FIRE Score:

---
${postContent}
---

Sé riguroso en tu evaluación. Analiza cada eje del FIRE score cuidadosamente.`,
      temperature: 0.3,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la evaluación' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: any) {
    console.error('Evaluate API error:', error)
    return Response.json(
      { error: error.message || 'Error al evaluar el post' },
      { status: 500 }
    )
  }
}
