// Love Match Service using Numerology and Astrology
import { AstrologyService } from './AstrologyService';
import { RoxyNumerologyService, NumerologyReading } from './ProkeralaNumerologyService';

export interface CompatiblePartner {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  compatibilityScore: number;
  description: string;
  strengths: string[];
  challenges: string[];
  sampleBirthDates: string[];
  famousCouples: FamousCouple[];
}

export interface FamousCouple {
  person1: string;
  person2: string;
  birthDate1: string;
  birthDate2: string;
  relationship: string;
  story: string;
  wikiLink?: string;
}

export interface LoveMatchProfile {
  name: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  zodiacSign: string;
  compatiblePartners: CompatiblePartner[];
  idealTraits: string[];
  relationshipStyle: string;
  aiLoveInsights?: string;
  prokeralaInsights?: {
    strengths: string[];
    challenges: string[];
    compatibility: string;
    luckyNumbers: number[];
    luckyColors: string[];
  };
  deadlySinWarning?: DeadlySinWarning;
}

export interface DeadlySinWarning {
  sin: string;
  warning: string;
  consequences: string;
}

export class LoveMatchService {
  
  // Famous couples database with their numerological profiles
  private static readonly FAMOUS_COUPLES: FamousCouple[] = [
    {
      person1: "Will Smith",
      person2: "Jada Pinkett Smith", 
      birthDate1: "09/25/1968",
      birthDate2: "09/18/1971",
      relationship: "Married 1997-2016",
      story: "Both Life Path 1 - strong individual personalities that supported each other's careers",
      wikiLink: "https://en.wikipedia.org/wiki/Will_Smith"
    },
    {
      person1: "Beyoncé",
      person2: "Jay-Z",
      birthDate1: "09/04/1981", 
      birthDate2: "12/04/1969",
      relationship: "Married since 2008",
      story: "Life Path 4 and 7 - practical foundation with spiritual depth. Both born on the 4th!",
      wikiLink: "https://en.wikipedia.org/wiki/Beyonc%C3%A9"
    },
    {
      person1: "Barack Obama",
      person2: "Michelle Obama",
      birthDate1: "08/04/1961",
      birthDate2: "01/17/1964", 
      relationship: "Married since 1992",
      story: "Life Path 2 and 1 - perfect balance of leadership and cooperation",
      wikiLink: "https://en.wikipedia.org/wiki/Barack_Obama"
    },
    {
      person1: "Victoria Beckham",
      person2: "David Beckham",
      birthDate1: "04/17/1974",
      birthDate2: "05/02/1975",
      relationship: "Married since 1999", 
      story: "Life Path 6 and 5 - nurturing love meets adventurous spirit",
      wikiLink: "https://en.wikipedia.org/wiki/Victoria_Beckham"
    },
    {
      person1: "Johnny Depp",
      person2: "Vanessa Paradis",
      birthDate1: "06/09/1963",
      birthDate2: "12/22/1972",
      relationship: "Together 1998-2012",
      story: "Life Path 7 and 8 - artistic depth with material success",
      wikiLink: "https://en.wikipedia.org/wiki/Johnny_Depp"
    },
    {
      person1: "Ryan Reynolds",
      person2: "Blake Lively",
      birthDate1: "10/23/1976",
      birthDate2: "08/25/1987",
      relationship: "Married since 2012",
      story: "Life Path 3 and 4 - creativity balanced with stability. Both born on 25th - destiny alignment!",
      wikiLink: "https://en.wikipedia.org/wiki/Ryan_Reynolds"
    },
    {
      person1: "Kim Kardashian",
      person2: "Kanye West", 
      birthDate1: "10/21/1980",
      birthDate2: "06/08/1977",
      relationship: "Married 2014-2022",
      story: "Life Path 4 and 3 - practical business sense with creative genius",
      wikiLink: "https://en.wikipedia.org/wiki/Kim_Kardashian"
    },
    {
      person1: "Prince William",
      person2: "Kate Middleton",
      birthDate1: "06/21/1982", 
      birthDate2: "01/09/1982",
      relationship: "Married since 2011",
      story: "Life Path 2 and 3 - diplomatic leadership with graceful communication. Born same year - cosmic timing!",
      wikiLink: "https://en.wikipedia.org/wiki/William%2C_Prince_of_Wales"
    },
    {
      person1: "John Legend",
      person2: "Chrissy Teigen",
      birthDate1: "12/28/1978",
      birthDate2: "11/30/1985",
      relationship: "Married since 2013",
      story: "Life Path 1 and 8 - artistic leadership with entrepreneurial spirit",
      wikiLink: "https://en.wikipedia.org/wiki/John_Legend"
    },
    {
      person1: "Justin Timberlake",
      person2: "Jessica Biel",
      birthDate1: "01/31/1981",
      birthDate2: "03/03/1982",
      relationship: "Married since 2012", 
      story: "Life Path 4 and 7 - grounded creativity with spiritual seeking",
      wikiLink: "https://en.wikipedia.org/wiki/Justin_Timberlake"
    },
    {
      person1: "Ashton Kutcher",
      person2: "Mila Kunis",
      birthDate1: "02/07/1978",
      birthDate2: "08/14/1983",
      relationship: "Married since 2015",
      story: "Life Path 7 and 7 - twin souls with identical spiritual paths. Both analytical and intuitive!",
      wikiLink: "https://en.wikipedia.org/wiki/Ashton_Kutcher"
    },
    {
      person1: "Blake Shelton",
      person2: "Gwen Stefani",
      birthDate1: "06/18/1976",
      birthDate2: "10/03/1969",
      relationship: "Married since 2021",
      story: "Life Path 2 and 1 - perfect harmony of cooperation and leadership. Both born on 3rd/18th day!",
      wikiLink: "https://en.wikipedia.org/wiki/Blake_Shelton"
    },
    {
      person1: "George Clooney",
      person2: "Amal Clooney",
      birthDate1: "05/06/1961",
      birthDate2: "02/03/1978",
      relationship: "Married since 2014",
      story: "Life Path 1 and 3 - leadership meets brilliant communication. Both born on days totaling 6 and 3!",
      wikiLink: "https://en.wikipedia.org/wiki/George_Clooney"
    },
    {
      person1: "Tom Hanks",
      person2: "Rita Wilson",
      birthDate1: "07/09/1956",
      birthDate2: "10/26/1956",
      relationship: "Married since 1988",
      story: "Life Path 1 and 8 - creativity with business acumen. Born same year - destined connection!",
      wikiLink: "https://en.wikipedia.org/wiki/Tom_Hanks"
    },
    {
      person1: "Matthew McConaughey",
      person2: "Camila Alves",
      birthDate1: "11/04/1969",
      birthDate2: "01/28/1982",
      relationship: "Married since 2012",
      story: "Life Path 4 and 1 - stability meets independence. Both have birth dates adding to powerful numbers!",
      wikiLink: "https://en.wikipedia.org/wiki/Matthew_McConaughey"
    },
    {
      person1: "Ellen DeGeneres",
      person2: "Portia de Rossi",
      birthDate1: "01/26/1958",
      birthDate2: "01/31/1973",
      relationship: "Married since 2008",
      story: "Life Path 5 and 4 - freedom balanced with stability. Both born in January - shared energy!",
      wikiLink: "https://en.wikipedia.org/wiki/Ellen_DeGeneres"
    },
    {
      person1: "Chris Hemsworth",
      person2: "Elsa Pataky",
      birthDate1: "08/11/1983",
      birthDate2: "07/18/1976",
      relationship: "Married since 2010",
      story: "Life Path 4 and 6 - practical love with nurturing devotion. Master number 11 energy!",
      wikiLink: "https://en.wikipedia.org/wiki/Chris_Hemsworth"
    },
    {
      person1: "Kristen Bell",
      person2: "Dax Shepard",
      birthDate1: "07/18/1980",
      birthDate2: "01/02/1975",
      relationship: "Married since 2013",
      story: "Life Path 7 and 1 - spiritual depth meets leadership. Both born on 18th and 2nd - complementary!",
      wikiLink: "https://en.wikipedia.org/wiki/Kristen_Bell"
    }
  ];

