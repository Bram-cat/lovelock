// Entertainment AI Service for Personalized Trivia & Movie Recommendations
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

interface UserPreferences {
  relationshipStage?: string; // "dating", "engaged", "married", "long-term"
  interests?: string[]; // "movies", "travel", "food", "music", etc.
  movieGenres?: string[]; // "romance", "comedy", "drama", "action", etc.
  triviaTopics?: string[]; // "love", "pop-culture", "history", "science", etc.
  mood?: string; // "playful", "romantic", "deep", "fun"
}

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  funFact?: string;
}

interface MovieRecommendation {
  title: string;
  year: number;
  genre: string;
  rating: number;
  description: string;
  whyRecommended: string;
  streamingSources: string[];
  perfectFor: string;
}

class EntertainmentAIService {
  private buildPreferencePrompt(): string {
    return `You are a fun, engaging AI companion for couples. Your goal is to understand their preferences to provide personalized trivia questions and movie recommendations.

Ask 3-4 friendly, conversational questions to understand:
1. Their relationship stage (dating, engaged, married, long-term)
2. Their shared interests and hobbies
3. What kind of movies they enjoy together
4. What mood they're in (playful, romantic, deep conversation, just fun)

Be warm, playful, and couple-focused. Make it feel like a fun conversation starter rather than an interview.

Example: "Hey lovebirds! 💕 I'm excited to help you have an amazing time together! To give you the perfect trivia questions and movie picks, tell me a bit about yourselves..."

Keep it conversational and under 150 words.`;
  }

  private buildTriviaPrompt(preferences: UserPreferences): string {
    return `You are creating fun, engaging trivia questions perfect for couples to enjoy together. Based on their preferences:

PREFERENCES:
- Relationship stage: ${preferences.relationshipStage || 'not specified'}
- Interests: ${preferences.interests?.join(', ') || 'general'}
- Mood: ${preferences.mood || 'fun and playful'}
- Trivia topics: ${preferences.triviaTopics?.join(', ') || 'love, relationships, pop culture'}

CREATE 5 TRIVIA QUESTIONS that are:
1. Fun and conversation-starting (not just facts, but things that spark discussion)
2. Couple-friendly (they can discuss answers together)
3. Mix of easy and challenging
4. Include interesting explanations and fun facts
5. Categories: Love & Relationships, Pop Culture, Travel, Food, Science, History

FORMAT each question as JSON:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0-3,
  "explanation": "Why this answer and interesting context",
  "category": "Category name",
  "funFact": "Extra interesting tidbit to discuss"
}

Make questions that couples will enjoy debating and discussing together!`;
  }

  private buildMoviePrompt(preferences: UserPreferences): string {
    return `You are a movie expert creating personalized recommendations for couples. Based on their preferences:

PREFERENCES:
- Relationship stage: ${preferences.relationshipStage || 'not specified'}
- Interests: ${preferences.interests?.join(', ') || 'general'}
- Movie genres: ${preferences.movieGenres?.join(', ') || 'romance, comedy, drama'}
- Mood: ${preferences.mood || 'romantic and fun'}

RECOMMEND 5 MOVIES that are:
1. Perfect for couples to watch together
2. Match their preferences and mood
3. Include where to watch (Netflix, Amazon Prime, Hulu, Disney+, HBO Max, Apple TV+, theaters, rent/buy)
4. Explain why it's perfect for them specifically
5. Mix of recent releases and classics

FORMAT each recommendation as JSON:
{
  "title": "Movie title",
  "year": 2023,
  "genre": "Romance/Comedy",
  "rating": 4.5,
  "description": "Brief plot description",
  "whyRecommended": "Why this is perfect for this couple",
  "streamingSources": ["Netflix", "Amazon Prime"],
  "perfectFor": "Date night, cozy evening, etc."
}

Focus on movies that will create great shared experiences and conversations!`;
  }

