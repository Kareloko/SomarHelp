import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { AdPlatform } from '@/types'

const PLATFORM_SPECS: Record<AdPlatform, string> = {
  facebook: `Plataforma: Facebook Ads
- Hook emocional en la primera línea
- Copy de 200-300 palabras
- Emojis moderados (3-5 máximo)
- 6-8 hashtags relevantes
- CTA directo con urgencia sutil`,

  linkedin: `Plataforma: LinkedIn Ads
- Primera línea como gancho profesional
- Estructura: problema → solución → CTA
- Copy de 150-200 palabras
- Tono B2B profesional
- 4-5 hashtags profesionales
- CTA orientado a valor`,

  instagram: `Plataforma: Instagram Ads
- Caption visual y atractivo
- Emojis rítmicos integrados en el texto
- Copy de 100-150 palabras
- 15-20 hashtags mixtos (nicho + populares)
- CTA conversacional`,
}

const SYSTEM_PROMPT = `Eres un experto en copywriting publicitario digital. Generas anuncios listos para publicar.

REGLAS:
- Cada anuncio debe tener: headline, copy, cta, hashtags
- El headline debe ser corto y magnético (máximo 10 palabras)
- El copy debe seguir las especificaciones de cada plataforma
- El CTA debe ser una frase de acción clara
- Los hashtags deben ser relevantes al sector y plataforma
- NUNCA inventes datos o estadísticas falsas
- Adapta el tono según lo solicitado

Responde SOLO con JSON válido, sin markdown, sin backticks:
{
  "ads": [
    {
      "platform": "facebook|linkedin|instagram",
      "headline": "...",
      "copy": "...",
      "cta": "...",
      "hashtags": ["#tag1", "#tag2"]
    }
  ]
}`

export async function POST(req: Request) {
  try {
    const { sector, productContext, specificTopics, platforms, objective, tone } = await req.json()

    if (!sector || !platforms || platforms.length === 0) {
      return Response.json({ error: 'Sector y plataformas son requeridos' }, { status: 400 })
    }

    const platformSpecs = platforms
      .map((p: AdPlatform) => PLATFORM_SPECS[p])
      .join('\n\n---\n\n')

    const objectiveMap: Record<string, string> = {
      awareness: 'Dar a conocer la marca/producto. Enfoque en despertar curiosidad y reconocimiento.',
      conversion: 'Generar conversiones directas (compras, registros, demos). Enfoque en beneficios claros y urgencia.',
      retargeting: 'Re-enganchar usuarios que ya conocen la marca. Enfoque en recordatorio, prueba social y oferta.',
    }

    const toneMap: Record<string, string> = {
      profesional: 'Profesional y confiable. Datos, autoridad, lenguaje corporativo accesible.',
      urgente: 'Urgente y escaso. FOMO, plazos, disponibilidad limitada.',
      storytelling: 'Narrativo y emocional. Historia personal, transformación, conexión humana.',
      provocador: 'Provocador e inesperado. Romper esquemas, cuestionar lo establecido, generar debate.',
    }

    let prompt = `Sector: "${sector}"
Objetivo: ${objectiveMap[objective] || objective}
Tono: ${toneMap[tone] || tone}

ESPECIFICACIONES POR PLATAFORMA:
${platformSpecs}`

    if (productContext) {
      prompt += `\n\nCONTEXTO DE MARCA:\n${productContext}`
    }
    if (specificTopics) {
      prompt += `\n\nTEMAS ESPECÍFICOS:\n${specificTopics}`
    }

    prompt += `\n\nGenera un anuncio optimizado para CADA plataforma solicitada (${platforms.join(', ')}).`

    const { text } = await generateText({
      model: mainModel,
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.8,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'No se pudo parsear la respuesta' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (error: unknown) {
    console.error('Launch API error:', error)
    const message = error instanceof Error ? error.message : 'Error al generar anuncios'
    return Response.json({ error: message }, { status: 500 })
  }
}
