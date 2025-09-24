// Simple AI Service - Direct API calls without complex queue/rate limiting
import { NumerologyProfile } from "./NumerologyService";

// Environment variables
const GEMINI_KEY_1 = process.env.GOOGLE_AI_API_KEY;
const GEMINI_KEY_2 = process.env.BACKUP_GOOGLE_AI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_SECRET_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface AIResponse {
  content: string;
  provider: "gemini" | "openai" | "fallback";
}

export class SimpleAIService {
  private static async tryGemini(
    prompt: string,
    apiKey: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  private static async tryOpenAI(prompt: string): Promise<string> {
    if (!OPENAI_KEY) throw new Error("No OpenAI key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private static getFallbackResponse(type: string): string {
    const fallbacks = {
      love: "Your love journey is unique and filled with potential. Trust your heart and stay open to meaningful connections.",
      numerology:
        "Your numbers reveal a path of growth and self-discovery. Embrace your unique gifts and trust your intuition.",
      oracle:
        "The universe has wonderful plans for you. Stay positive and open to the opportunities coming your way.",
      default:
        "Your path is filled with possibilities. Trust in yourself and the journey ahead.",
    };

    return fallbacks[type as keyof typeof fallbacks] || fallbacks.default;
  }

  static async generateResponse(
    prompt: string,
    type: string = "default"
  ): Promise<AIResponse> {
    // Try Gemini Key 1
    if (GEMINI_KEY_1) {
      try {
        const content = await this.tryGemini(prompt, GEMINI_KEY_1);
        if (content.trim()) {
          return { content: content.trim(), provider: "gemini" };
        }
      } catch (error) {
        // Silent fail, try next
      }
    }

    // Try Gemini Key 2
    if (GEMINI_KEY_2) {
      try {
        const content = await this.tryGemini(prompt, GEMINI_KEY_2);
        if (content.trim()) {
          return { content: content.trim(), provider: "gemini" };
        }
      } catch (error) {
        // Silent fail, try next
      }
    }

    // Try OpenAI
    try {
      const content = await this.tryOpenAI(prompt);
      if (content.trim()) {
        return { content: content.trim(), provider: "openai" };
      }
    } catch (error) {
      // Silent fail, use fallback
    }

    // Return fallback
    return {
      content: this.getFallbackResponse(type),
      provider: "fallback",
    };
  }

  // Numerology specific methods
  static async answerNumerologyQuestion(
    profile: NumerologyProfile,
    question: string
  ): Promise<AIResponse> {
    const prompt = `You are a numerology expert. Based on this profile:
Life Path: ${profile.lifePathNumber}
Destiny: ${profile.destinyNumber}
Soul Urge: ${profile.soulUrgeNumber}

Question: "${question}"

Provide a helpful, encouraging 100-word response.`;

    return this.generateResponse(prompt, "numerology");
  }

  static async generateLoveInsight(
    profile: NumerologyProfile
  ): Promise<AIResponse> {
    const prompt = `Create a love insight for someone with Life Path ${profile.lifePathNumber}. 
Focus on relationship compatibility and romantic guidance. Keep it encouraging and under 80 words.`;

    return this.generateResponse(prompt, "love");
  }

  static async generateCharacterAnalysis(
    profile: NumerologyProfile,
    name: string
  ): Promise<AIResponse> {
    const prompt = `Analyze ${name}'s character based on:
Life Path: ${profile.lifePathNumber}
Destiny: ${profile.destinyNumber}

Provide key personality traits and strengths in 100 words.`;

    return this.generateResponse(prompt, "numerology");
  }

  static async generateCelebrityMatch(
    userPath: number,
    celebrity: string,
    celebPath: number,
    score: number
  ): Promise<AIResponse> {
    const prompt = `Explain why Life Path ${userPath} is ${score}% compatible with ${celebrity} (Life Path ${celebPath}). 
Keep it romantic and under 50 words.`;

    return this.generateResponse(prompt, "love");
  }

  static async generateDeadlySinWarning(
    profile: NumerologyProfile
  ): Promise<{ sin: string; warning: string; consequences: string }> {
    const sins = [
      "Pride",
      "Envy",
      "Wrath",
      "Sloth",
      "Greed",
      "Gluttony",
    ];
    const randomSin = sins[profile.lifePathNumber % sins.length];

    return {
      sin: randomSin,
      warning: `Be mindful of ${randomSin.toLowerCase()} in your relationships.`,
      consequences:
        "This could create barriers to authentic connection and trust.",
    };
  }

  // Enhanced methods for Roxy API integration and optimized prompts

  // Generate personalized affirmation using Roxy data for enhanced accuracy
  static async generatePersonalizedAffirmation(
    name: string,
    roxyData: any,
    personalDayNumber: number
  ): Promise<string> {
    // Ultra-compressed prompt for maximum output from Gemini 1.5 Flash
    const prompt = `AFFIRMATION for ${name}:
Personal Day: ${personalDayNumber}
Life Path: ${roxyData?.life_path_number || "Unknown"}
Key Traits: ${roxyData?.strengths?.slice(0, 2)?.join(", ") || "Strong, Capable"}

Create one powerful "I am" affirmation. Keep it under 15 words. Make it personal and uplifting for today.

Format: "I am [specific trait] and I [specific action] with [specific quality]."`;

    try {
      const result = await this.generateResponse(prompt, "numerology");
      return result.content.trim().replace(/['"]/g, "").split("\n")[0]; // Take only first line
    } catch (error) {
      return this.getFallbackAffirmation(personalDayNumber);
    }
  }

  // Generate enhanced daily insights using Roxy data
  static async generateEnhancedDailyInsights(
    name: string,
    prokeralaData: any,
    personalDayNumber: number,
    currentDate: string
  ): Promise<string> {
    // Micro-prompt for maximum efficiency
    const prompt = `DAILY INSIGHT for ${name} (${currentDate}):
📊 Life Path ${prokeralaData?.life_path_number} | Personal Day ${personalDayNumber}
🎯 Strengths: ${prokeralaData?.strengths?.slice(0, 2)?.join(", ") || "Leadership, Intuition"}
💫 Lucky: ${prokeralaData?.lucky_colors?.slice(0, 2)?.join(", ") || "Blue, Gold"}

Write 3 sections (50 words each):
💝 LOVE: Romantic energy today
💼 CAREER: Professional opportunities  
🌟 SPIRITUAL: Personal growth focus

Use emojis. Be specific. Stay positive. Reference their numbers.`;

    try {
      const result = await this.generateResponse(prompt, "numerology");
      return result.content;
    } catch (error) {
      return "Your cosmic energy is aligned for growth and positive transformation today.";
    }
  }

  // Optimized character analysis using Roxy data - focus on character impact
  static async generateOptimizedCharacterAnalysis(
    name: string,
    prokeralaData: any
  ): Promise<string> {
    const prompt = `CHARACTER ANALYSIS for ${name}

PROFILE DATA:
- Strengths: ${prokeralaData?.strengths?.join(", ") || "Leadership, Intuition"}
- Challenges: ${prokeralaData?.challenges?.join(", ") || "Impatience, Perfectionism"}  
- Life Description: ${prokeralaData?.life_path_description || "Natural leader"}
- Career Guidance: ${prokeralaData?.career_guidance || "Leadership roles"}

Write 4 engaging paragraphs (45-55 words each):

1. **Core Essence**: Describe their natural personality, inner drive, and what makes them magnetic to others. Focus on how they show up in the world.

2. **Hidden Shadows**: Balance the positive with gentle insights about their challenging traits - what they struggle with, blind spots, or patterns that hold them back. Be kind but honest.

3. **Love & Relationships**: How they love, what they need from partners, their relationship patterns (both positive and areas for growth).

4. **Life Mission**: Their deeper purpose, what they're here to learn/teach, and how they can fulfill their potential.

Use "you" voice. Be specific to ${name}. Don't mention numbers. Focus on character impact and real-life implications.`;

    try {
      const result = await this.generateResponse(prompt, "numerology");
      return result.content;
    } catch (error) {
      return "You possess a unique blend of strength and sensitivity that draws people to you. Your natural leadership abilities shine through in everything you do, though you sometimes struggle with perfectionism that can create unnecessary pressure. In relationships, you bring deep loyalty and passion, yet learning to be vulnerable remains an ongoing journey. Your life purpose centers on inspiring others while discovering that your greatest strength lies in embracing both your light and shadow with equal compassion.";
    }
  }

  private static getFallbackAffirmation(personalDayNumber: number): string {
    const affirmations: { [key: number]: string } = {
      1: "I am a powerful leader creating positive change today",
      2: "I am harmoniously connected to peace and love",
      3: "I am creatively expressing my authentic joyful self",
      4: "I am building solid foundations for lasting success",
      5: "I am freely exploring exciting new possibilities",
      6: "I am nurturing love and healing in my world",
      7: "I am wise and deeply connected to inner truth",
      8: "I am achieving my goals with focused determination",
      9: "I am compassionately serving with universal love",
    };
    return affirmations[personalDayNumber] || affirmations[1];
  }

  // OPTIMIZED: Get multiple insights in ONE API call to reduce Gemini requests
  static async generateAllNumerologyInsights(
    name: string,
    profile: NumerologyProfile | any,
    type: "full" | "character-only" = "character-only"
  ): Promise<{
    characterAnalysis: string;
    deadlySinWarning?: { sin: string; warning: string; consequences: string };
    loveInsights?: string;
    dailyAdvice?: string;
  }> {
    const lifePathNumber = profile.life_path_number || profile.lifePathNumber;
    const destinyNumber = profile.destiny_number || profile.destinyNumber;
    const soulUrgeNumber = profile.soul_urge_number || profile.soulUrgeNumber;

    // Always use character-only to avoid complex JSON parsing issues
    const prompt = `COMPREHENSIVE NUMEROLOGY ANALYSIS for ${name}

**CORE DATA:**
- Life Path: ${lifePathNumber}
- Destiny: ${destinyNumber} 
- Soul Urge: ${soulUrgeNumber}
- Strengths: ${profile.strengths?.join(", ") || "Leadership, Intuition"}
- Challenges: ${profile.challenges?.join(", ") || "Impatience, Perfectionism"}

**GENERATE CHARACTER ANALYSIS:**
Write 4 focused paragraphs (50 words each):

1. **Core Personality**: What makes ${name} magnetic and unique. Their inner drive and how they show up in the world.

2. **Natural Talents**: Their superpowers and gifts. What they excel at naturally.

3. **Love Style**: How they love, what they need in relationships, their romantic energy.

4. **Life Purpose**: Their deeper mission and spiritual path. What they're here to teach/learn.

Use "you" language throughout. Be specific, encouraging, and insightful.`;

    try {
      const result = await this.generateResponse(prompt, "numerology");
      return { characterAnalysis: result.content };
    } catch (error) {
      return {
        characterAnalysis:
          "You possess a unique blend of strength and sensitivity that draws people to you. Your natural leadership abilities shine through in everything you do, though you sometimes struggle with perfectionism that can create unnecessary pressure. In relationships, you bring deep loyalty and passion, yet learning to be vulnerable remains an ongoing journey. Your life purpose centers on inspiring others while discovering that your greatest strength lies in embracing both your light and shadow with equal compassion.",
      };
    }
  }
}

export default SimpleAIService;