  // Generate basic profile quickly (static data only)
  static generateBasicProfile(name: string, birthDate: string, lifePathNumber: number): LoveMatchProfile {
    console.log('🚀 Generating basic love match profile for immediate display');
    
    const zodiacSign = AstrologyService.getZodiacSign(birthDate);
    const idealTraits = this.getIdealTraits(lifePathNumber, lifePathNumber);
    const relationshipStyle = this.getRelationshipStyle(lifePathNumber, lifePathNumber);
    
    // Generate a basic set of compatible partners (reduced computation)
    const basicCompatiblePartners = this.getBasicCompatiblePartners(lifePathNumber);
    
    return {
      name,
      birthDate,
      lifePathNumber,
      destinyNumber: lifePathNumber, // Use life path as fallback
      soulUrgeNumber: lifePathNumber, // Use life path as fallback
      personalityNumber: lifePathNumber, // Use life path as fallback
      zodiacSign,
      compatiblePartners: basicCompatiblePartners,
      idealTraits,
      relationshipStyle
    };
  }

  // Generate love match profile
  static async generateLoveMatchProfile(name: string, birthDate: string, lifePathNumber?: number, destinyNumber?: number, soulUrgeNumber?: number, personalityNumber?: number): Promise<LoveMatchProfile> {
    // Reset used couples for each new profile to allow fresh matches
    this.usedCouples = new Set();
    
    // Try to get enhanced data from Roxy API first
    let roxyData: NumerologyReading | null = null;
    try {
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      roxyData = await RoxyNumerologyService.getNumerologyReading(firstName, lastName, birthDate);
      console.log('LoveMatch: Enhanced Roxy data retrieved:', roxyData);
    } catch (error) {
      console.log('LoveMatch: Roxy API not available, using provided/fallback numbers:', error);
    }

    // Use Roxy data if available, otherwise use provided numbers or calculate locally
    const finalLifePathNumber = roxyData?.life_path_number || lifePathNumber || this.calculateLifePathFromDate(birthDate);
    const finalDestinyNumber = roxyData?.destiny_number || destinyNumber || this.calculateLifePathFromDate(birthDate);
    const finalSoulUrgeNumber = roxyData?.soul_urge_number || soulUrgeNumber || this.calculateLifePathFromDate(birthDate);
    const finalPersonalityNumber = roxyData?.personality_number || personalityNumber || this.calculateLifePathFromDate(birthDate);
    
    const zodiacSign = AstrologyService.getZodiacSign(birthDate);
    const compatiblePartners = this.findCompatiblePartners(finalLifePathNumber, finalDestinyNumber, finalSoulUrgeNumber);
    const idealTraits = this.getIdealTraits(finalLifePathNumber, finalSoulUrgeNumber);
    const relationshipStyle = this.getRelationshipStyle(finalLifePathNumber, finalSoulUrgeNumber);

    // Enhanced relationship style with Roxy insights
    let enhancedRelationshipStyle = relationshipStyle;
    if (roxyData?.relationship_guidance) {
      enhancedRelationshipStyle += `\n\nProfessional Insight: ${roxyData.relationship_guidance}`;
    }

    return {
      name,
      birthDate,
      lifePathNumber: finalLifePathNumber,
      destinyNumber: finalDestinyNumber,
      soulUrgeNumber: finalSoulUrgeNumber,
      personalityNumber: finalPersonalityNumber,
      zodiacSign,
      compatiblePartners,
      idealTraits,
      relationshipStyle: enhancedRelationshipStyle
    };
  }

