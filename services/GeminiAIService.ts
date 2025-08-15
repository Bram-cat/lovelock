// Gemini AI Service for Numerology Q&A
import { NumerologyProfile } from './NumerologyService';

const GEMINI_API_KEY = 'AIzaSyAzAP3NQJyvY4rglOja86HFxjlJNjWzZJo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiAIService {
  
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini AI');
      }
    } catch (error) {
      console.error('Gemini AI Service Error:', error);
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
- Strengths: ${profile.lifePathInfo?.strengths?.join(', ')}
- Challenges: ${profile.lifePathInfo?.challenges?.join(', ')}
- Career Paths: ${profile.lifePathInfo?.careerPaths?.join(', ')}
- Relationships: ${profile.lifePathInfo?.relationships}
- Life Approach: ${profile.lifePathInfo?.lifeApproach}

DESTINY & PURPOSE:
- Destiny Description: ${profile.destinyInfo?.description}
- Life Purpose: ${profile.destinyInfo?.purpose}
- Natural Talents: ${profile.destinyInfo?.talents?.join(', ')}
- Life Mission: ${profile.destinyInfo?.mission}

INNER DESIRES:
- Soul Urge Description: ${profile.soulUrgeInfo?.description}
- Heart's Desires: ${profile.soulUrgeInfo?.desires?.join(', ')}
- Core Motivation: ${profile.soulUrgeInfo?.motivation}
- Path to Fulfillment: ${profile.soulUrgeInfo?.fulfillment}

CHARACTER ANALYSIS: ${profile.characterAnalysis}
`;
  }

  private buildPrompt(profile: NumerologyProfile, question: string): string {
    const context = this.buildNumerologyContext(profile);
    
    return `You are a wise, compassionate numerology expert and spiritual guide. You have deep knowledge of numerology, astrology, psychology, and personal development. Your role is to provide insightful, encouraging, and semi-positive guidance based on the user's numerology profile.

${context}

INSTRUCTIONS:
1. Answer the user's question using their specific numerology numbers and profile
2. Draw insights from numerology wisdom, psychology, and spiritual guidance
3. Use elegant, uplifting language that inspires and empowers
4. Be semi-positive - acknowledge challenges but frame them as growth opportunities
5. Provide practical advice and actionable insights
6. Reference their specific numbers (Life Path, Destiny, Soul Urge, etc.) when relevant
7. Keep responses between 100-200 words for mobile readability
8. Use a warm, personal tone as if speaking to a close friend

USER'S QUESTION: "${question}"

Please provide a thoughtful, personalized response based on their numerology profile:`;
  }

  async answerNumerologyQuestion(profile: NumerologyProfile, question: string): Promise<string> {
    try {
      const prompt = this.buildPrompt(profile, question);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        return this.enhanceResponse(aiResponse);
      } else {
        throw new Error('No response from Gemini AI');
      }
    } catch (error) {
      console.error('Gemini AI Service Error:', error);
      return this.getFallbackResponse(profile, question);
    }
  }

  private enhanceResponse(response: string): string {
    // Add some spiritual emojis and formatting for better presentation
    const enhanced = response
      .replace(/\n\n/g, '\n\n✨ ')
      .replace(/^/, '🌟 ');
    
    return enhanced;
  }

  private getFallbackResponse(profile: NumerologyProfile, question: string): string {
    const responses = [
      `🌟 As a Life Path ${profile.lifePathNumber}, your journey is unique and meaningful. Your question touches on something important to your spiritual growth. Trust your inner wisdom and remember that every challenge is an opportunity for transformation. ✨`,
      
      `✨ Your Destiny Number ${profile.destinyNumber} suggests you have special gifts to share with the world. The answer you seek lies within your own intuitive understanding. Take time for reflection and listen to what your heart is telling you. 🌟`,
      
      `🌟 With your Soul Urge ${profile.soulUrgeNumber}, you're naturally drawn to seek deeper meaning. Your question shows your commitment to personal growth. Trust the process and know that the universe is guiding you toward your highest good. ✨`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Method for general numerology insights without specific questions
  async generateDailyInsight(profile: NumerologyProfile): Promise<string> {
    const prompt = `Based on this numerology profile, provide a brief, uplifting daily insight or affirmation:

${this.buildNumerologyContext(profile)}

Generate a 50-80 word positive insight for today that relates to their numbers and encourages personal growth.`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          }
        }),
      });

      if (response.ok) {
        const data: GeminiResponse = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          return '🌟 ' + data.candidates[0].content.parts[0].text + ' ✨';
        }
      }
    } catch (error) {
      console.error('Daily insight error:', error);
    }

    return `🌟 Today is a perfect day to embrace your Life Path ${profile.lifePathNumber} energy. Trust in your journey and let your authentic self shine brightly. ✨`;
  }
}

export default new GeminiAIService();
