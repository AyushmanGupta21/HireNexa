/**
 * OPTIMIZED AI PROVIDERS - GROQ, CEREBRAS & GEMINI
 * 
 * Strategy:
 * - Gemini: FREE & UNLIMITED - Professional summaries, skill recommendations
 * - Groq: Best for code analysis (GPT-OSS 120B, Llama 3.3 70B)
 * - Cerebras: Best for speed (Llama 3.1 70B, fastest inference)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// API Configuration
const API_KEYS = {
  gemini: process.env.GEMINI_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
  cerebras: process.env.CEREBRAS_API_KEY || ''
}

/**
 * GROQ MODELS (Production-Ready)
 */
export const GROQ_MODELS = {
  // Best for CODE ANALYSIS
  CODE_EXPERT: 'openai/gpt-oss-120b', // 120B params - Best for deep code understanding

  // Best for GENERAL TASKS
  VERSATILE: 'llama-3.3-70b-versatile', // 70B params - Fast & reliable

  // Best for SPEED
  INSTANT: 'llama-3.1-8b-instant', // 8B params - Ultra-fast

  // Preview Models (for testing)
  LLAMA4_SCOUT: 'meta-llama/llama-4-scout-17b-16e-instruct', // Latest LLaMA 4
  QWEN3: 'qwen/qwen3-32b' // Qwen 3 32B
} as const

/**
 * CEREBRAS MODELS (All Free!)
 * Official model names from https://inference-docs.cerebras.ai/api-reference/models
 */
export const CEREBRAS_MODELS = {
  // Best for SPEED & QUALITY
  LLAMA_70B: 'llama-3.3-70b', // 70B params - Most powerful (NEW!)

  // Best for BALANCE
  LLAMA_8B: 'llama3.1-8b', // 8B params - Fast & efficient

  // Latest Models
  LLAMA4_SCOUT: 'llama-4-scout-17b-16e-instruct', // LLaMA 4 Scout
  LLAMA4_MAVERICK: 'llama-4-maverick-17b-128e-instruct', // LLaMA 4 Maverick (preview)
  QWEN3_32B: 'qwen-3-32b', // Qwen 3 32B
  QWEN3_235B: 'qwen-3-235b-a22b-instruct-2507', // Qwen 3 235B (preview)
  GPT_OSS_120B: 'gpt-oss-120b' // GPT OSS 120B
} as const

/**
 * Gemini Provider (FREE & Unlimited)
 */
export class GeminiProvider {
  private ai = new GoogleGenerativeAI(API_KEYS.gemini)
  private model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' })

  async generate(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Gemini error:', error)
      throw error
    }
  }

  isAvailable(): boolean {
    return !!API_KEYS.gemini
  }
}

/**
 * Groq Provider (Code Analysis Specialist)
 */
export class GroqProvider {
  private baseURL = 'https://api.groq.com/openai/v1'

  async generate(prompt: string, model: string = GROQ_MODELS.CODE_EXPERT): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.groq}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 8192
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq error:', error)
      throw error
    }
  }

  isAvailable(): boolean {
    return !!API_KEYS.groq
  }
}

/**
 * Cerebras Provider (Speed Specialist)
 */
export class CerebrasProvider {
  private baseURL = 'https://api.cerebras.ai/v1'

  async generate(prompt: string, model: string = CEREBRAS_MODELS.LLAMA_70B): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.cerebras}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 8192,
          stream: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Cerebras API error: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Cerebras error:', error)
      throw error
    }
  }

  isAvailable(): boolean {
    return !!API_KEYS.cerebras
  }
}

/**
 * Optimized AI Router - Groq, Cerebras & Gemini
 */
export class OptimizedAIRouter {
  private gemini = new GeminiProvider()
  private groq = new GroqProvider()
  private cerebras = new CerebrasProvider()

