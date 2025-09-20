import { supabase } from '../lib/supabase-client';

export interface UsageRecord {
  id?: string;
  user_id: string;
  feature_type: 'numerology' | 'love_match' | 'trust_assessment';
  used_at: string;
  metadata?: any;
}

export class UsageTrackingService {
  
  // Track numerology reading usage in existing numerology_readings table
  static async trackNumerologyUsage(userId: string, metadata?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('numerology_readings')
        .insert({
          user_id: userId,
          reading_type: 'daily_insight',
          reading_data: {
            usage_type: 'numerology',
            timestamp: new Date().toISOString(),
            ...metadata
          },
          created_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      return false;
    }
  }

  // Track love match usage in existing love_matches table
  static async trackLoveMatchUsage(userId: string, metadata?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('love_matches')
        .insert({
          user_id: userId,
          partner_name: metadata?.name || 'Unknown',
          partner_birth_date: metadata?.birthDate || '1990-01-01',
          compatibility_score: 0, // Placeholder, will be updated by actual match
          match_details: {
            usage_type: 'love_match',
            timestamp: new Date().toISOString(),
            ...metadata
          },
          created_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      return false;
    }
  }

  // Track trust assessment usage in existing trust_assessments table
  static async trackTrustAssessmentUsage(userId: string, metadata?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trust_assessments')
        .insert({
          user_id: userId,
          assessment_data: {
            usage_type: 'trust_assessment',
            timestamp: new Date().toISOString(),
            ...metadata
          },
          trust_score: 0, // Placeholder, will be updated by actual assessment
          created_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      return false;
    }
  }

  // Get usage count from existing tables
  static async getUsageCount(userId: string, featureType: 'numerology' | 'love_match' | 'trust_assessment', timeframe?: Date): Promise<number> {
    try {
      let tableName: string;
      let dateField = 'created_at';
      
      switch (featureType) {
        case 'numerology':
          tableName = 'numerology_readings';
          break;
        case 'love_match':
          tableName = 'love_matches';
          break;
        case 'trust_assessment':
          tableName = 'trust_assessments';
          break;
        default:
          return 0;
      }

      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (timeframe) {
        query = query.gte(dateField, timeframe.toISOString());
      }

      const { count, error } = await query;
      return error ? 0 : (count || 0);
    } catch (error) {
      return 0;
    }
  }

  // Get all usage stats for a user
  static async getUserUsageStats(userId: string): Promise<{
    numerology: number;
    loveMatch: number;
    trustAssessment: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [numerologyCount, loveMatchCount, trustAssessmentCount] = await Promise.all([
        this.getUsageCount(userId, 'numerology', today),
        this.getUsageCount(userId, 'love_match', today),
        this.getUsageCount(userId, 'trust_assessment', today)
      ]);

      return {
        numerology: numerologyCount,
        loveMatch: loveMatchCount,
        trustAssessment: trustAssessmentCount
      };
    } catch (error) {
      return { numerology: 0, loveMatch: 0, trustAssessment: 0 };
    }
  }

  // Check if user has reached daily limit for a feature
  static async hasReachedDailyLimit(userId: string, featureType: 'numerology' | 'love_match' | 'trust_assessment', dailyLimit: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usageCount = await this.getUsageCount(userId, featureType, today);
    return usageCount >= dailyLimit;
  }
}

export default UsageTrackingService;