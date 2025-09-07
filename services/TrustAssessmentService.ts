// Trust Assessment Service using Numerology
import { NumerologyProfile } from './NumerologyService';

export interface TrustProfile {
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  trustworthinessScore: number;
  reliabilityScore: number;
  loyaltyScore: number;
  overallTrustScore: number;
}

export interface TrustAssessment {
  person1: TrustProfile;
  person2: TrustProfile;
  compatibilityScore: number;
  trustIndicators: TrustIndicator[];
  recommendations: string[];
  warningFlags: string[];
  strengthAreas: string[];
}

export interface TrustIndicator {
  category: 'Communication' | 'Reliability' | 'Emotional Stability' | 'Loyalty' | 'Integrity';
  score: number;
  description: string;
  level: 'High' | 'Medium' | 'Low';
}

export class TrustAssessmentService {
  
  // Calculate trust scores based on numerology numbers
  static calculateTrustProfile(name: string, birthDate: string, numerologyProfile: NumerologyProfile): TrustProfile {
    const trustworthinessScore = this.calculateTrustworthinessScore(
      numerologyProfile.lifePathNumber,
      numerologyProfile.destinyNumber,
      numerologyProfile.soulUrgeNumber
    );
    
    const reliabilityScore = this.calculateReliabilityScore(
      numerologyProfile.lifePathNumber,
      numerologyProfile.personalityNumber
    );
    
    const loyaltyScore = this.calculateLoyaltyScore(
      numerologyProfile.soulUrgeNumber,
      numerologyProfile.destinyNumber
    );
    
    const overallTrustScore = Math.round((trustworthinessScore + reliabilityScore + loyaltyScore) / 3);

    return {
      name,
      birthDate,
      lifePathNumber: numerologyProfile.lifePathNumber,
      expressionNumber: numerologyProfile.destinyNumber,
      soulUrgeNumber: numerologyProfile.soulUrgeNumber,
      trustworthinessScore,
      reliabilityScore,
      loyaltyScore,
      overallTrustScore
    };
  }

  // Assess trust compatibility between two people
  static assessTrustCompatibility(profile1: TrustProfile, profile2: TrustProfile): TrustAssessment {
    const compatibilityScore = this.calculateCompatibilityScore(profile1, profile2);
    const trustIndicators = this.generateTrustIndicators(profile1, profile2);
    const recommendations = this.generateRecommendations(profile1, profile2, compatibilityScore);
    const warningFlags = this.identifyWarningFlags(profile1, profile2);
    const strengthAreas = this.identifyStrengthAreas(profile1, profile2);

    return {
      person1: profile1,
      person2: profile2,
      compatibilityScore,
      trustIndicators,
      recommendations,
      warningFlags,
      strengthAreas
    };
  }

  // Calculate trustworthiness based on life path, destiny, and soul urge numbers
  private static calculateTrustworthinessScore(lifePath: number, destiny: number, soulUrge: number): number {
    const trustRatings: { [key: number]: number } = {
      1: 85, // Leaders, honest but can be self-focused
      2: 95, // Highly trustworthy, diplomatic
      3: 75, // Creative but can be inconsistent
      4: 90, // Very reliable and honest
      5: 70, // Adventurous, may struggle with commitment
      6: 95, // Nurturing, highly trustworthy
      7: 80, // Introspective, selective with trust
      8: 85, // Ambitious, generally trustworthy in business
      9: 90, // Humanitarian, trustworthy with higher purpose
      11: 85, // Intuitive, trustworthy but sensitive
      22: 90, // Master builder, very trustworthy
      33: 95  // Master teacher, highly trustworthy
    };

    const lifePathScore = trustRatings[lifePath] || 75;
    const destinyScore = trustRatings[destiny] || 75;
    const soulUrgeScore = trustRatings[soulUrge] || 75;

    return Math.round((lifePathScore + destinyScore + soulUrgeScore) / 3);
  }

  // Calculate reliability score
  private static calculateReliabilityScore(lifePath: number, personality: number): number {
    const reliabilityRatings: { [key: number]: number } = {
      1: 80, // Can be reliable but may prioritize self
      2: 95, // Very reliable and consistent
      3: 70, // Creative but can be scattered
      4: 100, // Extremely reliable
      5: 65, // May struggle with routine reliability
      6: 90, // Very reliable, especially for loved ones
      7: 75, // Reliable but on their own terms
      8: 85, // Reliable in achieving goals
      9: 85, // Reliable for causes they believe in
      11: 80, // Reliable but emotionally driven
      22: 95, // Very reliable in big picture
      33: 90  // Reliable in serving others
    };

    const lifePathReliability = reliabilityRatings[lifePath] || 75;
    const personalityReliability = reliabilityRatings[personality] || 75;

    return Math.round((lifePathReliability + personalityReliability) / 2);
  }