  // Get basic compatible partners (quick version)
  private static getBasicCompatiblePartners(lifePathNumber: number): CompatiblePartner[] {
    const compatibleLifePaths = this.getBasicCompatibleNumbers(lifePathNumber);
    const partners: CompatiblePartner[] = [];
    
    compatibleLifePaths.forEach((compatibleNumber, index) => {
      const score = 75 + (Math.random() * 20); // Basic score range
      partners.push({
        lifePathNumber: compatibleNumber,
        destinyNumber: compatibleNumber,
        soulUrgeNumber: compatibleNumber,
        compatibilityScore: Math.round(score),
        description: `A person with Life Path ${compatibleNumber} would be compatible with your energy.`,
        strengths: ["Harmony", "Understanding", "Growth"],
        challenges: ["Balance needed", "Communication important"],
        sampleBirthDates: [],
        famousCouples: []
      });
    });
    
    return partners.slice(0, 3); // Return top 3 for quick display
  }

  // Get basic compatible numbers
  private static getBasicCompatibleNumbers(lifePathNumber: number): number[] {
    const compatibilityMap: { [key: number]: number[] } = {
      1: [1, 5, 7],
      2: [2, 4, 6],
      3: [3, 6, 9],
      4: [2, 4, 8],
      5: [1, 5, 7],
      6: [2, 3, 6],
      7: [1, 5, 7],
      8: [2, 4, 8],
      9: [1, 3, 9]
    };
    
    return compatibilityMap[lifePathNumber] || [lifePathNumber];
  }

