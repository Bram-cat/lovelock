// Simple AI Service - Direct API calls without complex queue/rate limiting
import { NumerologyProfile } from './NumerologyService';

// Environment variables
const GEMINI_KEY_1 = process.env.GOOGLE_AI_API_KEY || "AIzaSyAzAP3NQJyvY4rglOja86HFxjlJNjWzZJo";
const GEMINI_KEY_2 = process.env.BACKUP_GOOGLE_AI_API_KEY || "AIzaSyBiOdLCC50Gw5valCvGdaR1Umr3CKxYsBs";
const OPENAI_KEY = process.env.OPENAI_API_SECRET_KEY;

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface AIResponse {
  content: string;
  provider: 'gemini' | 'openai' | 'fallback';
}

export class SimpleAIService {
  
  private static async tryGemini(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private static async tryOpenAI(prompt: string): Promise<string> {
    if (!OPENAI_KEY) throw new Error('No OpenAI key');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private static getFallbackResponse(type: string): string {
    const fallbacks = {
      love: "Your love journey is unique and filled with potential. Trust your heart and stay open to meaningful connections.",
      numerology: "Your numbers reveal a path of growth and self-discovery. Embrace your unique gifts and trust your intuition.",
      oracle: "The universe has wonderful plans for you. Stay positive and open to the opportunities coming your way.",
      default: "Your path is filled with possibilities. Trust in yourself and the journey ahead."
    };

    return fallbacks[type as keyof typeof fallbacks] || fallbacks.default;
  }

  static async generateResponse(prompt: string, type: string = 'default'): Promise<AIResponse> {
    // Try Gemini Key 1
    try {
      const content = await this.tryGemini(prompt, GEMINI_KEY_1);
      if (content.trim()) {
        return { content: content.trim(), provider: 'gemini' };
      }
    } catch (error) {
      // Silent fail, try next
    }

    // Try Gemini Key 2
    try {
      const content = await this.tryGemini(prompt, GEMINI_KEY_2);
      if (content.trim()) {
        return { content: content.trim(), provider: 'gemini' };
      }
    } catch (error) {
      // Silent fail, try next
    }

    // Try OpenAI
    try {
      const content = await this.tryOpenAI(prompt);
      if (content.trim()) {
        return { content: content.trim(), provider: 'openai' };
      }
    } catch (error) {
      // Silent fail, use fallback
    }

    // Return fallback
    return { 
      content: this.getFallbackResponse(type), 
      provider: 'fallback' 
    };
  }

  // Numerology specific methods
  static async answerNumerologyQuestion(profile: NumerologyProfile, question: string): Promise<AIResponse> {
    const prompt = `You are a numerology expert. Based on this profile:
Life Path: ${profile.lifePathNumber}
Destiny: ${profile.destinyNumber}
Soul Urge: ${profile.soulUrgeNumber}

Question: "${question}"

Provide a helpful, encouraging 100-word response.`;

    return this.generateResponse(prompt, 'numerology');
  }

  static async generateLoveInsight(profile: NumerologyProfile): Promise<AIResponse> {
    const prompt = `Create a love insight for someone with Life Path ${profile.lifePathNumber}. 
Focus on relationship compatibility and romantic guidance. Keep it encouraging and under 80 words.`;

    return this.generateResponse(prompt, 'love');
  }

  static async generateCharacterAnalysis(profile: NumerologyProfile, name: string): Promise<AIResponse> {
    const prompt = `Analyze ${name}'s character based on:
Life Path: ${profile.lifePathNumber}
Destiny: ${profile.destinyNumber}

Provide key personality traits and strengths in 100 words.`;

    return this.generateResponse(prompt, 'numerology');
  }

  static async generateCelebrityMatch(userPath: number, celebrity: string, celebPath: number, score: number): Promise<AIResponse> {
    const prompt = `Explain why Life Path ${userPath} is ${score}% compatible with ${celebrity} (Life Path ${celebPath}). 
Keep it romantic and under 50 words.`;

    return this.generateResponse(prompt, 'love');
  }

  static async generateDeadlySinWarning(profile: NumerologyProfile): Promise<{sin: string, warning: string, consequences: string}> {
    const sins = ['Pride', 'Envy', 'Wrath', 'Sloth', 'Greed', 'Gluttony', 'Lust'];
    const randomSin = sins[profile.lifePathNumber % sins.length];
    
    return {
      sin: randomSin,
      warning: `Be mindful of ${randomSin.toLowerCase()} in your relationships.`,
      consequences: 'This could create barriers to authentic connection and trust.'
    };
  }
}

export default SimpleAIService;