  // Calculate loyalty score
  private static calculateLoyaltyScore(soulUrge: number, destiny: number): number {
    const loyaltyRatings: { [key: number]: number } = {
      1: 75, // Loyal but can be self-focused
      2: 95, // Extremely loyal
      3: 80, // Loyal but may have many connections
      4: 90, // Very loyal and committed
      5: 70, // Struggles with long-term loyalty
      6: 100, // Extremely loyal, especially to family
      7: 85, // Loyal but selective
      8: 80, // Loyal to those who help their success
      9: 90, // Loyal to humanity and causes
      11: 90, // Very loyal emotionally
      22: 85, // Loyal to their mission
      33: 95  // Loyal to serving others
    };

    const soulUrgeLoyal = loyaltyRatings[soulUrge] || 75;
    const destinyLoyal = loyaltyRatings[destiny] || 75;

    return Math.round((soulUrgeLoyal + destinyLoyal) / 2);
  }

  // Calculate compatibility between two trust profiles
  private static calculateCompatibilityScore(profile1: TrustProfile, profile2: TrustProfile): number {
    // Compare life path compatibility
    const lifePathCompatibility = this.getLifePathCompatibility(profile1.lifePathNumber, profile2.lifePathNumber);
    
    // Compare overall trust scores
    const trustScoreDifference = Math.abs(profile1.overallTrustScore - profile2.overallTrustScore);
    const trustCompatibility = 100 - trustScoreDifference;
    
    // Consider complementary strengths
    const complementaryBonus = this.getComplementaryBonus(profile1, profile2);

    return Math.min(100, Math.round((lifePathCompatibility + trustCompatibility + complementaryBonus) / 3));
  }

  // Get life path compatibility score
  private static getLifePathCompatibility(lifePath1: number, lifePath2: number): number {
    const compatibilityMatrix: { [key: string]: number } = {
      // Life Path 1 compatibilities
      '1-1': 85, '1-2': 90, '1-3': 85, '1-4': 80, '1-5': 85, '1-6': 75, '1-7': 80, '1-8': 90, '1-9': 85,
      // Life Path 2 compatibilities
      '2-2': 95, '2-3': 80, '2-4': 90, '2-5': 75, '2-6': 95, '2-7': 85, '2-8': 85, '2-9': 90,
      // Life Path 3 compatibilities
      '3-3': 85, '3-4': 70, '3-5': 90, '3-6': 85, '3-7': 75, '3-8': 80, '3-9': 85,
      // Life Path 4 compatibilities
      '4-4': 90, '4-5': 65, '4-6': 85, '4-7': 80, '4-8': 95, '4-9': 80,
      // Life Path 5 compatibilities
      '5-5': 80, '5-6': 75, '5-7': 85, '5-8': 80, '5-9': 85,
      // Life Path 6 compatibilities
      '6-6': 95, '6-7': 80, '6-8': 85, '6-9': 90,
      // Life Path 7 compatibilities
      '7-7': 85, '7-8': 80, '7-9': 85,
      // Life Path 8 compatibilities
      '8-8': 90, '8-9': 85,
      // Life Path 9 compatibilities
      '9-9': 90
    };

    const key1 = `${Math.min(lifePath1, lifePath2)}-${Math.max(lifePath1, lifePath2)}`;
    return compatibilityMatrix[key1] || 75;
  }

  // Calculate bonus for complementary strengths
  private static getComplementaryBonus(profile1: TrustProfile, profile2: TrustProfile): number {
    let bonus = 0;
    
    // High reliability + High loyalty = great combination
    if (profile1.reliabilityScore >= 85 && profile2.loyaltyScore >= 85) bonus += 10;
    if (profile2.reliabilityScore >= 85 && profile1.loyaltyScore >= 85) bonus += 10;
    
    // Both have high trustworthiness
    if (profile1.trustworthinessScore >= 85 && profile2.trustworthinessScore >= 85) bonus += 15;
    
    return Math.min(20, bonus);
  }

