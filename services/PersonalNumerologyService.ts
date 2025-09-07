import { supabase } from '../lib/supabase';
import { ProkeralaNumerologyService, NumerologyReading } from './ProkeralaNumerologyService';

export interface UserNumerologyProfile {
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  lastReadingDate?: string;
  cachedReading?: NumerologyReading;
}

export class PersonalNumerologyService {
  
  /**
   * Get user's numerology profile from database
   */
  static async getUserProfile(userId: string): Promise<UserNumerologyProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, birth_date, birth_time, birth_location')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.log('No user profile found');
        return null;
      }

      return {
        fullName: data.full_name,
        birthDate: data.birth_date,
        birthTime: data.birth_time || undefined,
        birthLocation: data.birth_location || undefined,
      };
    } catch (error) {
      console.error('Exception getting user profile:', error);
      return null;
    }
  }

  /**
   * Get personalized numerology reading for authenticated user
   */
  static async getPersonalizedReading(userId: string): Promise<NumerologyReading | null> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        console.error('User profile not found, cannot generate reading');
        return null;
      }

      console.log('Generating personalized reading for:', profile.fullName);

      // Get comprehensive reading using profile data
      const reading = await ProkeralaNumerologyService.getNumerologyReading(
        profile.fullName,
        profile.birthDate,
        profile.birthTime,
        profile.birthLocation
      );

      if (reading) {
        // Optionally cache the reading in local storage for performance
        await this.cacheReading(userId, reading);
      }

      return reading;
    } catch (error) {
      console.error('Error generating personalized reading:', error);
      return null;
    }
  }

  /**
   * Get personalized daily predictions for authenticated user
   */
  static async getPersonalizedDailyPredictions(userId: string, date?: Date): Promise<{
    love: string;
    career: string;
    health: string;
    spiritual: string;
    luckyNumbers: number[];
    luckyColors: string[];
    energyLevel: number;
  } | null> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        console.error('User profile not found, cannot generate predictions');
        return null;
      }

      console.log('Generating daily predictions for:', profile.fullName, 'on', date?.toDateString() || 'today');

      // Get predictions using enhanced profile data
      const predictions = await ProkeralaNumerologyService.getDailyPredictions(
        profile.fullName,
        profile.birthDate,
        date,
        profile.birthTime,
        profile.birthLocation
      );

      return predictions;
    } catch (error) {
      console.error('Error generating daily predictions:', error);
      return null;
    }
  }

  /**
   * Get love compatibility between user and partner
   */
  static async getLoveCompatibility(
    userId: string, 
    partnerName: string, 
    partnerBirthDate: string
  ): Promise<{
    compatibility: number;
    description: string;
    strengths: string[];
    challenges: string[];
    advice: string;
  } | null> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        console.error('User profile not found, cannot generate compatibility');
        return null;
      }

      console.log('Generating compatibility between:', profile.fullName, 'and', partnerName);

      // Get both readings
      const userReading = await ProkeralaNumerologyService.getNumerologyReading(
        profile.fullName,
        profile.birthDate,
        profile.birthTime,
        profile.birthLocation
      );

      const partnerReading = await ProkeralaNumerologyService.getNumerologyReading(
        partnerName,
        partnerBirthDate
      );

      if (!userReading || !partnerReading) {
        console.error('Unable to generate readings for compatibility analysis');
        return null;
      }

      // Calculate compatibility based on life path numbers
      return this.calculateCompatibility(profile.fullName, partnerName, userReading, partnerReading);
    } catch (error) {
      console.error('Error generating compatibility:', error);
      return null;
    }
  }

  /**
   * Check if user should receive premium upgrade prompt
   */
  static async shouldShowPremiumPrompt(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wants_premium, created_at')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      // Show premium prompt if user initially wanted premium but hasn't upgraded
      // and it's been at least 24 hours since signup
      if (data.wants_premium) {
        const signupDate = new Date(data.created_at);
        const now = new Date();
        const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
        
        return hoursSinceSignup >= 24;
      }

      return false;
    } catch (error) {
      console.error('Error checking premium prompt status:', error);
      return false;
    }
  }

  // Private helper methods

  private static async cacheReading(userId: string, reading: NumerologyReading): Promise<void> {
    try {
      // You could store this in AsyncStorage or a separate cache table
      // For now, just log it
      console.log('Caching reading for user:', userId);
      // await AsyncStorage.setItem(`numerology_${userId}`, JSON.stringify(reading));
    } catch (error) {
      console.error('Error caching reading:', error);
    }
  }

  private static calculateCompatibility(
    userName: string,
    partnerName: string,
    userReading: NumerologyReading,
    partnerReading: NumerologyReading
  ) {
    const userLifePath = userReading.life_path_number;
    const partnerLifePath = partnerReading.life_path_number;
    
    // Compatibility matrix based on numerology principles
    const compatibilityMatrix: { [key: string]: number } = {
      '1-1': 85, '1-2': 75, '1-3': 90, '1-4': 60, '1-5': 80, '1-6': 70, '1-7': 65, '1-8': 85, '1-9': 75,
      '2-2': 90, '2-3': 85, '2-4': 95, '2-5': 60, '2-6': 95, '2-7': 80, '2-8': 70, '2-9': 85,
      '3-3': 80, '3-4': 65, '3-5': 95, '3-6': 85, '3-7': 70, '3-8': 75, '3-9': 90,
      '4-4': 85, '4-5': 55, '4-6': 90, '4-7': 75, '4-8': 90, '4-9': 70,
      '5-5': 75, '5-6': 65, '5-7': 80, '5-8': 70, '5-9': 85,
      '6-6': 95, '6-7': 80, '6-8': 85, '6-9': 90,
      '7-7': 90, '7-8': 75, '7-9': 85,
      '8-8': 80, '8-9': 75,
      '9-9': 85
    };

    const key1 = `${Math.min(userLifePath, partnerLifePath)}-${Math.max(userLifePath, partnerLifePath)}`;
    const compatibility = compatibilityMatrix[key1] || 70;

    const compatibilityDescriptions: { [key: number]: string } = {
      95: "Exceptionally harmonious! You two are like cosmic soulmates, naturally understanding and complementing each other.",
      90: "Highly compatible! Your energies blend beautifully, creating a strong foundation for lasting love.",
      85: "Very good match! You share many compatible traits and can build a wonderful relationship together.",
      80: "Good compatibility! With understanding and effort, you can create a fulfilling partnership.",
      75: "Moderate compatibility. Your differences can be strengths if you learn to appreciate each other's uniqueness.",
      70: "Average compatibility. Success depends on mutual respect and willingness to work through differences.",
      65: "Some challenges ahead, but with patience and communication, you can build a strong bond.",
      60: "Requires effort and understanding, but love can overcome the differences in your life paths.",
      55: "Significant differences, but opposites can attract! Focus on what draws you together."
    };

    const description = compatibilityDescriptions[Math.floor(compatibility / 5) * 5] || compatibilityDescriptions[70];

    return {
      compatibility,
      description: `${userName} (Life Path ${userLifePath}) and ${partnerName} (Life Path ${partnerLifePath}): ${description}`,
      strengths: this.getCompatibilityStrengths(userLifePath, partnerLifePath),
      challenges: this.getCompatibilityChallenges(userLifePath, partnerLifePath),
      advice: this.getCompatibilityAdvice(userLifePath, partnerLifePath, userName, partnerName)
    };
  }

  private static getCompatibilityStrengths(userPath: number, partnerPath: number): string[] {
    const strengths: { [key: string]: string[] } = {
      '1-2': ["Leadership meets cooperation", "Balance of strength and sensitivity", "Complementary decision-making"],
      '1-3': ["Dynamic energy", "Shared creativity", "Inspiring conversations"],
      '2-4': ["Perfect harmony", "Shared love of stability", "Natural teamwork"],
      '3-5': ["Adventure and creativity", "Excellent communication", "Freedom with fun"],
      '6-9': ["Mutual compassion", "Shared humanitarian values", "Deep emotional connection"]
    };
    
    const key = `${Math.min(userPath, partnerPath)}-${Math.max(userPath, partnerPath)}`;
    return strengths[key] || ["Mutual respect", "Learning from differences", "Growth opportunities"];
  }

  private static getCompatibilityChallenges(userPath: number, partnerPath: number): string[] {
    const challenges: { [key: string]: string[] } = {
      '1-4': ["Impatience vs methodical approach", "Freedom vs structure", "Fast pace vs steady rhythm"],
      '5-6': ["Freedom vs commitment", "Adventure vs stability", "Change vs routine"],
      '7-8': ["Spiritual vs material focus", "Introversion vs ambition", "Different priorities"]
    };
    
    const key = `${Math.min(userPath, partnerPath)}-${Math.max(userPath, partnerPath)}`;
    return challenges[key] || ["Different life rhythms", "Communication styles", "Priority differences"];
  }

  private static getCompatibilityAdvice(userPath: number, partnerPath: number, userName: string, partnerName: string): string {
    return `${userName}, your Life Path ${userPath} energy can harmonize beautifully with ${partnerName}'s Life Path ${partnerPath} by focusing on your complementary strengths. Embrace your differences as opportunities to learn and grow together. Communication and mutual respect will be key to your success.`;
  }
}