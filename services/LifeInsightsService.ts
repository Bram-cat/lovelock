// Life Insights Service for Multi-Aspect Analysis
import { ProkeralaNumerologyService } from './ProkeralaNumerologyService';

export interface LifeInsight {
  category: string;
  icon: string;
  prediction: string;
  advice: string;
  luckyDay: string;
  confidenceScore: number;
}

export interface EnhancedLifeInsight extends LifeInsight {
  prokeralaEnhancement?: string;
  dailyTip?: string;
  energyLevel?: number;
}

export class LifeInsightsService {
  
  // Generate enhanced insights with Prokerala API integration
  static async generateEnhancedLifeInsights(
    name: string, 
    birthDate: string, 
    lifePathNumber: number, 
    personalityNumber: number, 
    destinyNumber: number
  ): Promise<EnhancedLifeInsight[]> {
    try {
      // Get enhanced daily predictions from Prokerala API
      const dailyPredictions = await ProkeralaNumerologyService.getDailyPredictions(name, birthDate);
      
      return [
        await this.generateEnhancedCareerInsight(lifePathNumber, destinyNumber, dailyPredictions.career),
        await this.generateEnhancedLoveInsight(lifePathNumber, personalityNumber, dailyPredictions.love),
        await this.generateEnhancedMoneyInsight(destinyNumber, lifePathNumber, dailyPredictions.career),
        await this.generateEnhancedHealthInsight(personalityNumber, lifePathNumber, dailyPredictions.health, dailyPredictions.energyLevel)
      ];
    } catch (error) {
      console.error('Error generating enhanced insights:', error);
      // Fallback to regular insights
      return this.generateLifeInsights(lifePathNumber, personalityNumber, destinyNumber).map(insight => ({
        ...insight,
        prokeralaEnhancement: 'Enhanced predictions temporarily unavailable'
      }));
    }
  }

  // Generate insights for all life aspects based on numerology numbers
  static generateLifeInsights(lifePathNumber: number, personalityNumber: number, destinyNumber: number): LifeInsight[] {
    return [
      this.generateCareerInsight(lifePathNumber, destinyNumber),
      this.generateLoveInsight(lifePathNumber, personalityNumber),
      this.generateMoneyInsight(destinyNumber, lifePathNumber),
      this.generateHealthInsight(personalityNumber, lifePathNumber)
    ];
  }

  private static generateCareerInsight(lifePathNumber: number, destinyNumber: number): LifeInsight {
    const careerInsights = {
      1: {
        prediction: "🚀 PROMOTION INCOMING! Your leadership skills are about to be recognized.",
        advice: "Take charge of that big project. Your boss energy is peaking this week!"
      },
      2: {
        prediction: "🤝 TEAM SUCCESS! Collaboration brings breakthrough opportunities.",
        advice: "Partner up with a colleague. Your diplomatic skills unlock doors."
      },
      3: {
        prediction: "💡 CREATIVE EXPLOSION! Your ideas are pure gold right now.",
        advice: "Pitch that creative project. Your artistic vision gets approved!"
      },
      4: {
        prediction: "🏗️ BUILDING EMPIRE! Your hard work finally pays off big time.",
        advice: "Focus on details and planning. Your methodical approach wins."
      },
      5: {
        prediction: "✈️ TRAVEL & ADVENTURE! New opportunities in different cities await.",
        advice: "Say yes to that business trip. Freedom and growth ahead!"
      },
      6: {
        prediction: "👩‍⚕️ HELPING OTHERS! Healing or teaching brings career joy and money.",
        advice: "Use your nurturing skills. People need what you offer."
      },
      7: {
        prediction: "🔮 RESEARCH BREAKTHROUGH! Your analytical mind discovers gold.",
        advice: "Trust your intuition. The answer you seek is within you."
      },
      8: {
        prediction: "💰 MONEY MACHINE ACTIVATED! Business deals and investments flourish.",
        advice: "Think bigger! Your vision for wealth is becoming reality."
      },
      9: {
        prediction: "🌍 WORLD IMPACT! Your humanitarian work gains global recognition.",
        advice: "Lead with your heart. Your mission to help others pays off."
      }
    };

    const insight = careerInsights[lifePathNumber] || careerInsights[1];
    return {
      category: "Career & Success",
      icon: "💼",
      prediction: insight.prediction,
      advice: insight.advice,
      luckyDay: this.getRandomLuckyDay(),
      confidenceScore: Math.floor(Math.random() * 20) + 80 // 80-99%
    };
  }