  // Generate trust indicators
  private static generateTrustIndicators(profile1: TrustProfile, profile2: TrustProfile): TrustIndicator[] {
    const indicators: TrustIndicator[] = [];

    // Communication compatibility
    const communicationScore = this.calculateCommunicationScore(profile1.lifePathNumber, profile2.lifePathNumber);
    indicators.push({
      category: 'Communication',
      score: communicationScore,
      description: this.getCommunicationDescription(communicationScore),
      level: communicationScore >= 80 ? 'High' : communicationScore >= 60 ? 'Medium' : 'Low'
    });

    // Reliability assessment
    const avgReliability = Math.round((profile1.reliabilityScore + profile2.reliabilityScore) / 2);
    indicators.push({
      category: 'Reliability',
      score: avgReliability,
      description: this.getReliabilityDescription(avgReliability),
      level: avgReliability >= 80 ? 'High' : avgReliability >= 60 ? 'Medium' : 'Low'
    });

    // Emotional stability
    const emotionalScore = this.calculateEmotionalStability(profile1.soulUrgeNumber, profile2.soulUrgeNumber);
    indicators.push({
      category: 'Emotional Stability',
      score: emotionalScore,
      description: this.getEmotionalStabilityDescription(emotionalScore),
      level: emotionalScore >= 80 ? 'High' : emotionalScore >= 60 ? 'Medium' : 'Low'
    });

    // Loyalty assessment
    const avgLoyalty = Math.round((profile1.loyaltyScore + profile2.loyaltyScore) / 2);
    indicators.push({
      category: 'Loyalty',
      score: avgLoyalty,
      description: this.getLoyaltyDescription(avgLoyalty),
      level: avgLoyalty >= 80 ? 'High' : avgLoyalty >= 60 ? 'Medium' : 'Low'
    });

    return indicators;
  }

  // Helper methods for descriptions
  private static getCommunicationDescription(score: number): string {
    if (score >= 80) return "Excellent communication potential with natural understanding";
    if (score >= 60) return "Good communication with some effort required";
    return "Communication challenges that require patience and understanding";
  }

  private static getReliabilityDescription(score: number): string {
    if (score >= 80) return "Both individuals demonstrate high reliability and consistency";
    if (score >= 60) return "Generally reliable with room for improvement";
    return "Reliability concerns that should be addressed";
  }

  private static getEmotionalStabilityDescription(score: number): string {
    if (score >= 80) return "Strong emotional foundation for trust";
    if (score >= 60) return "Moderate emotional stability with occasional challenges";
    return "Emotional volatility may impact trust development";
  }

  private static getLoyaltyDescription(score: number): string {
    if (score >= 80) return "Strong foundation of mutual loyalty and commitment";
    if (score >= 60) return "Generally loyal with some conditions or limitations";
    return "Loyalty concerns that require attention and discussion";
  }

  // Calculate communication score
  private static calculateCommunicationScore(lifePath1: number, lifePath2: number): number {
    // Communication compatibility matrix
    const communicationMatrix: { [key: string]: number } = {
      '1-2': 85, '1-3': 90, '1-5': 80, '2-6': 95, '2-9': 90,
      '3-5': 95, '3-7': 85, '4-8': 90, '6-9': 95, '7-11': 90
    };

    const key1 = `${Math.min(lifePath1, lifePath2)}-${Math.max(lifePath1, lifePath2)}`;
    const key2 = `${Math.max(lifePath1, lifePath2)}-${Math.min(lifePath1, lifePath2)}`;
    
    return communicationMatrix[key1] || communicationMatrix[key2] || 75;
  }

  // Calculate emotional stability
  private static calculateEmotionalStability(soulUrge1: number, soulUrge2: number): number {
    const stabilityRatings: { [key: number]: number } = {
      1: 80, 2: 95, 3: 75, 4: 90, 5: 70, 6: 95, 7: 85, 8: 85, 9: 90, 11: 80, 22: 90, 33: 95
    };

    const score1 = stabilityRatings[soulUrge1] || 75;
    const score2 = stabilityRatings[soulUrge2] || 75;

    return Math.round((score1 + score2) / 2);
  }

  // Generate personalized recommendations
  private static generateRecommendations(profile1: TrustProfile, profile2: TrustProfile, compatibilityScore: number): string[] {
    const recommendations: string[] = [];

    if (compatibilityScore >= 80) {
      recommendations.push("Your numerology indicates strong trust potential - focus on open communication");
      recommendations.push("Build on your natural compatibility by establishing clear expectations");
    } else if (compatibilityScore >= 60) {
      recommendations.push("Work on understanding each other's communication styles");
      recommendations.push("Take time to build trust gradually through consistent actions");
    } else {
      recommendations.push("Proceed with caution and take time to really get to know each other");
      recommendations.push("Focus on small commitments first before making larger ones");
    }

    // Specific recommendations based on trust scores
    if (profile1.reliabilityScore < 75 || profile2.reliabilityScore < 75) {
      recommendations.push("Work on keeping promises and being consistent in your actions");
    }

    if (profile1.loyaltyScore < 75 || profile2.loyaltyScore < 75) {
      recommendations.push("Discuss your values and what loyalty means to each of you");
    }

    return recommendations;
  }

