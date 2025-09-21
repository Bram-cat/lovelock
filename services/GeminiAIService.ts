// Gemini AI Service for Numerology Q&A
import { NumerologyProfile } from "./NumerologyService";
// import { GoogleGenerativeAI } from "@google/genai";
// Get API keys from environment variables with dual key support
const PRIMARY_GEMINI_API_KEY =
  process.env.GOOGLE_AI_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;

const BACKUP_GEMINI_API_KEY =
  process.env.BACKUP_GOOGLE_AI_API_KEY;

// Primary Gemini API Key loaded
// Backup Gemini API Key loaded
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface AIProgressCallback {
  onRetry?: (attempt: number, maxRetries: number, delayMs: number) => void;
  onProgress?: (message: string) => void;
}

export class GeminiAIService {
  private static readonly MAX_RETRIES = 4;
  private static readonly BASE_DELAY = 2000; // 2 seconds
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 3000; // Reduced to 3 seconds for better UX
  private static readonly RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown after consecutive rate limits
  private static consecutiveRateLimits = 0;
  private static currentApiKeyIndex = 0; // Track which API key to use
  private static readonly API_KEYS = [PRIMARY_GEMINI_API_KEY, BACKUP_GEMINI_API_KEY];

  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await this.delay(waitTime);
    }

    this.lastRequestTime = Date.now();
    const result = await requestFn();
    return result;
  }

  static switchToNextApiKey() {
    this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.API_KEYS.length;
    console.log(`🔄 Switched to API key index ${this.currentApiKeyIndex}`);
  }

  static getCurrentApiKey(): string {
    if (this.API_KEYS.length === 0) {
      throw new Error('No Gemini API keys configured. Please check your environment variables.');
    }
    const apiKey = this.API_KEYS[this.currentApiKeyIndex];
    if (!apiKey) {
      throw new Error('Invalid API key configuration');
    }
    return apiKey;
  }

  async generateContent(
    prompt: string,
    retryCount: number = 0,
    progressCallback?: AIProgressCallback
  ): Promise<string> {
    const currentApiKey = GeminiAIService.getCurrentApiKey();
    
    if (!currentApiKey || currentApiKey === "YOUR_GEMINI_API_KEY_HERE") {
      console.error("❌ Gemini API key not configured:", currentApiKey);
      throw new Error(
        "Gemini API key not configured. Please set GOOGLE_AI_API_KEY in your environment variables."
      );
    }

    console.log(
      `✅ Using Gemini API key (index ${GeminiAIService.currentApiKeyIndex}):`,
      currentApiKey.substring(0, 15) + "..."
    );
    console.log('🔗 Full API URL:', `${GEMINI_API_URL}?key=${currentApiKey.substring(0, 10)}...`);

    if (retryCount >= GeminiAIService.MAX_RETRIES) {
      throw new Error("Max retries exceeded for Gemini API");
    }

    try {
      progressCallback?.onProgress?.(
        `Generating AI response... (attempt ${retryCount + 1})`
      );

      console.log('🚀 Making Gemini API request to:', GEMINI_API_URL);
      console.log('🔧 Request payload preview:', {
        prompt: prompt.substring(0, 100) + '...',
        promptLength: prompt.length
      });

      const response = await GeminiAIService.rateLimitedRequest(async () => {
        console.log('📡 Making fetch request to Gemini API...');
        
        try {
          const currentApiKey = GeminiAIService.getCurrentApiKey();
          const result = await fetch(`${GEMINI_API_URL}?key=${currentApiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 32,
                topP: 0.8,
                maxOutputTokens: 2048,
              },
            }),
          });

          console.log('📡 Fetch completed, response:', result ? 'received' : 'undefined');
          
          if (!result) {
            throw new Error('Fetch returned undefined response');
          }

          if (!result.ok) {
            const errorText = await result.text();
            console.error('🔴 Gemini API Error Details:', {
              status: result.status,
              statusText: result.statusText,
              errorText: errorText,
              headers: Object.fromEntries(result.headers.entries())
            });
            
            throw new Error(`Gemini API Error: ${result.status} - ${errorText}`);
          }

          return result;
        } catch (fetchError: any) {
          console.error('🔴 Fetch error:', fetchError.message);
          throw fetchError;
        }
      });

      const data: GeminiResponse = await response.json();

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response from Gemini API");
      }

      const content = data.candidates[0].content.parts[0].text.trim();

      // Reset consecutive rate limits on success
      GeminiAIService.consecutiveRateLimits = 0;

      return content;
    } catch (error: any) {
      console.error(
        `Gemini API attempt ${retryCount + 1} failed:`,
        error.message
      );

      // Handle rate limiting and API key switching
      if (
        error.message.includes("429") ||
        error.message.includes("rate limit") ||
        error.message.includes("quota") ||
        error.message.includes("403")
      ) {
        console.log(`🔑 API key ${GeminiAIService.currentApiKeyIndex} hit limits, switching to backup`);
        GeminiAIService.switchToNextApiKey();
        
        // If we've tried both keys and still hitting limits, wait longer
        if (GeminiAIService.currentApiKeyIndex === 0) {
          GeminiAIService.consecutiveRateLimits++;
          const exponentialDelay =
            GeminiAIService.BASE_DELAY * Math.pow(2, retryCount) +
            GeminiAIService.consecutiveRateLimits *
              GeminiAIService.RATE_LIMIT_COOLDOWN;

          progressCallback?.onRetry?.(
            retryCount + 1,
            GeminiAIService.MAX_RETRIES,
            exponentialDelay
          );

          console.log(
            `All API keys hit limits. Waiting ${exponentialDelay}ms before retry ${retryCount + 1}...`
          );
          await GeminiAIService.delay(exponentialDelay);
        } else {
          // Quick retry with backup key
          console.log('🚀 Retrying immediately with backup API key');
          await GeminiAIService.delay(1000); // Short delay
        }

        return this.generateContent(prompt, retryCount + 1, progressCallback);
      }

      // For other errors, also retry with exponential backoff
      if (retryCount < GeminiAIService.MAX_RETRIES - 1) {
        const delay = GeminiAIService.BASE_DELAY * Math.pow(2, retryCount);
        progressCallback?.onRetry?.(
          retryCount + 1,
          GeminiAIService.MAX_RETRIES,
          delay
        );

        console.log(`Retrying in ${delay}ms...`);
        await GeminiAIService.delay(delay);

        return this.generateContent(prompt, retryCount + 1, progressCallback);
      }

      throw error;
    }
  }

  private buildNumerologyContext(profile: NumerologyProfile): string {
    return `
NUMEROLOGY PROFILE CONTEXT:
- Life Path Number: ${profile.lifePathNumber} (${profile.lifePathInfo?.title})
- Destiny Number: ${profile.destinyNumber} (${profile.destinyInfo?.title})
- Soul Urge Number: ${profile.soulUrgeNumber} (${profile.soulUrgeInfo?.title})
- Personality Number: ${profile.personalityNumber} (${profile.personalityInfo?.title})
- Personal Year: ${profile.personalYearNumber}

PERSONALITY INSIGHTS:
- Life Path Description: ${profile.lifePathInfo?.description}
- Strengths: ${profile.lifePathInfo?.strengths?.join(", ")}
- Challenges: ${profile.lifePathInfo?.challenges?.join(", ")}
- Career Paths: ${profile.lifePathInfo?.careerPaths?.join(", ")}
- Relationship Style: ${profile.lifePathInfo?.relationships}

DESTINY INSIGHTS:
- Purpose: ${profile.destinyInfo?.purpose}
- Description: ${profile.destinyInfo?.description}

This person is seeking guidance about their numerological profile. Please provide insightful, encouraging, and specific advice based on these numbers.
    `;
  }

  static async answerNumerologyQuestion(
    profile: NumerologyProfile,
    question: string,
    progressCallback?: AIProgressCallback
  ): Promise<string> {
    const service = new GeminiAIService();
    const context = service.buildNumerologyContext(profile);
    
    const prompt = `${context}

QUESTION: "${question}"

Please provide a thoughtful, encouraging response that:
1. References specific aspects of their numerology numbers
2. Offers practical guidance
3. Maintains a positive and supportive tone
4. Keeps the response under 200 words
5. Addresses their question directly using their numerological insights

Response:`;

    return await service.generateContent(prompt, 0, progressCallback);
  }

  static async generatePersonalizedCharacterAnalysis(
    profile: NumerologyProfile,
    fullName: string
  ): Promise<string> {
    const service = new GeminiAIService();
    const prompt = `Generate a detailed character analysis for ${fullName} based on their numerology profile:

Life Path: ${profile.lifePathNumber}
Destiny: ${profile.destinyNumber} 
Soul Urge: ${profile.soulUrgeNumber}
Personality: ${profile.personalityNumber}

Please provide:
1. Core personality traits
2. Natural talents and gifts
3. Life purpose and mission
4. How others perceive them
5. Areas for personal growth
6. Unique characteristics of this number combination

Keep it encouraging, insightful, and personalized. Limit to 150 words.`;

    return await service.generateContent(prompt);
  }

  static async generatePersonalizedPredictions(
    profile: NumerologyProfile,
    fullName: string
  ): Promise<string> {
    const service = new GeminiAIService();
    const context = service.buildNumerologyContext(profile);
    
    const prompt = `${context}

Generate personalized predictions for ${fullName} for the next 6-12 months based on their numerology profile.

Focus on:
1. Career and professional opportunities
2. Relationships and personal connections
3. Personal growth and spiritual development
4. Challenges to be aware of and how to overcome them
5. Lucky periods and best timing for major decisions

Keep it encouraging, specific, and actionable. Limit to 200 words.`;

    return await service.generateContent(prompt);
  }

  static async generateDeadlySinWarning(
    profile: NumerologyProfile,
    fullName: string
  ): Promise<{
    sin: string;
    warning: string;
    consequences: string;
  }> {
    const service = new GeminiAIService();
    const prompt = `Based on ${fullName}'s numerology profile (Life Path: ${profile.lifePathNumber}, Destiny: ${profile.destinyNumber}), identify their primary spiritual challenge from the seven deadly sins (Pride, Envy, Wrath, Sloth, Greed, Gluttony, Lust).

Respond in this exact format:
SIN: [specific sin]
WARNING: [brief spiritual warning about this tendency]
CONSEQUENCES: [how this could impact relationships and trust]

Keep each section under 30 words and focus on spiritual growth.`;

    const response = await service.generateContent(prompt);
    
    // Parse the response
    const sinMatch = response.match(/SIN:\s*([^\n]+)/i);
    const warningMatch = response.match(/WARNING:\s*([^\n]+)/i);
    const consequencesMatch = response.match(/CONSEQUENCES:\s*([^\n]+)/i);

    return {
      sin: sinMatch ? sinMatch[1].trim() : 'Pride',
      warning: warningMatch ? warningMatch[1].trim() : 'Be mindful of ego and stay humble in relationships.',
      consequences: consequencesMatch ? consequencesMatch[1].trim() : 'May create barriers to authentic connection and trust.',
    };
  }

  static async generateAdvancedPrompt(prompt: string): Promise<string> {
    const service = new GeminiAIService();
    return await service.generateContent(prompt);
  }

  static async generateCelebrityMatchReason(
    userLifePath: number,
    celebrityName: string,
    celebrityLifePath: number,
    compatibilityScore: number
  ): Promise<string> {
    const service = new GeminiAIService();
    const prompt = `Explain why someone with Life Path ${userLifePath} is ${compatibilityScore}% compatible with ${celebrityName} (Life Path ${celebrityLifePath}).

Keep it:
- Under 50 words
- Romantic but realistic
- Focused on personality compatibility
- Encouraging and positive

Format: "You and ${celebrityName} share [specific trait/energy]. This ${compatibilityScore}% compatibility suggests [reason for connection]. [Encouraging insight about the match]."`;

    return await service.generateContent(prompt);
  }
}

export default GeminiAIService;
