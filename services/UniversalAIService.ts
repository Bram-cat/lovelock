// Universal AI Service using Official OpenAI SDK
import OpenAI from "openai";
import { NumerologyProfile } from "./NumerologyService";
import GeminiAIService from "./GeminiAIService";
import { SubscriptionService } from "./SubscriptionService";

export interface AIProgressCallback {
  onRetry?: (attempt: number, maxRetries: number, delayMs: number) => void;
  onProgress?: (message: string) => void;
}

// Get OpenAI API key from environment variables
const OPENAI_API_KEY =
  process.env.OPENAI_API_SECRET_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_SECRET_KEY;
console.log(
  "🔑 OpenAI API Key loaded:",
  OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : "NOT FOUND"
);

if (!OPENAI_API_KEY) {
  console.error("❌ OpenAI API Key not found in environment variables");
}

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow in React Native/Expo environment
});

export enum AIProvider {
  GEMINI = "gemini",
  OPENAI = "openai",
}

interface AIServiceConfig {
  preferredProvider?: AIProvider;
  enableFallback?: boolean;
  maxRetries?: number;
}

export class UniversalAIService {
  private static preferredProvider: AIProvider = AIProvider.GEMINI; // Use Gemini as primary with dual API key support

  // Enhanced Rate Limiting - Proper Implementation
  private static requestTimes: number[] = [];
  private static readonly MAX_REQUESTS_PER_MINUTE = 50; // Conservative for free tier
  private static readonly MAX_REQUESTS_PER_SECOND = 1; // Very conservative to avoid 429s
  private static readonly RATE_WINDOW_MINUTE = 60000; // 1 minute
  private static readonly RATE_WINDOW_SECOND = 1000; // 1 second
  private static readonly MIN_REQUEST_DELAY = 1200; // 1.2 seconds between requests

  // Gemini failure tracking
  private static geminiFailureCount = 0;
  private static lastGeminiFailure = 0;
  private static readonly MAX_GEMINI_FAILURES = 3;
  private static readonly GEMINI_COOLDOWN = 300000; // 5 minutes

  // OpenAI tracking
  private static openAICallTimes: number[] = [];
  private static readonly OPENAI_RATE_WINDOW = 60000; // 1 minute
  private static readonly OPENAI_MAX_REQUESTS_PER_SECOND = 1;

  // Request Queue Management
  private static requestQueue: Array<{
    resolve: Function;
    reject: Function;
    prompt: string;
    progressCallback?: AIProgressCallback;
    priority: number;
    userId?: string;
    feature?:
      | "numerology"
      | "loveMatch"
      | "trustAssessment"
      | "dailyInsights"
      | "oracle"
      | "celebrityMatch";
  }> = [];
  private static isProcessingQueue = false;

  // Response Caching
  private static responseCache = new Map<
    string,
    { content: string; timestamp: number }
  >();
  private static readonly CACHE_DURATION = 600000; // 10 minutes for better efficiency

  // Comprehensive Rate Limiting Implementation
  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    // Clean old request times (both per-second and per-minute)
    this.requestTimes = this.requestTimes.filter(
      (time) => now - time < this.RATE_WINDOW_MINUTE
    );

    const recentRequests = this.requestTimes.filter(
      (time) => now - time < this.RATE_WINDOW_SECOND
    );