  private static generateLoveInsight(lifePathNumber: number, personalityNumber: number): LifeInsight {
    const loveInsights = {
      1: {
        prediction: "😍 MAGNETIC ATTRACTION! Someone powerful falls for your confidence.",
        advice: "Be yourself! Your natural leadership is irresistibly attractive."
      },
      2: {
        prediction: "💕 SOULMATE INCOMING! Deep emotional connection manifests soon.",
        advice: "Open your heart. Your gentle energy attracts true love."
      },
      3: {
        prediction: "🎨 CREATIVE ROMANCE! Art, music, or events spark passionate love.",
        advice: "Express yourself freely. Your creativity is your love magnet."
      },
      4: {
        prediction: "💍 SERIOUS COMMITMENT! Stable, long-term relationship energy peaks.",
        advice: "Build slowly and steadily. Real love requires a strong foundation."
      },
      5: {
        prediction: "🌟 ADVENTURE LOVE! Travel or exploration brings exciting romance.",
        advice: "Say yes to invitations! Love finds you when you're exploring."
      },
      6: {
        prediction: "👪 FAMILY LOVE! Nurturing energy attracts devoted partner.",
        advice: "Show your caring side. Someone needs your love and protection."
      },
      7: {
        prediction: "✨ SPIRITUAL CONNECTION! Deep, mystical bond forms with someone special.",
        advice: "Trust the universe. Your twin flame is seeking you too."
      },
      8: {
        prediction: "💎 LUXURY LOVE! Successful, ambitious partner enters your life.",
        advice: "Aim high! You deserve a partner who matches your ambition."
      },
      9: {
        prediction: "🌍 UNIVERSAL LOVE! Compassionate heart attracts humanitarian soulmate.",
        advice: "Love without limits. Your big heart draws in beautiful souls."
      }
    };

    const insight = loveInsights[lifePathNumber] || loveInsights[1];
    return {
      category: "Love & Relationships",
      icon: "❤️",
      prediction: insight.prediction,
      advice: insight.advice,
      luckyDay: this.getRandomLuckyDay(),
      confidenceScore: Math.floor(Math.random() * 15) + 85 // 85-99%
    };
  }

  private static generateMoneyInsight(destinyNumber: number, lifePathNumber: number): LifeInsight {
    const moneyInsights = {
      1: {
        prediction: "💰 BOSS MONEY! Leadership role brings significant income boost.",
        advice: "Start that business! Your entrepreneurial spirit creates wealth."
      },
      2: {
        prediction: "🤝 PARTNERSHIP PROFITS! Joint ventures multiply your money.",
        advice: "Team up with others. Collaboration is your wealth strategy."
      },
      3: {
        prediction: "🎨 CREATIVE CASH! Your artistic talents become profitable goldmine.",
        advice: "Monetize your creativity! People will pay premium for your art."
      },
      4: {
        prediction: "🏦 STEADY WEALTH! Consistent savings and investments pay off big.",
        advice: "Stay disciplined with money. Your patience builds fortune."
      },
      5: {
        prediction: "🌐 GLOBAL MONEY! International opportunities bring wealth flows.",
        advice: "Diversify and explore! Multiple income streams await you."
      },
      6: {
        prediction: "🏠 FAMILY WEALTH! Real estate or family business brings prosperity.",
        advice: "Invest in what you love. Home and family create abundance."
      },
      7: {
        prediction: "📚 KNOWLEDGE GOLD! Research or expertise commands high prices.",
        advice: "Become the expert! Your specialized knowledge is valuable."
      },
      8: {
        prediction: "🏆 MILLIONAIRE ENERGY! Major financial breakthrough approaching fast.",
        advice: "Think massive! Your money magnetism is at peak power."
      },
      9: {
        prediction: "🌟 GIVING WEALTH! Helping others creates unexpected financial returns.",
        advice: "Give to receive! Your generosity attracts abundance back."
      }
    };

    const insight = moneyInsights[destinyNumber] || moneyInsights[8];
    return {
      category: "Money & Wealth",
      icon: "💰",
      prediction: insight.prediction,
      advice: insight.advice,
      luckyDay: this.getRandomLuckyDay(),
      confidenceScore: Math.floor(Math.random() * 25) + 75 // 75-99%
    };
  }