  // Identify warning flags
  private static identifyWarningFlags(profile1: TrustProfile, profile2: TrustProfile): string[] {
    const warnings: string[] = [];

    if (profile1.overallTrustScore < 70 || profile2.overallTrustScore < 70) {
      warnings.push("Low overall trust scores indicate potential challenges");
    }

    if (Math.abs(profile1.overallTrustScore - profile2.overallTrustScore) > 25) {
      warnings.push("Significant difference in trust levels may cause imbalance");
    }

    if (profile1.reliabilityScore < 60 || profile2.reliabilityScore < 60) {
      warnings.push("Reliability concerns may affect the relationship foundation");
    }

    return warnings;
  }

  // Identify strength areas
  private static identifyStrengthAreas(profile1: TrustProfile, profile2: TrustProfile): string[] {
    const strengths: string[] = [];

    if (profile1.loyaltyScore >= 85 && profile2.loyaltyScore >= 85) {
      strengths.push("Both individuals show strong loyalty potential");
    }

    if (profile1.reliabilityScore >= 85 && profile2.reliabilityScore >= 85) {
      strengths.push("High reliability scores indicate dependable partnership");
    }

    if (profile1.trustworthinessScore >= 85 && profile2.trustworthinessScore >= 85) {
      strengths.push("Both individuals demonstrate high trustworthiness");
    }

    return strengths;
  }

  // Enhanced assessment that considers relationship type
  static assessTrustCompatibilityWithContext(
    profile1: TrustProfile, 
    profile2: TrustProfile, 
    relationshipType: string
  ): TrustAssessment {
    const baseAssessment = this.assessTrustCompatibility(profile1, profile2);
    
    // Customize recommendations and warnings based on relationship type
    const contextualRecommendations = this.getContextualRecommendations(relationshipType, baseAssessment);
    const contextualWarnings = this.getContextualWarnings(relationshipType, baseAssessment);
    
    return {
      ...baseAssessment,
      recommendations: [...baseAssessment.recommendations, ...contextualRecommendations],
      warningFlags: [...baseAssessment.warningFlags, ...contextualWarnings]
    };
  }

  private static getContextualRecommendations(relationshipType: string, assessment: TrustAssessment): string[] {
    const recommendations: string[] = [];
    
    switch (relationshipType) {
      case 'romantic':
        recommendations.push("Focus on emotional intimacy and regular communication about feelings and expectations");
        if (assessment.compatibilityScore > 80) {
          recommendations.push("Your high compatibility suggests potential for deep romantic connection");
        }
        break;
      
      case 'friendship':
        recommendations.push("Build trust through shared experiences and consistent support during challenges");
        recommendations.push("Respect each other's boundaries while maintaining open communication");
        break;
      
      case 'family':
        recommendations.push("Family bonds require understanding each other's different perspectives and life stages");
        recommendations.push("Focus on unconditional support while respecting individual choices");
        break;
      
      case 'business':
        recommendations.push("Establish clear communication protocols and define roles and responsibilities");
        recommendations.push("Regular check-ins and transparent decision-making will strengthen your partnership");
        break;
      
      case 'potential':
        recommendations.push("Take time to observe consistency in actions and words before deepening the connection");
        recommendations.push("Pay attention to how they handle stress and interact with others");
        break;
    }
    
    return recommendations;
  }

  private static getContextualWarnings(relationshipType: string, assessment: TrustAssessment): string[] {
    const warnings: string[] = [];
    
    if (assessment.compatibilityScore < 60) {
      switch (relationshipType) {
        case 'romantic':
          warnings.push("Consider couples counseling or relationship coaching to address compatibility challenges");
          break;
        
        case 'friendship':
          warnings.push("Be mindful of potential conflicts and establish healthy boundaries");
          break;
        
        case 'business':
          warnings.push("Consider creating detailed agreements and having regular performance reviews");
          break;
        
        case 'potential':
          warnings.push("Take extra time to evaluate this relationship before making significant commitments");
          break;
      }
    }
    
    return warnings;
  }
}