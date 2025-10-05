// Simple AI Service - Direct API calls without complex queue/rate limiting
import { NumerologyProfile } from "./NumerologyService";

// Environment variables (use EXPO_PUBLIC_ prefix for client-side access)
const GEMINI_KEY_1 = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const GEMINI_KEY_2 = process.env.EXPO_PUBLIC_BACKUP_GOOGLE_AI_API_KEY || process.env.BACKUP_GOOGLE_AI_API_KEY;
const DEEPSEEK_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_AI_API_KEY || process.env.DEEPSEEK_AI_API_KEY;
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_SECRET_KEY || process.env.OPENAI_API_SECRET_KEY;
const ROXY_TOKEN = process.env.ROXY_TOKEN || process.env.EXPO_PUBLIC_ROXY_TOKEN;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// Environment keys loaded for production use

interface AIResponse {
  content: string;
  provider: "gemini" | "deepseek" | "openai" | "roxy" | "fallback";
}

export class SimpleAIService {
  private static async tryGemini(
    prompt: string,
    apiKey: string,
    maxRetries: number = 3
  ): Promise<string> {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(GEMINI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 800,
              topP: 0.95,
              topK: 30,
            },
          }),
        });

        if (response.status === 429) {
          // Rate limited - wait with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`🔴 Gemini API error ${response.status}:`, errorText);
          throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (content.trim()) {
          console.log(`✅ Gemini API success:`, content.substring(0, 50) + "...");
          return content.trim();
        } else {
          console.log(`⚠️ Empty response from Gemini API:`, JSON.stringify(data, null, 2));
          throw new Error("Empty response from Gemini");
        }
      } catch (error) {
        console.log(`Gemini attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error("Max retries exceeded");
  }

  private static async tryRoxy(prompt: string, timeoutMs: number = 10000): Promise<string> {
    if (!ROXY_TOKEN) throw new Error("No Roxy token");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Roxy API for AI text generation with the token as query parameter
      const url = `https://roxyapi.com/api/v1/data/news?token=${ROXY_TOKEN}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Roxy API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Roxy API success:`, JSON.stringify(data).substring(0, 100) + "...");

      // Extract useful content from Roxy response
      if (data && data.success && data.data) {
        return JSON.stringify(data.data);
      }

      throw new Error("Empty response from Roxy");
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Roxy API timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  private static async tryDeepSeek(prompt: string): Promise<string> {
    if (!DEEPSEEK_KEY) throw new Error("No DeepSeek key");

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
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
      love: [
        "Your heart holds ancient wisdom. Trust its guidance today.",
        "Love flows through your cosmic pathway. Open your soul to receive.",
        "The universe aligns hearts in perfect timing. Your moment approaches.",
      ],
      numerology: [
        "Your cosmic numbers reveal hidden strengths waiting to emerge.",
        "The stars have blessed you with unique gifts. Let them shine.",
        "Your numerical blueprint holds secrets of divine potential.",
        "Ancient wisdom flows through your life path. Trust the journey.",
      ],
      oracle: [
        "The universe whispers secrets. Listen with your soul.",
        "Cosmic energies swirl around you. Embrace their guidance.",
        "Your spirit carries ancient knowledge. Trust your intuition.",
      ],
      default: [
        "Divine energy flows through you. Embrace your power.",
        "The cosmos conspires for your highest good.",
        "Your soul knows the way. Trust the process.",
      ],
    };

    const responseArray = fallbacks[type as keyof typeof fallbacks] || fallbacks.default;
    const randomIndex = Math.floor(Math.random() * responseArray.length);
    return responseArray[randomIndex];
  }

  static async generateResponse(
    prompt: string,
    type: string = "default"
  ): Promise<AIResponse> {
    console.log(`🤖 AI Request (${type}):`, prompt.substring(0, 100) + "...");
    console.log(`🔑 Available keys: Gemini1=${!!GEMINI_KEY_1}, Gemini2=${!!GEMINI_KEY_2}, DeepSeek=${!!DEEPSEEK_KEY}, Roxy=${!!ROXY_TOKEN}, OpenAI=${!!OPENAI_KEY}`);

    // Try Gemini Key 1
    if (GEMINI_KEY_1) {
      try {
        console.log(`🔑 Trying Gemini Key 1 (length: ${GEMINI_KEY_1.length})...`);
        const content = await this.tryGemini(prompt, GEMINI_KEY_1);
        if (content.trim()) {
          console.log(`✅ Gemini Key 1 success!`);
          return { content: content.trim(), provider: "gemini" };
        }
      } catch (error) {
        console.log(`❌ Gemini Key 1 failed:`, error.message);
      }
    } else {
      console.log(`⚠️ No Gemini Key 1 configured`);
    }

    // Try Gemini Key 2
    if (GEMINI_KEY_2) {
      try {
        console.log(`🔑 Trying Gemini Key 2...`);
        const content = await this.tryGemini(prompt, GEMINI_KEY_2);
        if (content.trim()) {
          console.log(`✅ Gemini Key 2 success!`);
          return { content: content.trim(), provider: "gemini" };
        }
      } catch (error) {
        console.log(`❌ Gemini Key 2 failed:`, error.message);
      }
    } else {
      console.log(`⚠️ No Gemini Key 2 configured`);
    }

    // Try DeepSeek AI
    if (DEEPSEEK_KEY) {
      try {
        console.log(`🔑 Trying DeepSeek AI...`);
        const content = await this.tryDeepSeek(prompt);
        if (content.trim()) {
          console.log(`✅ DeepSeek success!`);
          return { content: content.trim(), provider: "deepseek" };
        }
      } catch (error) {
        console.log(`❌ DeepSeek failed:`, error.message);
      }
    } else {
      console.log(`⚠️ No DeepSeek key configured`);
    }

    // Try Roxy API with 10-second timeout
    if (ROXY_TOKEN) {
      try {
        console.log(`🔑 Trying Roxy API (10s timeout)...`);
        const content = await this.tryRoxy(prompt, 10000);
        if (content.trim()) {
          console.log(`✅ Roxy API success!`);
          return { content: content.trim(), provider: "roxy" };
        }
      } catch (error) {
        console.log(`❌ Roxy API failed:`, error.message);
      }
    } else {
      console.log(`⚠️ No Roxy token configured`);
    }

    // Try OpenAI
    try {
      console.log(`🔑 Trying OpenAI...`);
      const content = await this.tryOpenAI(prompt);
      if (content.trim()) {
        console.log(`✅ OpenAI success!`);
        return { content: content.trim(), provider: "openai" };
      }
    } catch (error) {
      console.log(`❌ OpenAI failed:`, error.message);
    }

    // Return fallback
    console.log(`🛡️ Using fallback response for type: ${type}`);
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
    // Include rich Roxy API data if available
    const roxyData = profile.roxyInsights ? `

Professional Insights from Advanced Numerology Analysis:
- Strengths: ${profile.roxyInsights.strengths?.join(', ') || 'Not analyzed'}
- Challenges: ${profile.roxyInsights.challenges?.join(', ') || 'Not analyzed'}
- Career Guidance: ${profile.roxyInsights.career || 'Not available'}
- Relationship Guidance: ${profile.roxyInsights.relationship || 'Not available'}
- Spiritual Path: ${profile.roxyInsights.spiritual || 'Not available'}
- Lucky Numbers: ${profile.roxyInsights.luckyNumbers?.join(', ') || 'Not calculated'}
- Personal Year: ${profile.roxyInsights.personalYear || 'Not calculated'}
- Life Path Description: ${profile.roxyInsights.lifePathDescription || 'Not available'}` : '';

    const prompt = `You are a mystical oracle with access to ${profile.name || 'this soul'}'s complete numerological blueprint. Answer their question with deep personal insight.

THEIR NUMEROLOGY PROFILE:
- Life Path ${profile.lifePathNumber}: ${profile.lifePathInfo?.title || 'The Seeker'}
- Destiny Number: ${profile.destinyNumber || 'Unknown'}
- Soul Urge: ${profile.soulUrgeNumber || 'Unknown'}${roxyData}

QUESTION: "${question}"

INSTRUCTIONS:
- Give a personalized response (25-40 words) using their specific numerology data
- Reference their actual strengths, challenges, or guidance from above
- Use mystical language but make it personally relevant to them
- Provide actionable cosmic guidance based on their numbers

RESPONSE:`;

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
    const prompt = `You are analyzing ${name}'s life character and soul essence. Write a deeply personal narrative that feels like you truly know them.

THEIR CORE TRAITS:
- Natural Gifts: ${prokeralaData?.strengths?.join(", ") || "Leadership, Intuition, Vision"}
- Growth Areas: ${prokeralaData?.challenges?.join(", ") || "Impatience, Perfectionism"}
- Life Theme: ${prokeralaData?.life_path_description || "Natural-born leader destined to inspire"}
- Career Path: ${prokeralaData?.career_guidance || "Leadership and creative roles"}
- Love Style: ${prokeralaData?.relationship_guidance || "Passionate, loyal, needs independence"}

Write a flowing narrative in 4 rich paragraphs (60-75 words each):

**Paragraph 1 - WHO THEY ARE**: Paint a vivid picture of their personality. How do they walk into a room? What energy do they radiate? What do people feel when they meet ${name}? Focus on their magnetic qualities, their vibe, how they make others feel. Describe their spirit, not their numbers.

**Paragraph 2 - THEIR INNER WORLD**: Dive into what drives them emotionally. What keeps them up at night? What makes their heart race? What are they secretly afraid of? What shadows do they wrestle with? Be compassionate but truthful about their struggles and the lessons they're learning.

**Paragraph 3 - HOW THEY LOVE**: Describe their love language and relationship dynamics. How do they fall in love? What do they crave from a partner? Where do they shine in intimacy? What patterns sabotage their connections? What does ${name} need to learn about vulnerability and trust?

**Paragraph 4 - THEIR DESTINY**: What is ${name} here to do? Not in abstract terms, but in real life. What impact will they have? What legacy are they building? How will they transform themselves and others? What's their unique gift to the world?

STYLE GUIDELINES:
- Use "you" and "${name}" interchangeably for intimacy
- Write like a wise friend who truly sees them
- Be poetic but grounded in real life
- NO numerology jargon or number references
- Focus on lived experience, emotions, relationships, purpose
- Balance encouragement with honest insight
- Make it feel personal, not generic`;

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

    // Get additional insights from Roxy API data if available
    const roxyInsights = profile.roxyInsights || {};
    const hasRoxyData = roxyInsights && Object.keys(roxyInsights).length > 0;

    const prompt = `Create a personalized character summary for ${name} using their numerology data:

CORE NUMBERS:
- Life Path ${lifePathNumber}: ${roxyInsights.lifePathDescription || "Your life journey and purpose"}
- Destiny ${destinyNumber}: Your ultimate life mission
- Soul Urge ${soulUrgeNumber}: Your inner desires and motivations

PERSONALITY INSIGHTS:
- Strengths: ${profile.strengths?.join(", ") || roxyInsights.strengths?.join(", ") || "Leadership, Intuition"}
- Challenges: ${profile.challenges?.join(", ") || roxyInsights.challenges?.join(", ") || "Perfectionism, Impatience"}
${hasRoxyData ? `
PROFESSIONAL GUIDANCE:
- Career: ${roxyInsights.career || "Focus on leadership roles"}
- Relationships: ${roxyInsights.relationship || "Seek harmony and understanding"}
- Spiritual Path: ${roxyInsights.spiritual || "Trust your intuition"}` : ''}

Write ONE personalized paragraph (25-35 words) that captures their unique essence. Use "you" language, be encouraging and mystical. Reference specific traits from their data. NO asterisks.`;

    try {
      const result = await this.generateResponse(prompt, "numerology");
      console.log("✅ Character analysis generated:", result.content?.substring(0, 50) + "...");
      return { characterAnalysis: result.content };
    } catch (error) {
      console.log("❌ Character analysis failed, using fallback:", error.message);
      return {
        characterAnalysis:
          "You possess a unique blend of strength and sensitivity that naturally draws people to your inspiring leadership energy.",
      };
    }
  }
}

export default SimpleAIService;