  private static generateHealthInsight(personalityNumber: number, lifePathNumber: number): LifeInsight {
    const healthInsights = {
      1: {
        prediction: "💪 ENERGY SURGE! Your vitality and strength reach new peaks.",
        advice: "Channel that power! High-intensity workouts boost your energy."
      },
      2: {
        prediction: "🧘 BALANCE BLISS! Harmony brings healing to mind and body.",
        advice: "Find your center. Yoga and meditation restore your peace."
      },
      3: {
        prediction: "🎵 JOYFUL HEALING! Music, dance, and laughter boost wellness.",
        advice: "Express yourself! Creative activities heal your soul."
      },
      4: {
        prediction: "🏃 ROUTINE RESULTS! Consistent habits create amazing health transformation.",
        advice: "Stick to your plan! Steady progress brings lasting wellness."
      },
      5: {
        prediction: "🌿 ADVENTURE HEALING! Outdoor activities and new experiences energize you.",
        advice: "Change it up! Variety in exercise keeps you motivated."
      },
      6: {
        prediction: "💆 NURTURE YOURSELF! Self-care and relaxation restore your energy.",
        advice: "You care for others - now care for YOU! Rest and recharge."
      },
      7: {
        prediction: "🔮 INTUITIVE HEALING! Your body wisdom guides perfect health choices.",
        advice: "Trust your instincts! Your inner voice knows what you need."
      },
      8: {
        prediction: "🏆 STRENGTH GOALS! Physical achievement and fitness success ahead.",
        advice: "Set big health goals! Your determination creates results."
      },
      9: {
        prediction: "🌱 HOLISTIC WELLNESS! Natural healing and spiritual practices work wonders.",
        advice: "Heal naturally! Alternative wellness approaches serve you well."
      }
    };

    const insight = healthInsights[personalityNumber] || healthInsights[1];
    return {
      category: "Health & Wellness",
      icon: "🌟",
      prediction: insight.prediction,
      advice: insight.advice,
      luckyDay: this.getRandomLuckyDay(),
      confidenceScore: Math.floor(Math.random() * 20) + 80 // 80-99%
    };
  }