  // Find compatible partners based on numerology
  private static findCompatiblePartners(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number): CompatiblePartner[] {
    const compatiblePartners: CompatiblePartner[] = [];
    
    // Define compatibility matrix for life path numbers
    const lifePathCompatibility: { [key: number]: number[] } = {
      1: [1, 5, 7, 9],
      2: [2, 4, 6, 8], 
      3: [3, 6, 9],
      4: [2, 4, 8],
      5: [1, 5, 7],
      6: [2, 3, 6, 9],
      7: [1, 5, 7],
      8: [2, 4, 8],
      9: [1, 3, 6, 9],
      11: [2, 6, 11],
      22: [4, 8, 22],
      33: [6, 9, 33]
    };

    const compatibleLifePaths = lifePathCompatibility[lifePathNumber] || [];
    
    compatibleLifePaths.forEach(compatibleLifePath => {
      // Generate multiple compatible profiles for each life path
      for (let destinyVar = 1; destinyVar <= 9; destinyVar++) {
        for (let soulUrgeVar = 1; soulUrgeVar <= 9; soulUrgeVar++) {
          const score = this.calculateCompatibilityScore(
            lifePathNumber, destinyNumber, soulUrgeNumber,
            compatibleLifePath, destinyVar, soulUrgeVar
          );
          
          if (score >= 70) { // Only include high compatibility matches
            const partner = this.createCompatiblePartner(
              compatibleLifePath, destinyVar, soulUrgeVar, score
            );
            compatiblePartners.push(partner);
          }
        }
      }
    });

    // Sort by compatibility score and return top matches
    return compatiblePartners
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 8); // Return top 8 matches
  }

  // Create a compatible partner profile
  private static createCompatiblePartner(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number, score: number): CompatiblePartner {
    const description = this.getCompatibilityDescription(lifePathNumber, destinyNumber, soulUrgeNumber, score);
    const strengths = this.getCompatibilityStrengths(lifePathNumber, destinyNumber, soulUrgeNumber);
    const challenges = this.getCompatibilityChallenges(lifePathNumber, destinyNumber, soulUrgeNumber);
    const sampleBirthDates = this.generateSampleBirthDates(lifePathNumber, destinyNumber, soulUrgeNumber);
    const famousCouples = this.findFamousCouplesWithNumbers(lifePathNumber, destinyNumber, soulUrgeNumber);

    return {
      lifePathNumber,
      destinyNumber,
      soulUrgeNumber,
      compatibilityScore: score,
      description,
      strengths,
      challenges,
      sampleBirthDates,
      famousCouples
    };
  }

  // Calculate compatibility score between two numerology profiles
  private static calculateCompatibilityScore(
    lifePath1: number, destiny1: number, soulUrge1: number,
    lifePath2: number, destiny2: number, soulUrge2: number
  ): number {
    // Use simple compatibility scoring based on life path numbers
    const baseScore = this.getLifePathCompatibilityScore(lifePath1, lifePath2);
    
    // Add minor adjustments for destiny and soul urge compatibility
    const destinyAdjustment = Math.abs(destiny1 - destiny2) <= 2 ? 3 : -2;
    const soulUrgeAdjustment = Math.abs(soulUrge1 - soulUrge2) <= 2 ? 2 : -1;
    
    const finalScore = baseScore + destinyAdjustment + soulUrgeAdjustment;
    
    return Math.min(Math.max(finalScore, 45), 98); // Keep within reasonable bounds
  }

  // Life path compatibility scoring
  private static getLifePathCompatibilityScore(lifePath1: number, lifePath2: number): number {
    const compatibilityMatrix: { [key: string]: number } = {
      // Life Path 1 compatibilities
      '1-1': 85, '1-2': 75, '1-3': 90, '1-4': 70, '1-5': 95, '1-6': 70, '1-7': 85, '1-8': 80, '1-9': 90,
      // Life Path 2 compatibilities  
      '2-2': 90, '2-3': 75, '2-4': 95, '2-5': 70, '2-6': 90, '2-7': 80, '2-8': 85, '2-9': 85,
      // Life Path 3 compatibilities
      '3-3': 80, '3-4': 65, '3-5': 85, '3-6': 95, '3-7': 75, '3-8': 70, '3-9': 90,
      // Life Path 4 compatibilities
      '4-4': 85, '4-5': 60, '4-6': 80, '4-7': 75, '4-8': 90, '4-9': 70,
      // Life Path 5 compatibilities
      '5-5': 75, '5-6': 70, '5-7': 90, '5-8': 75, '5-9': 80,
      // Life Path 6 compatibilities
      '6-6': 85, '6-7': 75, '6-8': 80, '6-9': 95,
      // Life Path 7 compatibilities
      '7-7': 90, '7-8': 70, '7-9': 85,
      // Life Path 8 compatibilities
      '8-8': 80, '8-9': 75,
      // Life Path 9 compatibilities
      '9-9': 85
    };

    const key = `${Math.min(lifePath1, lifePath2)}-${Math.max(lifePath1, lifePath2)}`;
    return compatibilityMatrix[key] || 50;
  }

  // Destiny number compatibility scoring  
  private static getDestinyCompatibilityScore(destiny1: number, destiny2: number): number {
    // Complementary numbers score higher
    const complementaryPairs = [
      [1, 8], [2, 7], [3, 6], [4, 5], [9, 9]
    ];
    
    const isComplementary = complementaryPairs.some(pair => 
      (pair[0] === destiny1 && pair[1] === destiny2) || 
      (pair[0] === destiny2 && pair[1] === destiny1)
    );

    if (isComplementary) return 90;
    if (destiny1 === destiny2) return 85;
    
    // Calculate based on numeric distance
    const distance = Math.abs(destiny1 - destiny2);
    return Math.max(50, 90 - (distance * 8));
  }

  // Soul urge compatibility scoring
  private static getSoulUrgeCompatibilityScore(soulUrge1: number, soulUrge2: number): number {
    // Similar soul urges often work well together
    if (soulUrge1 === soulUrge2) return 85;
    
    const harmoniousPairs = [
      [1, 5], [2, 6], [3, 9], [4, 8], [7, 7]
    ];

    const isHarmonious = harmoniousPairs.some(pair =>
      (pair[0] === soulUrge1 && pair[1] === soulUrge2) ||
      (pair[0] === soulUrge2 && pair[1] === soulUrge1)
    );

    if (isHarmonious) return 90;
    
    const distance = Math.abs(soulUrge1 - soulUrge2);
    return Math.max(60, 85 - (distance * 5));
  }

  // Generate compatibility description
  private static getCompatibilityDescription(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number, score: number): string {
    const lifePathTraits: { [key: number]: string } = {
      1: "independent and ambitious",
      2: "cooperative and diplomatic", 
      3: "creative and expressive",
      4: "practical and reliable",
      5: "adventurous and free-spirited",
      6: "nurturing and responsible",
      7: "analytical and spiritual", 
      8: "successful and material-focused",
      9: "humanitarian and wise"
    };

    const trait = lifePathTraits[lifePathNumber] || "unique";
    
    if (score >= 90) {
      return `Perfect match! A partner who is ${trait} would complement your energy beautifully. This combination creates harmony and mutual growth.`;
    } else if (score >= 80) {
      return `Excellent compatibility! Someone ${trait} would understand your nature and support your goals. This partnership has great potential.`;
    } else {
      return `Good compatibility! A ${trait} partner could bring balance to your relationship with understanding and patience.`;
    }
  }

  // Get compatibility strengths
  private static getCompatibilityStrengths(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number): string[] {
    const strengthsMap: { [key: number]: string[] } = {
      1: ["Leadership balance", "Mutual independence", "Shared ambition"],
      2: ["Emotional harmony", "Great communication", "Supportive partnership"],
      3: ["Creative synergy", "Fun and laughter", "Artistic collaboration"],
      4: ["Stable foundation", "Practical planning", "Long-term commitment"],
      5: ["Adventure together", "Freedom respect", "Exciting experiences"],
      6: ["Nurturing love", "Family focus", "Caring support"],
      7: ["Deep connection", "Spiritual growth", "Intellectual bond"],
      8: ["Success partnership", "Material stability", "Achievement focus"],
      9: ["Humanitarian goals", "Wisdom sharing", "Compassionate love"]
    };

    return strengthsMap[lifePathNumber] || ["Understanding", "Growth", "Balance"];
  }

  // Get compatibility challenges
  private static getCompatibilityChallenges(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number): string[] {
    const challengesMap: { [key: number]: string[] } = {
      1: ["Power struggles", "Independence vs togetherness", "Ego conflicts"],
      2: ["Over-sensitivity", "Indecision making", "Avoiding confrontation"],
      3: ["Scattered energy", "Inconsistent focus", "Superficial tendencies"],
      4: ["Rigid thinking", "Resistance to change", "Workaholism"],
      5: ["Commitment issues", "Restlessness", "Need for variety"],
      6: ["Over-responsibility", "Perfectionism", "Martyrdom"],
      7: ["Emotional distance", "Over-analysis", "Social withdrawal"],
      8: ["Materialism focus", "Work-life balance", "Status competition"],
      9: ["Idealistic expectations", "Giving too much", "Emotional overwhelm"]
    };

    return challengesMap[lifePathNumber] || ["Communication", "Balance", "Understanding"];
  }

  // Generate sample birth dates that would produce the desired numbers
  private static generateSampleBirthDates(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number): string[] {
    const birthDates: string[] = [];
    const currentYear = new Date().getFullYear();
    
    // Curated pool of attractive dates and months
    const preferredMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All months
    const preferredDays = [
      1, 2, 3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 25, 26, 27, 28
    ]; // Avoid 4, 6, 9, 14, 19, 24, 29+ for superstitious reasons in some cultures
    
    const ageRanges = [
      { min: 20, max: 25 }, // Young adults
      { min: 26, max: 30 }, // Late twenties
      { min: 31, max: 35 }, // Early thirties
      { min: 36, max: 40 }, // Late thirties
      { min: 41, max: 45 }  // Early forties
    ];
    
    // Generate dates across different age ranges for variety
    for (const ageRange of ageRanges) {
      const yearMin = currentYear - ageRange.max;
      const yearMax = currentYear - ageRange.min;
      
      // Try to find 1-2 dates in each age range
      let attemptsInRange = 0;
      const maxAttemptsPerRange = 50;
      
      while (birthDates.length < 6 && attemptsInRange < maxAttemptsPerRange) {
        // Randomly select from curated pools
        const randomMonth = preferredMonths[Math.floor(Math.random() * preferredMonths.length)];
        const randomDay = preferredDays[Math.floor(Math.random() * preferredDays.length)];
        const randomYear = yearMin + Math.floor(Math.random() * (yearMax - yearMin + 1));
        
        const dateStr = `${randomMonth.toString().padStart(2, '0')}/${randomDay.toString().padStart(2, '0')}/${randomYear}`;
        
        // Calculate if this date produces the desired life path
        const calculatedLifePath = this.calculateLifePathFromDate(dateStr);
        
        if (calculatedLifePath === lifePathNumber && !birthDates.includes(dateStr)) {
          birthDates.push(dateStr);
          break; // Move to next age range after finding one
        }
        
        attemptsInRange++;
      }
      
      if (birthDates.length >= 6) break;
    }
    
    // If we still need more dates, fill with additional random dates
    let additionalAttempts = 0;
    while (birthDates.length < 6 && additionalAttempts < 100) {
      const randomMonth = preferredMonths[Math.floor(Math.random() * preferredMonths.length)];
      const randomDay = preferredDays[Math.floor(Math.random() * preferredDays.length)];
      const randomYear = (currentYear - 45) + Math.floor(Math.random() * 30); // Ages 18-48
      
      const dateStr = `${randomMonth.toString().padStart(2, '0')}/${randomDay.toString().padStart(2, '0')}/${randomYear}`;
      
      const calculatedLifePath = this.calculateLifePathFromDate(dateStr);
      
      if (calculatedLifePath === lifePathNumber && !birthDates.includes(dateStr)) {
        birthDates.push(dateStr);
      }
      
      additionalAttempts++;
    }

    return birthDates;
  }

  // Calculate life path number from date string
  private static calculateLifePathFromDate(dateStr: string): number {
    const [month, day, year] = dateStr.split('/').map(Number);
    let sum = month + day + year;
    
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
  }

  // Find famous couples with matching numbers (avoid repetition)
  private static findFamousCouplesWithNumbers(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number): FamousCouple[] {
    // Track used couples globally to avoid repetition across different compatibility matches
    if (!this.usedCouples) {
      this.usedCouples = new Set();
    }

    const matchingCouples = this.FAMOUS_COUPLES.filter(couple => {
      // Skip if this couple was already used
      if (this.usedCouples.has(`${couple.person1}-${couple.person2}`)) {
        return false;
      }

      const person1LifePath = this.calculateLifePathFromDate(couple.birthDate1);
      const person2LifePath = this.calculateLifePathFromDate(couple.birthDate2);
      
      // Check if either person matches the desired life path number or if they're compatible
      const hasMatch = person1LifePath === lifePathNumber || person2LifePath === lifePathNumber;
      const isCompatible = this.getLifePathCompatibilityScore(person1LifePath, person2LifePath) >= 80;
      
      return hasMatch || (isCompatible && (person1LifePath === lifePathNumber || person2LifePath === lifePathNumber));
    });

    // Randomly select 1-2 couples to avoid predictable patterns
    const selectedCouples: FamousCouple[] = [];
    const maxCouples = Math.min(2, matchingCouples.length);
    
    if (matchingCouples.length > 0) {
      // Shuffle the array and take random couples
      const shuffled = [...matchingCouples].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < maxCouples && i < shuffled.length; i++) {
        const couple = shuffled[i];
        selectedCouples.push(couple);
        this.usedCouples.add(`${couple.person1}-${couple.person2}`);
      }
    }

    return selectedCouples;
  }

  // Static property to track used couples
  private static usedCouples: Set<string>;

  // Get ideal traits for a person based on their numbers
  private static getIdealTraits(lifePathNumber: number, soulUrgeNumber: number): string[] {
    const traitsMap: { [key: number]: string[] } = {
      1: ["Confident", "Independent", "Supportive", "Ambitious"],
      2: ["Patient", "Understanding", "Harmonious", "Gentle"],
      3: ["Creative", "Optimistic", "Social", "Expressive"],
      4: ["Reliable", "Practical", "Loyal", "Hardworking"],
      5: ["Adventurous", "Open-minded", "Fun-loving", "Flexible"],
      6: ["Caring", "Responsible", "Family-oriented", "Nurturing"],
      7: ["Intellectual", "Spiritual", "Intuitive", "Deep"],
      8: ["Successful", "Organized", "Determined", "Materially stable"],
      9: ["Compassionate", "Wise", "Humanitarian", "Understanding"]
    };

    return traitsMap[lifePathNumber] || ["Understanding", "Kind", "Loyal", "Supportive"];
  }

  // Get relationship style based on numbers
  private static getRelationshipStyle(lifePathNumber: number, soulUrgeNumber: number): string {
    const styleMap: { [key: number]: string } = {
      1: "You prefer to take the lead in relationships and need a partner who appreciates your independence while providing steady support.",
      2: "You're naturally cooperative and seek harmony. You thrive with a partner who values communication and emotional connection.",
      3: "You bring joy and creativity to relationships. You need someone who appreciates your expressiveness and shares your zest for life.",
      4: "You value stability and loyalty. You work best with someone who shares your practical approach and long-term vision.",
      5: "You need freedom and variety in love. Your ideal partner gives you space while joining you on life's adventures.",
      6: "You're naturally nurturing and family-focused. You need someone who appreciates your caring nature and shares your values.",
      7: "You prefer deep, meaningful connections over surface-level romance. You need someone who respects your need for solitude and spiritual growth.",
      8: "You approach love with the same determination as your career. You need a partner who supports your ambitions and shares your drive for success.",
      9: "You love with your whole heart and need someone who shares your compassionate nature and idealistic worldview."
    };

    return styleMap[lifePathNumber] || "You value deep, meaningful connections and seek a partner who understands and supports your unique nature.";
  }
}