    // Check per-minute limit
    if (this.requestTimes.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = this.RATE_WINDOW_MINUTE - (now - oldestRequest) + 1000; // 1s buffer

      console.log(
        `🚦 Per-minute rate limit: Waiting ${Math.round(waitTime / 1000)}s (${this.requestTimes.length}/${this.MAX_REQUESTS_PER_MINUTE})`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.enforceRateLimit(); // Recheck after waiting
    }

    // Check per-second limit
    if (recentRequests.length >= this.MAX_REQUESTS_PER_SECOND) {
      const waitTime = this.RATE_WINDOW_SECOND + 200; // Extra buffer
      console.log(`🚦 Per-second rate limit: Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.enforceRateLimit(); // Recheck after waiting
    }

    // Enforce minimum delay between requests
    if (this.requestTimes.length > 0) {
      const lastRequest = Math.max(...this.requestTimes);
      const timeSinceLastRequest = now - lastRequest;

      if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
        const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
        console.log(`⏳ Minimum delay enforcement: Waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Record this request
    this.requestTimes.push(Date.now());
  }

  // Check cache for existing response
  private static getCachedResponse(prompt: string): string | null {
    const cacheKey = this.generateCacheKey(prompt);
    const cached = this.responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("💾 Using cached response for prompt");
      return cached.content;
    }

    return null;
  }

  // Store response in cache
  private static setCachedResponse(prompt: string, content: string): void {
    const cacheKey = this.generateCacheKey(prompt);
    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.responseCache.delete(key);
      }
    }
  }

  // Generate cache key from prompt
  private static generateCacheKey(prompt: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static async makeOpenAIRequest(
    prompt: string,
    userId?: string,
    feature?:
      | "numerology"
      | "loveMatch"
      | "trustAssessment"
      | "dailyInsights"
      | "oracle"
      | "celebrityMatch",
    progressCallback?: AIProgressCallback,
    priority: number = 1
  ): Promise<string> {
    // Check cache first
    const cachedResponse = this.getCachedResponse(prompt);
    if (cachedResponse) {
      console.log("💾 Using cached response");
      return cachedResponse;
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    try {
      progressCallback?.onProgress?.("Oracle is channeling cosmic wisdom...");

      console.log("🚀 Making OpenAI request with SDK");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use GPT-4o (GPT-4 Omni) which is widely available
        messages: [
          {
            role: "system",
            content: `You are Oracle, a wise astrology and numerology AI assistant providing personalized insights. 
            
            Guidelines:
            - Respond with warmth, wisdom, and encouragement
            - Keep responses under 200 words and be specific to the person's numbers
            - Never mention OpenAI, GPT, or AI - you are simply "Oracle, your personal guide"
            - Focus on actionable insights and positive guidance
            - Use mystical but grounded language
            - Be specific to numerology and astrology contexts`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      console.log("✅ OpenAI Response received successfully");

      const content = completion.choices[0]?.message?.content?.trim();

      if (!content) {
        console.error("❌ No content in OpenAI response");
        throw new Error("No content received from OpenAI");
      }

      console.log("📝 Response preview:", content.substring(0, 100) + "...");

      // Record usage analytics if user ID provided
      if (userId && feature) {
        const promptTokens = completion.usage?.prompt_tokens || 0;
        const completionTokens = completion.usage?.completion_tokens || 0;
        const estimatedCost = this.calculateOpenAICost(
          promptTokens,
          completionTokens
        );

        await SubscriptionService.recordAIUsage(
          userId,
          feature,
          "openai",
          estimatedCost,
          promptTokens,
          completionTokens
        );
      }

      // Cache the response
      this.setCachedResponse(prompt, content);

      return content;
    } catch (error: any) {
      console.error("❌ OpenAI request failed:", error.message);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        console.log("⚠️ Rate limit hit - using fallback content");
        const fallbackContent = this.getFallbackContent(prompt);
        this.setCachedResponse(prompt, fallbackContent);
        return fallbackContent;
      }

      if (error.status === 401) {
        console.error("🔑 Authentication error - check API key");
        const fallbackContent = this.getFallbackContent(prompt);
        this.setCachedResponse(prompt, fallbackContent);
        return fallbackContent;
      }

      if (error.status >= 500) {
        console.log("🔧 Server error - using fallback content");
        const fallbackContent = this.getFallbackContent(prompt);
        this.setCachedResponse(prompt, fallbackContent);
        return fallbackContent;
      }

      // For other errors, still provide fallback
      console.log("⚙️ Unknown error - using fallback content");
      const fallbackContent = this.getFallbackContent(prompt);
      this.setCachedResponse(prompt, fallbackContent);
      return fallbackContent;
    }
  }

  // Fallback content for different types of requests
  private static getFallbackContent(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("daily insight")) {
      const insights = [
        "Today brings opportunities for growth and self-discovery. Trust your intuition and embrace new experiences.",
        "The cosmic energies align in your favor today. Focus on relationships and meaningful connections.",
        "Your natural talents will shine brightly today. Use your unique gifts to help others and yourself.",
        "Change is in the air, bringing fresh perspectives and exciting possibilities. Stay open to new ideas.",
        "Today is perfect for reflection and planning. Your wisdom will guide you toward the right decisions.",
      ];
      return insights[Math.floor(Math.random() * insights.length)];
    }

    if (lowerPrompt.includes("oracle") || lowerPrompt.includes("prediction")) {
      const predictions = [
        "The stars whisper of wonderful opportunities approaching. Your path leads to fulfillment and joy.",
        "Love and abundance flow toward you like a gentle river. Trust in the universe's perfect timing.",
        "Your unique gifts will soon be recognized and celebrated. Prepare for positive recognition.",
        "A meaningful connection awaits you. Open your heart to new relationships and deeper understanding.",
        "Success comes through persistence and authenticity. Stay true to your values and dreams.",
      ];
      return predictions[Math.floor(Math.random() * predictions.length)];
    }

    if (lowerPrompt.includes("deadly sin") || lowerPrompt.includes("warning")) {
      return "Be mindful of extremes in all things. Balance and moderation bring harmony to your life. Trust in your inner wisdom to guide you away from temptation.";
    }

    if (lowerPrompt.includes("future") || lowerPrompt.includes("6-12 months")) {
      return "The coming months hold great potential for personal growth and achievement. Your dedication and hard work will be rewarded. Trust in your journey and stay open to unexpected blessings.";
    }

    // Generic fallback
    return "The cosmos holds infinite wisdom for your journey. Trust in your inner strength and the path that unfolds before you. Every challenge brings growth, and every step forward brings you closer to your dreams.";
  }

  // Calculate OpenAI API cost based on tokens
  private static calculateOpenAICost(
    promptTokens: number,
    completionTokens: number
  ): number {
    // GPT-4o pricing (as of 2024): $5.00/1M input tokens, $15.00/1M output tokens
    const inputCostPer1M = 5.0;
    const outputCostPer1M = 15.0;

    const inputCost = (promptTokens / 1000000) * inputCostPer1M;
    const outputCost = (completionTokens / 1000000) * outputCostPer1M;

    return inputCost + outputCost;
  }

  private static shouldUseOpenAI(): boolean {
    const now = Date.now();

    // If Gemini has failed too many times recently, use OpenAI
    if (
      this.geminiFailureCount >= this.MAX_GEMINI_FAILURES &&
      now - this.lastGeminiFailure < this.GEMINI_COOLDOWN
    ) {
      return true;
    }

    // If it's been long enough since last failure, reset and try Gemini
    if (now - this.lastGeminiFailure >= this.GEMINI_COOLDOWN) {
      this.geminiFailureCount = 0;
    }

    return false;
  }

  private static recordGeminiFailure() {
    this.geminiFailureCount++;
    this.lastGeminiFailure = Date.now();
    console.log(
      `📊 Gemini failure recorded. Count: ${this.geminiFailureCount}`
    );
  }

  private static resetGeminiFailures() {
    this.geminiFailureCount = 0;
    console.log("✅ Gemini failures reset - service working properly");
  }

  // Process request queue to ensure rate limiting
  private static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) break;

      try {
        // Try primary provider first (now Gemini)
        if (this.preferredProvider === AIProvider.GEMINI) {
          console.log("🤖 Trying Gemini AI as primary provider");
          const content = await GeminiAIService.generateAdvancedPrompt(
            request.prompt
          );
          // Record Gemini usage if user info provided
          if (request.userId && request.feature) {
            await SubscriptionService.recordAIUsage(
              request.userId,
              request.feature,
              "gemini",
              0.08
            );
          }
          request.resolve({ content, provider: AIProvider.GEMINI });
        } else {
          // OpenAI as primary (backup scenario)
          const content = await this.makeOpenAIRequest(
            request.prompt,
            request.userId,
            request.feature,
            request.progressCallback
          );
          request.resolve({ content, provider: AIProvider.OPENAI });
        }
      } catch (error: any) {
        console.error(
          `Error with ${this.preferredProvider}, trying fallback:`,
          error.message
        );

        // Try fallback provider
        try {
          if (this.preferredProvider === AIProvider.GEMINI) {
            // Gemini failed, try OpenAI
            console.log("🔄 Gemini failed, trying OpenAI as fallback");
            const content = await this.makeOpenAIRequest(
              request.prompt,
              request.userId,
              request.feature,
              request.progressCallback
            );
            request.resolve({ content, provider: AIProvider.OPENAI });
          } else {
            // OpenAI failed, try Gemini
            console.log("🔄 OpenAI failed, trying Gemini as fallback");
            const content = await GeminiAIService.generateAdvancedPrompt(
              request.prompt
            );
            if (request.userId && request.feature) {
              await SubscriptionService.recordAIUsage(
                request.userId,
                request.feature,
                "gemini",
                0.08
              );
            }
            request.resolve({ content, provider: AIProvider.GEMINI });
          }
        } catch (fallbackError: any) {
          console.error(
            "Both providers failed, using static fallback:",
            fallbackError.message
          );

          // Both providers failed, use static fallback
          console.log("⚠️ Both AI providers failed, using fallback content");
          const fallbackContent = this.getFallbackContent(request.prompt);
          request.resolve({
            content: fallbackContent,
            provider: AIProvider.GEMINI,
          });
        }
      }
    }

    this.isProcessingQueue = false;
  }

  static async generateContent(
    prompt: string,
    config: AIServiceConfig = {},
    progressCallback?: AIProgressCallback,
    userId?: string,
    feature?:
      | "numerology"
      | "loveMatch"
      | "trustAssessment"
      | "dailyInsights"
      | "oracle"
      | "celebrityMatch"
  ): Promise<{
    content: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
    // Check user quota first if userId provided
    if (userId) {
      const quotaCheck = await SubscriptionService.canMakeAIRequest(userId);
      if (!quotaCheck.canUse) {
        console.log("🚫 User quota exceeded:", quotaCheck.message);
        return {
          content:
            quotaCheck.message ||
            "You have reached your AI request limit for this month.",
          provider: AIProvider.OPENAI,
          quotaExceeded: true,
        };
      }
      console.log(
        `✅ User has ${quotaCheck.remaining === -1 ? "unlimited" : quotaCheck.remaining} AI requests remaining`
      );
    }

    // Log service status for debugging
    const status = this.getProviderStatus();
    console.log("🤖 AI Service Status:", status);
    const { preferredProvider = AIProvider.OPENAI, enableFallback = true } =
      config;

    // Check cache first for immediate response
    const cachedResponse = this.getCachedResponse(prompt);
    if (cachedResponse) {
      return { content: cachedResponse, provider: AIProvider.OPENAI };
    }

    // Use queue system for rate limiting
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        prompt,
        progressCallback,
        priority: 1,
        userId,
        feature,
      });
      this.processQueue();
    });
  }

  // Numerology-specific methods
  static async answerNumerologyQuestion(
    profile: NumerologyProfile,
    question: string,
    progressCallback?: AIProgressCallback,
    userId?: string
  ): Promise<{
    content: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
    const context = this.buildNumerologyContext(profile);

    const prompt = `${context}

QUESTION: "${question}"

Please provide a thoughtful, encouraging response that:
1. References specific aspects of their numerology numbers
2. Offers practical guidance
3. Maintains a positive and supportive tone
4. Keeps the response under 200 words
5. Addresses their question directly using their numerological insights

Response:`;

    try {
      return await this.generateContent(
        prompt,
        { enableFallback: true },
        progressCallback,
        userId,
        "numerology"
      );
    } catch (error) {
      console.error("Error answering numerology question:", error);
      return {
        content:
          "I apologize, but I'm having trouble accessing my wisdom right now. Please try again in a moment, and I'll be happy to help you explore your numerological insights.",
        provider: AIProvider.GEMINI, // Default fallback
      };
    }
  }

  static async generatePersonalizedCharacterAnalysis(
    profile: NumerologyProfile,
    fullName: string,
    progressCallback?: AIProgressCallback,
    userId?: string
  ): Promise<{
    content: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
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

    try {
      return await this.generateContent(
        prompt,
        { enableFallback: true },
        progressCallback,
        userId,
        "numerology"
      );
    } catch (error) {
      console.error("Error generating character analysis:", error);
      return {
        content:
          "A unique individual with great potential for growth and success in their chosen path.",
        provider: AIProvider.GEMINI,
      };
    }
  }

  static async generateDeadlySinWarning(
    profile: NumerologyProfile,
    fullName: string,
    progressCallback?: AIProgressCallback,
    userId?: string
  ): Promise<{
    sin: string;
    warning: string;
    consequences: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
    console.log(
      "🔮 Starting deadly sin warning generation for:",
      fullName,
      "Life Path:",
      profile.lifePathNumber
    );

    const prompt = `Based on ${fullName}'s numerology profile (Life Path: ${profile.lifePathNumber}, Destiny: ${profile.destinyNumber}), identify their primary spiritual challenge from the six deadly sins (Pride, Envy, Wrath, Sloth, Greed, Gluttony).

Respond in this exact format:
SIN: [specific sin]
WARNING: [brief spiritual warning about this tendency]
CONSEQUENCES: [how this could impact relationships and trust]

Keep each section under 30 words and focus on spiritual growth.`;

    try {
      console.log("📤 Sending deadly sin prompt to AI service");
      const result = await this.generateContent(
        prompt,
        { enableFallback: true },
        progressCallback,
        userId,
        "oracle"
      );
      console.log(
        "📥 Received deadly sin response:",
        result.content.substring(0, 200) + "..."
      );

      // Parse the response
      const sinMatch = result.content.match(/SIN:\s*([^\n]+)/i);
      const warningMatch = result.content.match(/WARNING:\s*([^\n]+)/i);
      const consequencesMatch = result.content.match(
        /CONSEQUENCES:\s*([^\n]+)/i
      );

      const parsedResult = {
        sin: sinMatch ? sinMatch[1].trim() : "Pride",
        warning: warningMatch
          ? warningMatch[1].trim()
          : "Be mindful of ego and stay humble in relationships.",
        consequences: consequencesMatch
          ? consequencesMatch[1].trim()
          : "May create barriers to authentic connection and trust.",
        provider: result.provider,
      };

      console.log("✅ Successfully parsed deadly sin warning:", parsedResult);
      return parsedResult;
    } catch (error) {
      console.error("❌ Error generating deadly sin warning:", error);
      const fallback = {
        sin: "Pride",
        warning: "Be mindful of ego and stay humble in relationships.",
        consequences:
          "Pride can create barriers to authentic connection and trust.",
        provider: AIProvider.OPENAI,
      };
      console.log("⚠️ Using fallback deadly sin warning:", fallback);
      return fallback;
    }
  }

  static async generateCelebrityMatchReason(
    userLifePath: number,
    celebrityName: string,
    celebrityLifePath: number,
    compatibilityScore: number,
    progressCallback?: AIProgressCallback,
    userId?: string
  ): Promise<{
    content: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
    const prompt = `Explain why someone with Life Path ${userLifePath} is ${compatibilityScore}% compatible with ${celebrityName} (Life Path ${celebrityLifePath}).

Keep it:
- Under 50 words
- Romantic but realistic
- Focused on personality compatibility
- Encouraging and positive

Format: "You and ${celebrityName} share [specific trait/energy]. This ${compatibilityScore}% compatibility suggests [reason for connection]. [Encouraging insight about the match]."`;

    try {
      return await this.generateContent(
        prompt,
        { enableFallback: true },
        progressCallback,
        userId,
        "celebrityMatch"
      );
    } catch (error) {
      console.error("Error generating celebrity match reason:", error);
      return {
        content: `You and ${celebrityName} share complementary energies that create a ${compatibilityScore}% compatibility. This connection suggests mutual understanding and shared values.`,
        provider: AIProvider.GEMINI,
      };
    }
  }

  static async generateAdvancedPrompt(
    prompt: string,
    progressCallback?: AIProgressCallback,
    userId?: string,
    feature?:
      | "numerology"
      | "loveMatch"
      | "trustAssessment"
      | "dailyInsights"
      | "oracle"
      | "celebrityMatch"
  ): Promise<{
    content: string;
    provider: AIProvider;
    quotaExceeded?: boolean;
  }> {
    try {
      return await this.generateContent(
        prompt,
        { enableFallback: true },
        progressCallback,
        userId,
        feature
      );
    } catch (error) {
      console.error("Error with advanced prompt:", error);
      return {
        content:
          "I apologize, but I'm unable to process this request at the moment. Please try again later.",
        provider: AIProvider.GEMINI,
      };
    }
  }

  // Helper method to build numerology context (same as GeminiAIService)
  private static buildNumerologyContext(profile: NumerologyProfile): string {
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

  // Status methods
  static getProviderStatus(): {
    preferredProvider: AIProvider;
    geminiFailures: number;
    isGeminiInCooldown: boolean;
    nextGeminiRetry: number | null;
    openAI: any;
  } {
    const now = Date.now();
    const isInCooldown =
      this.geminiFailureCount >= this.MAX_GEMINI_FAILURES &&
      now - this.lastGeminiFailure < this.GEMINI_COOLDOWN;

    // Clean old calls for current status
    this.openAICallTimes = this.openAICallTimes.filter(
      (callTime) => now - callTime < this.OPENAI_RATE_WINDOW
    );

    return {
      preferredProvider: this.preferredProvider,
      geminiFailures: this.geminiFailureCount,
      isGeminiInCooldown: isInCooldown,
      nextGeminiRetry: isInCooldown
        ? this.lastGeminiFailure + this.GEMINI_COOLDOWN
        : null,
      openAI: {
        callsInLastSecond: this.openAICallTimes.length,
        maxCallsPerSecond: this.OPENAI_MAX_REQUESTS_PER_SECOND,
        queueLength: this.requestQueue.length,
        cacheSize: this.responseCache.size,
        isProcessingQueue: this.isProcessingQueue,
        rateLimitStatus:
          this.openAICallTimes.length >= this.OPENAI_MAX_REQUESTS_PER_SECOND
            ? "RATE_LIMITED"
            : "OK",
        lastCallTime:
          this.openAICallTimes.length > 0
            ? new Date(Math.max(...this.openAICallTimes)).toISOString()
            : null,
      },
    };
  }
}

export default UniversalAIService;