  private static getRandomLuckyDay(): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[Math.floor(Math.random() * days.length)];
  }

  // Enhanced insight generation methods
  private static async generateEnhancedCareerInsight(
    lifePathNumber: number, 
    destinyNumber: number, 
    dailyCareerPrediction: string
  ): Promise<EnhancedLifeInsight> {
    const baseInsight = this.generateCareerInsight(lifePathNumber, destinyNumber);
    
    return {
      ...baseInsight,
      prokeralaEnhancement: `API Insight: ${dailyCareerPrediction}`,
      dailyTip: this.getCareerTipOfDay(lifePathNumber),
      energyLevel: 75 + Math.floor(Math.random() * 25)
    };
  }

  private static async generateEnhancedLoveInsight(
    lifePathNumber: number, 
    personalityNumber: number, 
    dailyLovePrediction: string
  ): Promise<EnhancedLifeInsight> {
    const baseInsight = this.generateLoveInsight(lifePathNumber, personalityNumber);
    
    return {
      ...baseInsight,
      prokeralaEnhancement: `API Insight: ${dailyLovePrediction}`,
      dailyTip: this.getLoveTipOfDay(personalityNumber),
      energyLevel: 70 + Math.floor(Math.random() * 30)
    };
  }

  private static async generateEnhancedMoneyInsight(
    destinyNumber: number, 
    lifePathNumber: number, 
    dailyCareerPrediction: string
  ): Promise<EnhancedLifeInsight> {
    const baseInsight = this.generateMoneyInsight(destinyNumber, lifePathNumber);
    
    return {
      ...baseInsight,
      prokeralaEnhancement: `Financial Energy: ${dailyCareerPrediction}`,
      dailyTip: this.getMoneyTipOfDay(destinyNumber),
      energyLevel: 80 + Math.floor(Math.random() * 20)
    };
  }

  private static async generateEnhancedHealthInsight(
    personalityNumber: number, 
    lifePathNumber: number, 
    dailyHealthPrediction: string,
    energyLevel: number
  ): Promise<EnhancedLifeInsight> {
    const baseInsight = this.generateHealthInsight(personalityNumber, lifePathNumber);
    
    return {
      ...baseInsight,
      prokeralaEnhancement: `Wellness Insight: ${dailyHealthPrediction}`,
      dailyTip: this.getHealthTipOfDay(personalityNumber),
      energyLevel: energyLevel
    };
  }

  // Daily tip generators
  private static getCareerTipOfDay(lifePathNumber: number): string {
    const tips = {
      1: "Today: Take the lead on a project that excites you.",
      2: "Today: Collaborate with someone who complements your skills.",
      3: "Today: Share a creative idea that's been on your mind.",
      4: "Today: Focus on organizing one important aspect of your work.",
      5: "Today: Network with someone new in your field.",
      6: "Today: Offer help to a colleague who needs support.",
      7: "Today: Research a topic that could advance your expertise.",
      8: "Today: Set a concrete goal for your next career milestone.",
      9: "Today: Find a way to make your work more meaningful."
    };
    return tips[lifePathNumber] || tips[1];
  }

  private static getLoveTipOfDay(personalityNumber: number): string {
    const tips = {
      1: "Today: Be confident but also show your vulnerable side.",
      2: "Today: Practice active listening with someone you care about.",
      3: "Today: Express your feelings through a creative gesture.",
      4: "Today: Plan something reliable and thoughtful for your partner.",
      5: "Today: Suggest a spontaneous adventure together.",
      6: "Today: Show extra care and attention to family relationships.",
      7: "Today: Have a deep, meaningful conversation about life.",
      8: "Today: Demonstrate your commitment through actions.",
      9: "Today: Show compassion to someone who needs understanding."
    };
    return tips[personalityNumber] || tips[1];
  }

  private static getMoneyTipOfDay(destinyNumber: number): string {
    const tips = {
      1: "Today: Invest in yourself - education or skills pay off.",
      2: "Today: Consider a financial partnership or joint investment.",
      3: "Today: Monetize a creative skill or hobby you have.",
      4: "Today: Review your budget and cut one unnecessary expense.",
      5: "Today: Research an investment that offers growth potential.",
      6: "Today: Look into ways to increase your home's value.",
      7: "Today: Study the market before making any financial decisions.",
      8: "Today: Focus on long-term wealth building strategies.",
      9: "Today: Consider investments that align with your values."
    };
    return tips[destinyNumber] || tips[8];
  }

  private static getHealthTipOfDay(personalityNumber: number): string {
    const tips = {
      1: "Today: Do 10 minutes of high-intensity exercise to boost energy.",
      2: "Today: Practice breathing exercises to center yourself.",
      3: "Today: Dance or sing to lift your mood and energy.",
      4: "Today: Stick to your healthy routine, even if it's just 15 minutes.",
      5: "Today: Try a new form of exercise to keep things interesting.",
      6: "Today: Take time for self-care - you deserve it.",
      7: "Today: Meditate or spend quiet time in nature.",
      8: "Today: Set a specific, measurable health goal.",
      9: "Today: Do something healthy that also helps others."
    };
    return tips[personalityNumber] || tips[1];
  }

  // Get quick daily insights for home page (enhanced with API data when available)
  static async getDailyQuickInsights(name: string, birthDate: string, lifePathNumber: number): Promise<string[]> {
    try {
      const dailyPredictions = await ProkeralaNumerologyService.getDailyPredictions(name, birthDate);
      
      const enhancedInsights = [
        `💫 Today's energy level: ${dailyPredictions.energyLevel}% - Your power is ${dailyPredictions.energyLevel > 75 ? 'INCREDIBLE' : 'strong'}!`,
        `🍀 Lucky numbers: ${dailyPredictions.luckyNumbers.join(', ')} - Use these for important decisions!`,
        `🎨 Lucky colors: ${dailyPredictions.luckyColors.join(' & ')} - Wear these for extra fortune!`,
        `❤️ Love insight: ${dailyPredictions.love.substring(0, 80)}...`,
        `💼 Career focus: ${dailyPredictions.career.substring(0, 80)}...`
      ];
      
      return [enhancedInsights[Math.floor(Math.random() * enhancedInsights.length)]];
    } catch (error) {
      // Fallback to regular insights
      const quickInsights = [
        "💡 Your intuition is EXTRA strong today - trust those gut feelings!",
        "💰 Money opportunities are flowing your way - keep eyes open!",
        "❤️ Love energy is high - someone special notices you today!",
        "🚀 Career breakthrough moment is coming - be ready to shine!",
        "✨ Your personal magnetism is at peak power today!",
        "🎯 Focus on one big goal - the universe supports your success!",
        "🌟 Lucky number " + (Math.floor(Math.random() * 9) + 1) + " brings extra fortune today!",
        "🔮 Unexpected good news arrives before " + (Math.floor(Math.random() * 12) + 1) + " PM!"
      ];
      
      return [quickInsights[Math.floor(Math.random() * quickInsights.length)]];
    }
  }
}