  async getPreferenceQuestions(): Promise<string> {
    try {
      const prompt = this.buildPreferencePrompt();
      
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
            maxOutputTokens: 250,
          },
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
      console.error('Entertainment AI Service Error:', error);
      return "💕 Hey there, beautiful couple! I'd love to create the perfect trivia questions and movie recommendations just for you two! Tell me: Are you newly dating or have you been together for a while? What kind of things do you love doing together? And what's your mood today - feeling playful, romantic, or ready for some deep conversations? 🌟";
    }
  }

  async generatePersonalizedTrivia(preferences: UserPreferences): Promise<TriviaQuestion[]> {
    try {
      const prompt = this.buildTriviaPrompt(preferences);
      
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
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        return this.parseTrivia(responseText);
      } else {
        throw new Error('No response from Gemini AI');
      }
    } catch (error) {
      console.error('Trivia Generation Error:', error);
      return this.getFallbackTrivia();
    }
  }

  async generatePersonalizedMovies(preferences: UserPreferences): Promise<MovieRecommendation[]> {
    try {
      const prompt = this.buildMoviePrompt(preferences);
      
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
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        return this.parseMovies(responseText);
      } else {
        throw new Error('No response from Gemini AI');
      }
    } catch (error) {
      console.error('Movie Generation Error:', error);
      return this.getFallbackMovies();
    }
  }

  private parseTrivia(responseText: string): TriviaQuestion[] {
    try {
      // Extract JSON objects from the response
      const jsonMatches = responseText.match(/\{[^}]+\}/g);
      if (!jsonMatches) throw new Error('No JSON found');
      
      return jsonMatches.slice(0, 5).map(jsonStr => {
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return this.getFallbackTrivia();
    }
  }

  private parseMovies(responseText: string): MovieRecommendation[] {
    try {
      // Extract JSON objects from the response
      const jsonMatches = responseText.match(/\{[^}]+\}/g);
      if (!jsonMatches) throw new Error('No JSON found');
      
      return jsonMatches.slice(0, 5).map(jsonStr => {
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return this.getFallbackMovies();
    }
  }

  private getFallbackTrivia(): TriviaQuestion[] {
    return [
      {
        question: "What's the most popular first date activity according to recent surveys?",
        options: ["Coffee date", "Dinner", "Movies", "Mini golf"],
        correctAnswer: 0,
        explanation: "Coffee dates are low-pressure, allow for conversation, and give both people an easy exit if things don't click!",
        category: "Dating",
        funFact: "The average coffee date lasts 2.5 hours when there's mutual interest!"
      },
      {
        question: "Which couple activity is scientifically proven to increase bonding?",
        options: ["Watching TV", "Cooking together", "Shopping", "Exercising"],
        correctAnswer: 1,
        explanation: "Cooking together releases oxytocin and requires teamwork, communication, and creates shared accomplishments!",
        category: "Science of Love",
        funFact: "Couples who cook together have 67% better communication skills!"
      }
    ];
  }

  private getFallbackMovies(): MovieRecommendation[] {
    return [
      {
        title: "The Princess Bride",
        year: 1987,
        genre: "Romance/Adventure",
        rating: 4.9,
        description: "A timeless tale of true love, adventure, and humor that appeals to everyone.",
        whyRecommended: "Perfect blend of romance and adventure that both partners will enjoy",
        streamingSources: ["Disney+", "Amazon Prime"],
        perfectFor: "Cozy night in with someone who hasn't seen this classic"
      }
    ];
  }

  // Get conversation starters based on trivia answers
  getConversationStarters(topic: string): string[] {
    const starters: { [key: string]: string[] } = {
      love: [
        "What's your idea of the perfect date?",
        "What first attracted you to your partner?",
        "What's your love language?",
        "What's the most romantic thing someone has done for you?"
      ],
      travel: [
        "Where would you love to travel together?",
        "What's your dream honeymoon destination?",
        "What's the most romantic city you've visited?",
        "Beach vacation or mountain retreat?"
      ],
      food: [
        "What's your favorite meal to cook together?",
        "What food reminds you of your partner?",
        "Sweet or savory - what's your preference?",
        "What's your go-to date night restaurant?"
      ]
    };

    return starters[topic] || starters.love;
  }
}

export default new EntertainmentAIService();