  /**
   * Generate response with optimal provider selection
   */
  async generate(
    prompt: string,
    task: 'code-analysis' | 'profile-scan' | 'skill-extraction' | 'ai-detection' | 'general' | 'summary-generation'
  ): Promise<{
    response: string
    provider: string
    model: string
    latency: number
  }> {
    const startTime = Date.now()

    try {
      // Task-specific routing
      switch (task) {
        case 'code-analysis':
          // Use Groq GPT-OSS 120B for DEEP code understanding (if available)
          if (this.groq.isAvailable()) {
            const codeResponse = await this.groq.generate(prompt, GROQ_MODELS.CODE_EXPERT)
            return {
              response: codeResponse,
              provider: 'groq',
              model: GROQ_MODELS.CODE_EXPERT,
              latency: Date.now() - startTime
            }
          }
          // Fallback to Gemini
          console.log('Groq not available, using Gemini for code analysis')
          const codeFallback = await this.gemini.generate(prompt)
          return {
            response: codeFallback,
            provider: 'gemini-fallback',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }

        case 'profile-scan':
          // Use Cerebras LLaMA 70B for FAST profile scanning (if available)
          if (this.cerebras.isAvailable()) {
            const profileResponse = await this.cerebras.generate(prompt, CEREBRAS_MODELS.LLAMA_70B)
            return {
              response: profileResponse,
              provider: 'cerebras',
              model: CEREBRAS_MODELS.LLAMA_70B,
              latency: Date.now() - startTime
            }
          }
          // Fallback to Gemini
          console.log('Cerebras not available, using Gemini for profile scan')
          const profileFallback = await this.gemini.generate(prompt)
          return {
            response: profileFallback,
            provider: 'gemini-fallback',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }

        case 'skill-extraction':
          // Use Groq LLaMA 3.3 70B for ACCURATE skill extraction (if available)
          if (this.groq.isAvailable()) {
            const skillResponse = await this.groq.generate(prompt, GROQ_MODELS.VERSATILE)
            return {
              response: skillResponse,
              provider: 'groq',
              model: GROQ_MODELS.VERSATILE,
              latency: Date.now() - startTime
            }
          }
          // Fallback to Gemini
          console.log('Groq not available, using Gemini for skill extraction')
          const skillFallback = await this.gemini.generate(prompt)
          return {
            response: skillFallback,
            provider: 'gemini-fallback',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }

        case 'ai-detection':
          // Use Cerebras LLaMA 70B for FAST AI detection (if available)
          if (this.cerebras.isAvailable()) {
            const aiResponse = await this.cerebras.generate(prompt, CEREBRAS_MODELS.LLAMA_70B)
            return {
              response: aiResponse,
              provider: 'cerebras',
              model: CEREBRAS_MODELS.LLAMA_70B,
              latency: Date.now() - startTime
            }
          }
          // Fallback to Gemini
          console.log('Cerebras not available, using Gemini for AI detection')
          const aiFallback = await this.gemini.generate(prompt)
          return {
            response: aiFallback,
            provider: 'gemini-fallback',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }

        case 'summary-generation':
          // Use Gemini for professional summaries (FREE & UNLIMITED)
          const summaryResponse = await this.gemini.generate(prompt)
          return {
            response: summaryResponse,
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }

        case 'general':
        default:
          // Use Cerebras for general tasks (fastest) - or Gemini fallback
          if (this.cerebras.isAvailable()) {
            const generalResponse = await this.cerebras.generate(prompt, CEREBRAS_MODELS.LLAMA_8B)
            return {
              response: generalResponse,
              provider: 'cerebras',
              model: CEREBRAS_MODELS.LLAMA_8B,
              latency: Date.now() - startTime
            }
          }
          // Fallback to Gemini
          console.log('Cerebras not available, using Gemini for general tasks')
          const generalFallback = await this.gemini.generate(prompt)
          return {
            response: generalFallback,
            provider: 'gemini-fallback',
            model: 'gemini-2.5-flash',
            latency: Date.now() - startTime
          }
      }
    } catch (error) {
      // Ultimate fallback to Gemini if anything fails
      console.warn(`Primary provider failed, using Gemini fallback:`, error)

      try {
        const fallbackResponse = await this.gemini.generate(prompt)
        return {
          response: fallbackResponse,
          provider: 'gemini-ultimate-fallback',
          model: 'gemini-2.5-flash',
          latency: Date.now() - startTime
        }
      } catch (geminiError) {
        console.error('All AI providers failed:', geminiError)
        throw new Error('AI analysis failed - please check API configuration')
      }
    }
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      groq: {
        available: this.groq.isAvailable(),
        models: Object.values(GROQ_MODELS)
      },
      cerebras: {
        available: this.cerebras.isAvailable(),
        models: Object.values(CEREBRAS_MODELS)
      }
    }
  }
}

export const optimizedRouter = new OptimizedAIRouter()
