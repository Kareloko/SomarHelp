import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const mainModel = openrouter('google/gemini-2.5-flash-preview-05-20')
export const evaluatorModel = openrouter('openai/gpt-4o-mini')
