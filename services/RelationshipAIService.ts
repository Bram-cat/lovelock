// Relationship AI Service for Love & Dating Advice
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

class RelationshipAIService {
  private buildRelationshipPrompt(question: string): string {
    return `You are "Cupid AI" - a wise, empathetic, and modern relationship expert with deep knowledge of psychology, dating, love, and human connection. You specialize in providing thoughtful relationship advice for modern couples and singles.

PERSONALITY & TONE:
- Warm, supportive, and non-judgmental
- Romantic yet realistic
- Encouraging and empowering
- Use gentle, caring language
- Be inclusive of all relationship types and orientations
- Offer hope while being honest about challenges

EXPERTISE AREAS:
- Dating advice and first impressions
- Communication in relationships
- Conflict resolution and compromise
- Building intimacy and trust
- Long-distance relationships
- Breakups and healing
- Self-love and confidence
- Red flags and healthy boundaries
- Modern dating apps and online dating
- Marriage and commitment
- Family dynamics and relationships

INSTRUCTIONS:
1. Provide practical, actionable advice
2. Draw from psychology, relationship research, and modern dating wisdom
3. Be supportive but honest about relationship realities
4. Encourage healthy communication and boundaries
5. Suggest specific steps or conversation starters when appropriate
6. Keep responses between 150-250 words for mobile readability
7. Use emojis sparingly but meaningfully (💕, 💫, 🌟)
8. Reference current relationship trends and modern dating challenges
9. Always prioritize the user's emotional wellbeing and self-worth

USER'S QUESTION: "${question}"

Please provide thoughtful, caring relationship advice:`;
  }

  async getRelationshipAdvice(question: string): Promise<string> {
    try {
      const prompt = this.buildRelationshipPrompt(question);
      
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 400,
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
      console.error('Relationship AI Service Error:', error);
      return this.getFallbackResponse(question);
    }
  }

  private enhanceResponse(response: string): string {
    // Add romantic formatting and ensure proper structure
    const enhanced = response
      .replace(/\n\n/g, '\n\n💕 ')
      .replace(/^/, '💫 ');
    
    return enhanced;
  }

  private getFallbackResponse(question: string): string {
    const responses = [
      `💕 Thank you for sharing what's on your heart. Every relationship journey is unique, and it's beautiful that you're seeking guidance. Remember that healthy relationships are built on communication, trust, and mutual respect. Take time to listen to your intuition - it often knows what your heart needs. 💫`,
      
      `🌟 Love is one of life's greatest adventures, and it's normal to have questions along the way. The fact that you're thoughtful about your relationships shows how much you care. Focus on being authentic, communicating openly, and setting healthy boundaries. You deserve love that feels safe and nurturing. 💕`,
      
      `💫 Relationships can be complex, but remember that you have the wisdom within you to navigate this. Trust your feelings, communicate with kindness, and don't be afraid to ask for what you need. Every challenge is an opportunity to grow closer or learn more about yourself. You've got this! 🌟`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get conversation starters for relationship topics
  getConversationStarters(): string[] {
    return [
      "How do I know if someone is right for me?",
      "What are some red flags I should watch for?",
      "How can I improve communication with my partner?",
      "I'm nervous about a first date, any tips?",
      "How do I build trust in a relationship?",
      "What should I do if we keep arguing?",
      "How do I know when to say 'I love you'?",
      "Help me navigate online dating",
      "How can I be more confident in dating?",
      "What makes a relationship last?"
    ];
  }

  // Get daily relationship tips
  getDailyTip(): string {
    const tips = [
      "💕 Daily Tip: Send your partner a thoughtful text today - even something small like 'thinking of you' can brighten their day!",
      "🌟 Daily Tip: Practice active listening - put away distractions and really focus when your partner is speaking.",
      "💫 Daily Tip: Express gratitude for something your partner did, no matter how small. Appreciation strengthens bonds.",
      "💕 Daily Tip: Ask your partner about their day and really listen to their answer. Show genuine interest in their world.",
      "🌟 Daily Tip: Physical touch matters - a hug, holding hands, or a gentle touch can convey love without words.",
      "💫 Daily Tip: Plan something special together, even if it's just cooking dinner or watching a movie. Quality time is precious.",
      "💕 Daily Tip: Be vulnerable - share something meaningful about yourself. Emotional intimacy deepens connection.",
      "🌟 Daily Tip: Forgive quickly and communicate openly when conflicts arise. Don't let small issues become big problems.",
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }
}

export default new RelationshipAIService();
