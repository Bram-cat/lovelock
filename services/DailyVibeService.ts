// Daily Vibe Service - Fetch daily vibes from Roxy API for premium users
import { RoxyNumerologyService } from './ProkeralaNumerologyService';
import SimpleAIService from './SimpleAIService';

export interface DailyVibe {
  date: string;
  personalDayNumber: number;
  energyLevel: number;
  overallTheme: string;
  loveInsight: string;
  careerGuidance: string;
  healthFocus: string;
  spiritualMessage: string;
  luckyNumbers: number[];
  luckyColors: string[];
  challenges: string[];
  opportunities: string[];
}

export interface AIInsight {
  date: string;
  improvementArea: string;
  specificGuidance: string;
  actionSteps: string[];
  cosmicWisdom: string;
}

export class DailyVibeService {
  // Generate daily vibe using Roxy API and user's numerology profile
  static async generateDailyVibe(
    firstName: string,
    lastName: string,
    birthDate: string,
    userId: string
  ): Promise<DailyVibe | null> {
    try {
      console.log(`🌟 Generating daily vibe for ${firstName} ${lastName}`);

      // Get user's complete numerology profile from Roxy API
      const numerologyProfile = await RoxyNumerologyService.getNumerologyReading(
        firstName,
        lastName,
        birthDate
      );

      if (!numerologyProfile) {
        console.log('❌ Could not get numerology profile for daily vibe');
        return this.getFallbackDailyVibe(firstName, birthDate);
      }

      const today = new Date();
      const personalDayNumber = this.calculatePersonalDayNumber(
        numerologyProfile.life_path_number,
        today
      );

      // Generate comprehensive daily insights
      const dailyVibe: DailyVibe = {
        date: today.toISOString().split('T')[0],
        personalDayNumber,
        energyLevel: this.calculateEnergyLevel(personalDayNumber),
        overallTheme: this.getThemeForDay(personalDayNumber),
        loveInsight: this.getLoveInsight(personalDayNumber, numerologyProfile),
        careerGuidance: this.getCareerGuidance(personalDayNumber, numerologyProfile),
        healthFocus: this.getHealthFocus(personalDayNumber),
        spiritualMessage: this.getSpiritualMessage(personalDayNumber, numerologyProfile),
        luckyNumbers: this.generateDailyLuckyNumbers(personalDayNumber, numerologyProfile.lucky_numbers),
        luckyColors: this.getDailyLuckyColors(personalDayNumber, numerologyProfile.lucky_colors),
        challenges: this.getDailyChallenges(personalDayNumber),
        opportunities: this.getDailyOpportunities(personalDayNumber, numerologyProfile)
      };

      console.log(`✅ Daily vibe generated for Personal Day ${personalDayNumber}`);
      return dailyVibe;

    } catch (error) {
      console.error('Error generating daily vibe:', error);
      return this.getFallbackDailyVibe(firstName, birthDate);
    }
  }

  // Generate AI insight based on daily vibe and user's profile
  static async generateAIInsight(
    dailyVibe: DailyVibe,
    numerologyProfile: any,
    userName: string
  ): Promise<AIInsight> {
    try {
      console.log(`🤖 Generating AI insight for ${userName}`);

      const prompt = `Create a personalized daily improvement insight for ${userName} based on their numerology and today's cosmic energy.

TODAY'S DAILY VIBE:
- Personal Day Number: ${dailyVibe.personalDayNumber}
- Energy Level: ${dailyVibe.energyLevel}/100
- Overall Theme: ${dailyVibe.overallTheme}
- Love Insight: ${dailyVibe.loveInsight}
- Career Guidance: ${dailyVibe.careerGuidance}
- Spiritual Message: ${dailyVibe.spiritualMessage}
- Challenges: ${dailyVibe.challenges.join(', ')}
- Opportunities: ${dailyVibe.opportunities.join(', ')}

THEIR NUMEROLOGY PROFILE:
- Life Path: ${numerologyProfile.life_path_number}
- Strengths: ${numerologyProfile.strengths?.join(', ') || 'Leadership, Intuition'}
- Current Challenges: ${numerologyProfile.challenges?.join(', ') || 'Perfectionism, Impatience'}

Based on today's cosmic energy and their personal numbers, identify ONE specific area they should focus on improving today. Give practical, actionable guidance.

Response format:
IMPROVEMENT_AREA: [One specific area like "Emotional Balance", "Communication", "Self-Care", etc.]
GUIDANCE: [2-3 sentences explaining why this area needs attention today]
ACTION_STEPS: [3 specific actions they can take today]
COSMIC_WISDOM: [1 mystical sentence connecting their numbers to today's energy]

Keep response concise and personally relevant.`;

      const result = await SimpleAIService.generateResponse(prompt, "insight");

      // Parse the AI response
      const response = result.content || '';
      const improvementArea = this.extractSection(response, 'IMPROVEMENT_AREA') || 'Personal Growth';
      const guidance = this.extractSection(response, 'GUIDANCE') || 'Focus on aligning with your cosmic energy today.';
      const actionStepsText = this.extractSection(response, 'ACTION_STEPS') || 'Meditate, Trust your intuition, Practice gratitude';
      const cosmicWisdom = this.extractSection(response, 'COSMIC_WISDOM') || 'The universe guides your path today.';

      const actionSteps = actionStepsText.split(/[,\n]/).map(step => step.trim()).filter(step => step.length > 0);

      return {
        date: dailyVibe.date,
        improvementArea,
        specificGuidance: guidance,
        actionSteps: actionSteps.slice(0, 3), // Limit to 3 steps
        cosmicWisdom
      };

    } catch (error) {
      console.error('Error generating AI insight:', error);
      return this.getFallbackAIInsight(dailyVibe, userName);
    }
  }

