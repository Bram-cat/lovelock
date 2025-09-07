// Daily Insights Service using Prokerala API and Gemini AI
import UniversalAIService from './UniversalAIService';
import { ProkeralaNumerologyService } from './ProkeralaNumerologyService';
import type { NumerologyProfile } from './NumerologyService';

export interface DailyInsight {
  date: string;
  personalDayNumber: number;
  energyLevel: number;
  overallTheme: string;
  love: string;
  career: string;
  health: string;
  spiritual: string;
  luckyNumbers: number[];
  luckyColors: string[];
  advice: string;
  affirmation: string;
}

export class DailyInsightsService {
  
  // Get comprehensive daily insights for a user
  static async getDailyInsights(
    name: string,
    birthDate: string,
    date: Date = new Date(),
    birthTime?: string,
    birthLocation?: string
  ): Promise<DailyInsight> {
    try {
      console.log('🌅 Generating daily insights for', name);
      
      // Try Prokerala API first for professional insights
      const prokeralaInsights = await ProkeralaNumerologyService.getDailyPredictions(
        name,
        birthDate,
        date,
        birthTime,
        birthLocation
      );
      
      if (prokeralaInsights) {
        console.log('✨ Using Prokerala API for daily insights');
        return {
          date: date.toISOString().split('T')[0],
          personalDayNumber: this.calculatePersonalDayNumber(birthDate, date),
          energyLevel: prokeralaInsights.energyLevel,
          overallTheme: this.getThemeForDay(this.calculatePersonalDayNumber(birthDate, date)),
          love: prokeralaInsights.love,
          career: prokeralaInsights.career,
          health: prokeralaInsights.health,
          spiritual: prokeralaInsights.spiritual,
          luckyNumbers: prokeralaInsights.luckyNumbers,
          luckyColors: prokeralaInsights.luckyColors,
          advice: await this.generateDailyAdvice(name, birthDate, date),
          affirmation: await this.generateDailyAffirmation(name, birthDate, date)
        };
      }
    } catch (error) {
      console.error('Prokerala API error, using enhanced local calculation:', error);
    }
    
    // Fallback to enhanced local calculation with AI
    return this.generateEnhancedDailyInsights(name, birthDate, date);
  }
  
  // Calculate personal day number
  private static calculatePersonalDayNumber(birthDate: string, date: Date): number {
    const [month, day, year] = birthDate.split('/').map(Number);
    const lifePathSum = month + day + year;
    const lifePathNumber = this.reduceToSingleDigit(lifePathSum);
    
    const currentMonth = date.getMonth() + 1;
    const currentDay = date.getDate();
    const currentYear = date.getFullYear();
    
    const personalDaySum = lifePathNumber + currentMonth + currentDay + currentYear;
    return this.reduceToSingleDigit(personalDaySum);
  }
  
  private static reduceToSingleDigit(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return num;
  }
  
  // Generate enhanced daily insights using local calculation + AI
  private static async generateEnhancedDailyInsights(
    name: string,
    birthDate: string,
    date: Date
  ): Promise<DailyInsight> {
    const personalDayNumber = this.calculatePersonalDayNumber(birthDate, date);
    const basePredictions = this.getBasePredictions(personalDayNumber);
    
    try {
      // Enhance with AI-generated advice and affirmation
      const advice = await this.generateDailyAdvice(name, birthDate, date);
      const affirmation = await this.generateDailyAffirmation(name, birthDate, date);
      
      return {
        date: date.toISOString().split('T')[0],
        personalDayNumber,
        energyLevel: this.calculateEnergyLevel(personalDayNumber, date),
        overallTheme: this.getThemeForDay(personalDayNumber),
        love: basePredictions.love,
        career: basePredictions.career,
        health: basePredictions.health,
        spiritual: basePredictions.spiritual,
        luckyNumbers: this.generateLuckyNumbers(personalDayNumber, date),
        luckyColors: this.getLuckyColors(personalDayNumber),
        advice,
        affirmation
      };
    } catch (aiError) {
      console.error('AI enhancement error:', aiError);
      
      // Final fallback without AI
      return {
        date: date.toISOString().split('T')[0],
        personalDayNumber,
        energyLevel: this.calculateEnergyLevel(personalDayNumber, date),
        overallTheme: this.getThemeForDay(personalDayNumber),
        ...basePredictions,
        luckyNumbers: this.generateLuckyNumbers(personalDayNumber, date),
        luckyColors: this.getLuckyColors(personalDayNumber),
        advice: this.getFallbackAdvice(personalDayNumber),
        affirmation: this.getFallbackAffirmation(personalDayNumber)
      };
    }
  }
  
