import { generateText } from 'ai'
import { mainModel } from '@/lib/ai'
import { AdPlatform } from '@/types'

const SYSTEM_PROMPT = `Actúa como un experto mundial en Neurocopywriting, Psicología del Consumidor, Neuromarketing y Economía del Comportamiento. Tu objetivo es crear un texto altamente persuasivo que logre conversiones apelando a la mente inconsciente y racional del cliente ideal.

Aplica la metodología de las "3 E" (Entender, Escribir, Editar):

PASO 1 — ENTENDER (Análisis Profundo):
- Nivel de Conciencia (Eugene Schwartz): determina si el prospecto es frío (inconsciente del problema), tibio (conoce la solución) o caliente (conoce el producto). Adapta el enfoque en consecuencia.
- Sistemas de Pensamiento (Kahneman): define qué estímulos activan el Sistema 1 (cerebro rápido, emocional, automático) para captar atención instantánea, y qué datos/garantías activan el Sistema 2 (lógico, analítico) para justificar la decisión.

PASO 2 — ESCRIBIR (Ingeniería Persuasiva):
- Neuromarketing Triuno: apela al cerebro reptiliano (urgencia, estatus, supervivencia), sistema límbico (historias, empatía) y corteza prefrontal (datos que derriban objeciones).
- 6 Principios de Cialdini: integra naturalmente Reciprocidad, Coherencia, Prueba Social, Simpatía, Escasez/Urgencia y Autoridad.
- Sesgos Cognitivos: usa Efecto Framing (carencias como oportunidades), Aversión a la Pérdida (FOMO), Sesgo de Anclaje (valor percibido vs precio).
- PNL y Power Words: lenguaje multisensorial (visual, auditivo, kinestésico). Palabras de poder: "gratis", "libertad", "exclusivo", "ahorro", "garantizado".
- Storytelling: contexto → desafío → solución → resultado transformador.

PASO 3 — FLUIDEZ COGNITIVA:
- Textos escaneables: bullets, jerarquía visual clara, sin complejidad innecesaria.
- Lenguaje conversacional, nunca técnico en exceso.
- Sin promesas exageradas, cumple políticas de publicidad.
- CTA final claro, concreto y con urgencia.

Responde ÚNICAMENTE en formato JSON válido, sin backticks ni explicaciones:
{
  "psychProfile": "resumen en 2-3 líneas del análisis PASO 1",
  "headline": "titular principal impactante",
  "copy": "copy completo listo para publicar",
  "cta": "texto del botón/llamada a la acción",
  "hashtags": ["hashtag1", "hashtag2"]
}`

const PLATFORM_PROMPTS: Record<AdPlatform, string> = {
  facebook: `Plataforma: Facebook Ads
Formato: Hook emocional en la primera línea, 200-300 palabras, emojis estratégicos (no más de 6), 6-8 hashtags en español relevantes al sector LATAM.
El copy debe sentirse nativo de Facebook, no como un anuncio corporativo.`,

  linkedin: `Plataforma: LinkedIn
Formato: Primera línea es el gancho (se corta antes del 'ver más'), estructura Problema → Agitación → Solución → Prueba Social → CTA, 150-200 palabras, saltos de línea frecuentes para mobile, 4-5 hashtags profesionales de nicho.`,

  instagram: `Plataforma: Instagram
Formato: Caption visual e impactante, emojis con ritmo visual, máximo 150 palabras en el cuerpo, línea separadora antes de hashtags, 15-20 hashtags mezclando nicho específico + industria + audiencia LATAM.`,
}

const OBJECTIVE_MAP: Record<string, string> = {
  awareness: 'Awareness — Dar a conocer la marca/producto',
  conversion: 'Conversión — Generar ventas, registros o demos',
  retargeting: 'Retargeting — Re-enganchar usuarios que ya conocen la marca',
}

const TONE_MAP: Record<string, string> = {
  profesional: 'Profesional y confiable',
  urgente: 'Urgente y escaso (FOMO)',
  storytelling: 'Narrativo y emocional',
  provocador: 'Provocador e inesperado',
}

export async function POST(req: Request) {
  try {
    const { sector, productContext, specificTopics, platforms, objective, tone } = await req.json()

    if (!sector || !platforms || platforms.length === 0) {
      return Response.json({ error: 'Sector y plataformas son requeridos' }, { status: 400 })
    }

    const adPromises = (platforms as AdPlatform[]).map(async (platform) => {
      const prompt = `Producto/Servicio: ${productContext || sector}
Sector: ${sector}
Temas clave: ${specificTopics || 'General del sector'}
Objetivo del anuncio: ${OBJECTIVE_MAP[objective] || objective}
Tono: ${TONE_MAP[tone] || tone}
${PLATFORM_PROMPTS[platform]}`

      const { text } = await generateText({
        model: mainModel,
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.8,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error(`No se pudo parsear la respuesta para ${platform}`)
      }

      const parsed = JSON.parse(jsonMatch[0])
      return { platform, ...parsed }
    })

    const ads = await Promise.all(adPromises)
    return Response.json({ ads })
  } catch (error: unknown) {
    console.error('Launch API error:', error)
    const message = error instanceof Error ? error.message : 'Error al generar anuncios'
    return Response.json({ error: message }, { status: 500 })
  }
}