  // Helper method to extract sections from AI response
  private static extractSection(response: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 's');
    const match = response.match(regex);
    return match ? match[1].trim() : '';
  }

  // Calculate personal day number
  private static calculatePersonalDayNumber(lifePathNumber: number, date: Date): number {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return ((lifePathNumber + dayOfYear - 1) % 9) + 1;
  }

  // Calculate energy level based on personal day
  private static calculateEnergyLevel(personalDayNumber: number): number {
    const baseLevels = {
      1: 90, 2: 70, 3: 85, 4: 75, 5: 95,
      6: 80, 7: 65, 8: 88, 9: 78
    };
    const baseLevel = baseLevels[personalDayNumber as keyof typeof baseLevels] || 75;
    const variation = Math.floor(Math.random() * 20) - 10; // ±10 variation
    return Math.max(50, Math.min(100, baseLevel + variation));
  }

  // Get theme for the day
  private static getThemeForDay(personalDayNumber: number): string {
    const themes = {
      1: "New Beginnings & Leadership",
      2: "Cooperation & Harmony",
      3: "Creativity & Communication",
      4: "Hard Work & Foundation Building",
      5: "Freedom & Adventure",
      6: "Love & Nurturing",
      7: "Spiritual Growth & Introspection",
      8: "Achievement & Material Success",
      9: "Completion & Humanitarian Service"
    };
    return themes[personalDayNumber as keyof typeof themes] || "Cosmic Alignment";
  }

  // Generate other insight methods...
  private static getLoveInsight(personalDayNumber: number, profile: any): string {
    const insights = {
      1: "Take initiative in love. Your leadership energy attracts romantic opportunities.",
      2: "Focus on partnership and emotional connection. Compromise leads to deeper bonds.",
      3: "Express your feelings creatively. Playful communication strengthens relationships.",
      4: "Build stable foundations in love. Commitment and reliability deepen connections.",
      5: "Embrace adventure with your partner. New experiences revitalize romance.",
      6: "Nurture your loved ones. Your caring nature creates lasting emotional bonds.",
      7: "Seek deeper spiritual connection. Meaningful conversations enhance intimacy.",
      8: "Balance love and ambition. Success is sweeter when shared with someone special.",
      9: "Practice unconditional love. Forgiveness and compassion heal relationships."
    };
    return insights[personalDayNumber as keyof typeof insights] || "Love flows naturally today.";
  }

  private static getCareerGuidance(personalDayNumber: number, profile: any): string {
    const guidance = {
      1: "Lead new projects. Your innovative ideas gain recognition and support.",
      2: "Collaborate effectively. Teamwork and diplomacy advance your professional goals.",
      3: "Communicate your vision. Presentations and networking open new opportunities.",
      4: "Focus on practical tasks. Steady progress builds your professional reputation.",
      5: "Embrace change. Flexibility and adaptability lead to career breakthroughs.",
      6: "Serve others. Your helpful nature creates valuable professional relationships.",
      7: "Research and analyze. Deep insights give you a competitive advantage.",
      8: "Drive for results. Your leadership abilities command respect and advancement.",
      9: "Complete important projects. Your wisdom and experience guide team success."
    };
    return guidance[personalDayNumber as keyof typeof guidance] || "Professional growth awaits.";
  }

  private static getHealthFocus(personalDayNumber: number): string {
    const focuses = {
      1: "Energizing activities. Start new fitness routines or health habits.",
      2: "Gentle balance. Yoga, walking, or peaceful activities restore harmony.",
      3: "Joyful movement. Dance, social sports, or creative activities boost wellbeing.",
      4: "Structured routine. Consistent healthy habits build lasting vitality.",
      5: "Dynamic variety. Mix up your exercise routine for maximum energy.",
      6: "Nurturing care. Self-care and caring for others enhances emotional health.",
      7: "Peaceful reflection. Meditation and quiet activities restore inner balance.",
      8: "Goal-oriented fitness. Ambitious health goals yield powerful results.",
      9: "Holistic wellness. Mind-body-spirit approaches optimize overall health."
    };
    return focuses[personalDayNumber as keyof typeof focuses] || "Listen to your body's wisdom.";
  }

  private static getSpiritualMessage(personalDayNumber: number, profile: any): string {
    const messages = {
      1: "You are a divine pioneer. Trust your unique path and lead with courage.",
      2: "You are a bridge of peace. Your gentle spirit heals and harmonizes.",
      3: "You are a creative spark. Express your soul's joy and inspire others.",
      4: "You are a sacred builder. Your efforts create lasting positive change.",
      5: "You are a free spirit. Embrace your journey with wonder and wisdom.",
      6: "You are a loving heart. Your compassion transforms lives.",
      7: "You are a seeker of truth. Your inner wisdom illuminates the way.",
      8: "You are a manifestor. Your vision and will create abundant reality.",
      9: "You are a wise teacher. Your love and service elevate humanity."
    };
    return messages[personalDayNumber as keyof typeof messages] || "The universe supports your highest good.";
  }

  // Generate daily lucky numbers
  private static generateDailyLuckyNumbers(personalDayNumber: number, baseLuckyNumbers: number[]): number[] {
    const dailyNumbers = [personalDayNumber];
    const enhanced = baseLuckyNumbers.slice(0, 2).map(num => (num + personalDayNumber) % 100);
    return [...dailyNumbers, ...enhanced, Math.floor(Math.random() * 99) + 1].slice(0, 4);
  }

  // Get daily lucky colors
  private static getDailyLuckyColors(personalDayNumber: number, baseColors: string[]): string[] {
    const dailyColors = {
      1: ["Red", "Gold"],
      2: ["Blue", "Silver"],
      3: ["Yellow", "Orange"],
      4: ["Green", "Brown"],
      5: ["Purple", "Turquoise"],
      6: ["Pink", "Rose Gold"],
      7: ["Indigo", "Violet"],
      8: ["Black", "Platinum"],
      9: ["White", "Rainbow"]
    };
    const daily = dailyColors[personalDayNumber as keyof typeof dailyColors] || ["Blue", "White"];
    return [...daily, ...baseColors.slice(0, 1)].slice(0, 3);
  }

  private static getDailyChallenges(personalDayNumber: number): string[] {
    const challenges = {
      1: ["Impatience with slow progress", "Overly aggressive approach"],
      2: ["Indecision", "Oversensitivity to criticism"],
      3: ["Scattered energy", "Overcommitment to social activities"],
      4: ["Rigidity", "Resistance to change"],
      5: ["Restlessness", "Difficulty with routine"],
      6: ["Taking on too much responsibility", "Neglecting self-care"],
      7: ["Overthinking", "Social withdrawal"],
      8: ["Workaholic tendencies", "Impatience with others"],
      9: ["Emotional overwhelm", "Difficulty saying no"]
    };
    return challenges[personalDayNumber as keyof typeof challenges] || ["Lack of focus"];
  }

  private static getDailyOpportunities(personalDayNumber: number, profile: any): string[] {
    const opportunities = {
      1: ["Start new projects", "Take leadership roles", "Make bold decisions"],
      2: ["Build partnerships", "Mediate conflicts", "Practice diplomacy"],
      3: ["Express creativity", "Network socially", "Communicate ideas"],
      4: ["Organize systems", "Complete practical tasks", "Build foundations"],
      5: ["Embrace change", "Try new experiences", "Travel or explore"],
      6: ["Help others", "Strengthen family bonds", "Create harmony"],
      7: ["Study and research", "Practice meditation", "Seek inner wisdom"],
      8: ["Pursue business goals", "Demonstrate leadership", "Achieve results"],
      9: ["Complete projects", "Serve community", "Share wisdom"]
    };
    return opportunities[personalDayNumber as keyof typeof opportunities] || ["Follow your intuition"];
  }

  // Fallback methods
  private static getFallbackDailyVibe(firstName: string, birthDate: string): DailyVibe {
    const today = new Date();
    const personalDay = (today.getDate() % 9) + 1;

    return {
      date: today.toISOString().split('T')[0],
      personalDayNumber: personalDay,
      energyLevel: 75,
      overallTheme: this.getThemeForDay(personalDay),
      loveInsight: "Trust your heart's wisdom in matters of love.",
      careerGuidance: "Focus on your goals with determination and clarity.",
      healthFocus: "Balance activity with rest for optimal wellbeing.",
      spiritualMessage: "The universe supports your highest good today.",
      luckyNumbers: [personalDay, 11, 22, 33],
      luckyColors: ["Blue", "White", "Gold"],
      challenges: ["Overthinking", "Impatience"],
      opportunities: ["New insights", "Positive connections"]
    };
  }

  private static getFallbackAIInsight(dailyVibe: DailyVibe, userName: string): AIInsight {
    return {
      date: dailyVibe.date,
      improvementArea: "Mindful Awareness",
      specificGuidance: `${userName}, today's energy calls for greater mindfulness and presence in your daily activities.`,
      actionSteps: [
        "Practice 5 minutes of deep breathing",
        "Set clear intentions for the day",
        "Express gratitude for three things"
      ],
      cosmicWisdom: "Your awareness opens doors to infinite possibilities."
    };
  }
}