  // Generate AI-powered daily advice
  private static async generateDailyAdvice(name: string, birthDate: string, date: Date): Promise<string> {
    const personalDayNumber = this.calculatePersonalDayNumber(birthDate, date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const prompt = `Generate personalized daily advice for ${name} based on their numerology:
    
Personal Day Number: ${personalDayNumber}
Date: ${date.toDateString()}
Day of Week: ${dayOfWeek}

Create a 2-3 sentence piece of advice that is:
1. Encouraging and positive
2. Actionable and practical
3. Related to their personal day number energy
4. Appropriate for ${dayOfWeek}

Focus on what they should prioritize or be mindful of today. Keep it warm and supportive.`;
    
    try {
      const result = await UniversalAIService.generateAdvancedPrompt(prompt);
      return result.content.trim();
    } catch (error) {
      return this.getFallbackAdvice(personalDayNumber);
    }
  }
  
  // Generate AI-powered daily affirmation
  private static async generateDailyAffirmation(name: string, birthDate: string, date: Date): Promise<string> {
    const personalDayNumber = this.calculatePersonalDayNumber(birthDate, date);
    
    const prompt = `Create a powerful, personal affirmation for ${name} based on their personal day number ${personalDayNumber}.

Make it:
1. First person ("I am", "I have", "I create")
2. Present tense and positive
3. Empowering and uplifting
4. One meaningful sentence
5. Related to the energy of number ${personalDayNumber}

Return only the affirmation, nothing else.`;
    
    try {
      const result = await UniversalAIService.generateAdvancedPrompt(prompt);
      return result.content.trim().replace(/['"]/g, '');
    } catch (error) {
      return this.getFallbackAffirmation(personalDayNumber);
    }
  }
  
  // Base predictions for each personal day number
  private static getBasePredictions(personalDayNumber: number) {
    const predictions: { [key: number]: any } = {
      1: {
        love: "New romantic energy emerges. Be bold in expressing your feelings and open to new connections.",
        career: "Leadership opportunities arise. Take initiative on important projects and trust your innovative ideas.",
        health: "High energy day perfect for starting new fitness routines or health initiatives.",
        spiritual: "Focus on self-discovery and personal growth. Set clear intentions for your path forward."
      },
      2: {
        love: "Harmony and cooperation strengthen your relationships. Deep emotional connections flourish today.",
        career: "Teamwork and partnerships bring success. Collaborate rather than compete for best results.",
        health: "Balance is key. Gentle exercises like yoga or walking support your wellbeing beautifully.",
        spiritual: "Practice compassion and help others. Your intuition is especially heightened today."
      },
      3: {
        love: "Playful, joyful energy lights up your romantic life. Express feelings with creativity and humor.",
        career: "Communication skills shine brightly. Present ideas, network actively, and share your vision.",
        health: "Creative activities boost wellbeing. Dance, art, or music therapy brings healing energy.",
        spiritual: "Express gratitude and share joy with others. Laughter is your pathway to healing."
      },
      4: {
        love: "Stability and commitment are highlighted. Build lasting foundations in your relationships.",
        career: "Hard work and persistence pay off significantly. Focus on practical, achievable goals.",
        health: "Structured routines benefit you greatly. Maintain consistent, healthy daily habits.",
        spiritual: "Ground yourself in nature's wisdom. Practice patience and cultivate perseverance."
      },
      5: {
        love: "Adventure and excitement energize romance. Try something completely new with your partner.",
        career: "Change and variety are strongly favored. Embrace new opportunities and fresh methods.",
        health: "Dynamic activities energize your spirit. Mix up routines for optimal results.",
        spiritual: "Embrace freedom and explore new spiritual practices that inspire your soul."
      },
      6: {
        love: "Family and nurturing take priority. Deep, caring connections flourish in beautiful ways.",
        career: "Service-oriented work brings deep fulfillment. Help others achieve their important goals.",
        health: "Caring for others nourishes your soul. Remember to maintain emotional balance too.",
        spiritual: "Practice unconditional love and compassion. Allow healing of old emotional wounds."
      },
      7: {
        love: "Deep, spiritual connections become possible. Look beyond surface attractions to find truth.",
        career: "Research and analysis lead to breakthrough insights. Trust your powerful intuition completely.",
        health: "Quiet reflection and meditation restore energy. Avoid overwhelming crowds when possible.",
        spiritual: "Seek inner wisdom through deep meditation. Mystical experiences may unfold naturally."
      },
      8: {
        love: "Take practical approach to relationships. Shared goals and ambitions strengthen bonds significantly.",
        career: "Business success and financial opportunities abound. Think big and act strategically.",
        health: "Ambitious health goals can be achieved. Invest meaningfully in your long-term wellbeing.",
        spiritual: "Balance material and spiritual pursuits wisely. True success includes serving others."
      },
      9: {
        love: "Universal love and compassion guide relationships. Forgiveness opens hearts to healing.",
        career: "Complete important projects with wisdom. Your experience and insights are deeply valued.",
        health: "Holistic approaches work exceptionally well. Consider powerful mind-body healing connections.",
        spiritual: "Share wisdom generously with others. Focus energy on meaningful humanitarian causes."
      }
    };
    
    return predictions[personalDayNumber] || predictions[1];
  }
  
  // Get theme for the day based on personal day number
  private static getThemeForDay(personalDayNumber: number): string {
    const themes: { [key: number]: string } = {
      1: "New Beginnings & Leadership",
      2: "Cooperation & Harmony", 
      3: "Creativity & Expression",
      4: "Foundation & Stability",
      5: "Freedom & Adventure",
      6: "Love & Nurturing",
      7: "Reflection & Spirituality",
      8: "Achievement & Success",
      9: "Completion & Wisdom"
    };
    
    return themes[personalDayNumber] || themes[1];
  }
  
  // Calculate energy level for the day
  private static calculateEnergyLevel(personalDayNumber: number, date: Date): number {
    const baseEnergy = personalDayNumber * 10;
    const dayOfMonth = date.getDate();
    const moonPhaseBonus = Math.floor(Math.random() * 10); // Simplified moon phase effect
    
    return Math.min(100, Math.max(20, baseEnergy + dayOfMonth + moonPhaseBonus));
  }
  
  // Generate lucky numbers for the day
  private static generateLuckyNumbers(personalDayNumber: number, date: Date): number[] {
    const base = [personalDayNumber];
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    
    const additional = [
      (personalDayNumber + dayOfMonth) % 10 || 10,
      (personalDayNumber + month) % 10 || 10,
      (dayOfMonth + month) % 100,
      personalDayNumber * 2 % 10 || 10
    ];
    
    return [...base, ...additional].slice(0, 4);
  }
  
  // Get lucky colors for personal day number
  private static getLuckyColors(personalDayNumber: number): string[] {
    const colorMap: { [key: number]: string[] } = {
      1: ["Red", "Gold"],
      2: ["Blue", "Silver"],
      3: ["Yellow", "Orange"],
      4: ["Green", "Brown"],
      5: ["Turquoise", "Silver"],
      6: ["Pink", "Blue"],
      7: ["Purple", "Violet"],
      8: ["Black", "Gold"],
      9: ["Copper", "Red"]
    };
    
    return colorMap[personalDayNumber] || colorMap[1];
  }
  
  // Fallback advice when AI is not available
  private static getFallbackAdvice(personalDayNumber: number): string {
    const advice: { [key: number]: string } = {
      1: "Take charge of your day with confidence. Your leadership abilities are highlighted, so don't hesitate to step forward.",
      2: "Focus on cooperation and building bridges. Your diplomatic nature will help resolve any conflicts beautifully.",
      3: "Express yourself creatively today. Share your ideas, communicate openly, and let your personality shine bright.",
      4: "Build solid foundations through consistent effort. Practical steps taken today will benefit you long-term.",
      5: "Embrace variety and new experiences. Your adventurous spirit will lead you to exciting opportunities.",
      6: "Nurture your relationships and care for others. Your compassionate heart makes a real difference today.",
      7: "Take time for reflection and inner wisdom. Quiet moments will provide the insights you're seeking.",
      8: "Focus on your goals and material success. Your business acumen and determination are especially strong.",
      9: "Complete projects and help others. Your wisdom and experience make you a valuable guide today."
    };
    
    return advice[personalDayNumber] || advice[1];
  }
  
  // Fallback affirmations when AI is not available
  private static getFallbackAffirmation(personalDayNumber: number): string {
    const affirmations: { [key: number]: string } = {
      1: "I am a natural leader who creates positive change in the world",
      2: "I am a bridge of peace who brings harmony to every situation",
      3: "I am a creative force who expresses my authentic self with joy",
      4: "I am building a solid foundation for lasting success and happiness",
      5: "I am free to explore new adventures that expand my horizons",
      6: "I am a source of love and nurturing that heals and supports others",
      7: "I am connected to infinite wisdom and trust my inner guidance",
      8: "I am achieving my goals with integrity and purposeful action",
      9: "I am a wise soul who serves others with compassion and understanding"
    };
    
    return affirmations[personalDayNumber] || affirmations[1];
  }
  
  // Get insights for multiple days (weekly/monthly view)
  static async getWeeklyInsights(
    name: string,
    birthDate: string,
    startDate: Date = new Date(),
    birthTime?: string,
    birthLocation?: string
  ): Promise<DailyInsight[]> {
    const insights: DailyInsight[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      try {
        const dailyInsight = await this.getDailyInsights(name, birthDate, date, birthTime, birthLocation);
        insights.push(dailyInsight);
      } catch (error) {
        console.error(`Error generating insights for ${date.toDateString()}:`, error);
      }
    }
    
    return insights;
  }
}