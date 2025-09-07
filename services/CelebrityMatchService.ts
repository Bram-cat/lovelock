// Celebrity Match Service for finding compatible celebrities using AI
import UniversalAIService from './UniversalAIService';

export interface CelebrityMatch {
  name: string;
  birthDate: string;
  profession: string;
  lifePathNumber: number;
  compatibilityScore: number;
  matchReason: string;
  imageUrl?: string;
  wikiLink?: string;
}

export interface IncompatibleNumbers {
  lifePathNumbers: number[];
  destinyNumbers: number[];
  soulUrgeNumbers: number[];
  reasons: string[];
}

export class CelebrityMatchService {
  
  // Celebrity database with birth dates and professions
  private static readonly CELEBRITY_DATABASE = [
    { name: "Taylor Swift", birthDate: "12/13/1989", profession: "Singer-Songwriter", lifePathNumber: 1 },
    { name: "Leonardo DiCaprio", birthDate: "11/11/1974", profession: "Actor", lifePathNumber: 8 },
    { name: "Oprah Winfrey", birthDate: "01/29/1954", profession: "Media Mogul", lifePathNumber: 4 },
    { name: "Brad Pitt", birthDate: "12/18/1963", profession: "Actor", lifePathNumber: 4 },
    { name: "Angelina Jolie", birthDate: "06/04/1975", profession: "Actress", lifePathNumber: 6 },
    { name: "Jennifer Aniston", birthDate: "02/11/1969", profession: "Actress", lifePathNumber: 2 },
    { name: "George Clooney", birthDate: "05/06/1961", profession: "Actor", lifePathNumber: 1 },
    { name: "Scarlett Johansson", birthDate: "11/22/1984", profession: "Actress", lifePathNumber: 2 },
    { name: "Ryan Gosling", birthDate: "11/12/1980", profession: "Actor", lifePathNumber: 5 },
    { name: "Emma Stone", birthDate: "11/06/1988", profession: "Actress", lifePathNumber: 7 },
    { name: "Chris Hemsworth", birthDate: "08/11/1983", profession: "Actor", lifePathNumber: 4 },
    { name: "Zendaya", birthDate: "09/01/1996", profession: "Actress", lifePathNumber: 8 },
    { name: "Tom Holland", birthDate: "06/01/1996", profession: "Actor", lifePathNumber: 5 },
    { name: "Margot Robbie", birthDate: "07/02/1990", profession: "Actress", lifePathNumber: 1 },
    { name: "Timothée Chalamet", birthDate: "12/27/1995", profession: "Actor", lifePathNumber: 9 },
    { name: "Ariana Grande", birthDate: "06/26/1993", profession: "Singer", lifePathNumber: 9 },
    { name: "Selena Gomez", birthDate: "07/22/1992", profession: "Singer-Actress", lifePathNumber: 4 },
    { name: "Justin Bieber", birthDate: "03/01/1994", profession: "Singer", lifePathNumber: 9 },
    { name: "Dua Lipa", birthDate: "08/22/1995", profession: "Singer", lifePathNumber: 1 },
    { name: "Shawn Mendes", birthDate: "08/08/1998", profession: "Singer", lifePathNumber: 8 },
    { name: "Billie Eilish", birthDate: "12/18/2001", profession: "Singer", lifePathNumber: 5 },
    { name: "Harry Styles", birthDate: "02/01/1994", profession: "Singer-Actor", lifePathNumber: 8 },
    { name: "Dwayne Johnson", birthDate: "05/02/1972", profession: "Actor", lifePathNumber: 8 },
    { name: "Gal Gadot", birthDate: "04/30/1985", profession: "Actress", lifePathNumber: 1 },
    { name: "Michael B. Jordan", birthDate: "02/09/1987", profession: "Actor", lifePathNumber: 9 },
    { name: "Zac Efron", birthDate: "10/18/1987", profession: "Actor", lifePathNumber: 8 },
    { name: "Anne Hathaway", birthDate: "11/12/1982", profession: "Actress", lifePathNumber: 7 },
    { name: "Ryan Reynolds", birthDate: "10/23/1976", profession: "Actor", lifePathNumber: 3 },
    { name: "Blake Lively", birthDate: "08/25/1987", profession: "Actress", lifePathNumber: 4 },
    { name: "Chris Evans", birthDate: "06/13/1981", profession: "Actor", lifePathNumber: 2 },
    { name: "Jennifer Lawrence", birthDate: "08/15/1990", profession: "Actress", lifePathNumber: 6 },
    { name: "Natalie Portman", birthDate: "06/09/1981", profession: "Actress", lifePathNumber: 7 },
    { name: "Emma Watson", birthDate: "04/15/1990", profession: "Actress", lifePathNumber: 2 },
    { name: "Robert Downey Jr.", birthDate: "04/04/1965", profession: "Actor", lifePathNumber: 6 },
    { name: "Priyanka Chopra", birthDate: "07/18/1982", profession: "Actress", lifePathNumber: 9 },
    { name: "Rihanna", birthDate: "02/20/1988", profession: "Singer", lifePathNumber: 4 },
    { name: "Beyoncé", birthDate: "09/04/1981", profession: "Singer", lifePathNumber: 5 },
    { name: "Drake", birthDate: "10/24/1986", profession: "Rapper", lifePathNumber: 4 },
    { name: "The Weeknd", birthDate: "02/16/1990", profession: "Singer", lifePathNumber: 1 },
    { name: "Lady Gaga", birthDate: "03/28/1986", profession: "Singer-Actress", lifePathNumber: 2 }
  ];

  // Find celebrity matches based on numerology compatibility
  static async findCelebrityMatches(
    userLifePath: number,
    userDestiny: number,
    userSoulUrge: number,
    userName: string,
    maxResults: number = 2
  ): Promise<CelebrityMatch[]> {
    
    // Define compatibility matrix for life path numbers
    const compatibleLifePaths = this.getCompatibleLifePaths(userLifePath);
    
    // Filter celebrities by compatible life paths
    const compatibleCelebrities = this.CELEBRITY_DATABASE.filter(celebrity => 
      compatibleLifePaths.includes(celebrity.lifePathNumber)
    );
    
    // Calculate compatibility scores and generate AI-powered match reasons
    const celebrityMatches: CelebrityMatch[] = [];
    
    for (const celebrity of compatibleCelebrities) {
      const compatibilityScore = this.calculateCelebrityCompatibility(
        userLifePath, userDestiny, userSoulUrge,
        celebrity.lifePathNumber
      );
      
      if (compatibilityScore >= 70) {
        try {
          // Generate AI-powered match reason with rate limiting handling
          let matchReason: string;
          try {
            const result = await UniversalAIService.generateCelebrityMatchReason(
              userLifePath,
              celebrity.name,
              celebrity.lifePathNumber,
              compatibilityScore
            );
            matchReason = result.content;
          } catch (error: any) {
            // Handle rate limiting gracefully
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
              console.log(`Rate limited for ${celebrity.name}, using fallback reason`);
              matchReason = this.generateFallbackMatchReason(userName, userLifePath, celebrity.name, celebrity.lifePathNumber, celebrity.profession);
            } else {
              throw error; // Re-throw other errors
            }
          }
          
          celebrityMatches.push({
            name: celebrity.name,
            birthDate: celebrity.birthDate,
            profession: celebrity.profession,
            lifePathNumber: celebrity.lifePathNumber,
            compatibilityScore,
            matchReason,
            wikiLink: `https://en.wikipedia.org/wiki/${celebrity.name.replace(' ', '_')}`
          });
        } catch (error) {
          console.log(`Error generating match for ${celebrity.name}:`, error);
          // Fallback to default reason
          celebrityMatches.push({
            name: celebrity.name,
            birthDate: celebrity.birthDate,
            profession: celebrity.profession,
            lifePathNumber: celebrity.lifePathNumber,
            compatibilityScore,
            matchReason: this.generateFallbackMatchReason(userName, userLifePath, celebrity.name, celebrity.lifePathNumber, celebrity.profession),
            wikiLink: `https://en.wikipedia.org/wiki/${celebrity.name.replace(' ', '_')}`
          });
        }
      }
    }
    
    // Sort by compatibility score and return top matches
    return celebrityMatches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, maxResults);
  }
  
  // Find incompatible numbers to avoid
  static getIncompatibleNumbers(
    userLifePath: number,
    userDestiny: number,
    userSoulUrge: number
  ): IncompatibleNumbers {
    
    const incompatibleLifePaths = this.getIncompatibleLifePaths(userLifePath);
    const incompatibleDestiny = this.getIncompatibleDestinyNumbers(userDestiny);
    const incompatibleSoulUrge = this.getIncompatibleSoulUrgeNumbers(userSoulUrge);
    
    const reasons = [
      `Life Path ${incompatibleLifePaths.join(', ')}: These numbers may create friction with your natural Life Path ${userLifePath} energy.`,
      `Destiny ${incompatibleDestiny.join(', ')}: Could conflict with your Destiny ${userDestiny} purpose and goals.`,
      `Soul Urge ${incompatibleSoulUrge.join(', ')}: May not align with your Soul Urge ${userSoulUrge} inner desires.`,
      "While these combinations aren't impossible, they require extra understanding and compromise.",
      "Remember: Love can overcome any numerical challenges with effort and communication!"
    ];
    
    return {
      lifePathNumbers: incompatibleLifePaths,
      destinyNumbers: incompatibleDestiny,
      soulUrgeNumbers: incompatibleSoulUrge,
      reasons
    };
  }
  
  // Get compatible life path numbers
  private static getCompatibleLifePaths(lifePathNumber: number): number[] {
    const compatibilityMatrix: { [key: number]: number[] } = {
      1: [1, 3, 5, 7, 9],
      2: [2, 4, 6, 8],
      3: [1, 3, 5, 6, 9],
      4: [2, 4, 6, 8],
      5: [1, 3, 5, 7, 9],
      6: [2, 3, 4, 6, 8, 9],
      7: [1, 5, 7, 9],
      8: [2, 4, 6, 8],
      9: [1, 3, 5, 6, 7, 9],
      11: [2, 6, 11],
      22: [4, 8, 22],
      33: [6, 9, 33]
    };
    
    return compatibilityMatrix[lifePathNumber] || [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }
  
  // Get incompatible life path numbers
  private static getIncompatibleLifePaths(lifePathNumber: number): number[] {
    const incompatibilityMatrix: { [key: number]: number[] } = {
      1: [2, 4, 6, 8],
      2: [1, 3, 5, 7, 9],
      3: [2, 4, 7, 8],
      4: [1, 3, 5, 7, 9],
      5: [2, 4, 6, 8],
      6: [1, 5, 7],
      7: [2, 3, 4, 6, 8],
      8: [1, 3, 5, 7, 9],
      9: [2, 4, 8],
      11: [1, 3, 4, 5, 7, 8, 9],
      22: [1, 2, 3, 5, 6, 7, 9],
      33: [1, 2, 3, 4, 5, 7, 8]
    };
    
    return incompatibilityMatrix[lifePathNumber] || [];
  }
  
  // Get incompatible destiny numbers
  private static getIncompatibleDestinyNumbers(destinyNumber: number): number[] {
    // Numbers that create tension based on conflicting purposes
    const conflictMap: { [key: number]: number[] } = {
      1: [2, 4], // Leadership vs cooperation/structure
      2: [1, 8], // Cooperation vs dominance
      3: [4, 8], // Creativity vs rigidity/materialism
      4: [1, 3, 5], // Structure vs freedom/creativity
      5: [4, 6], // Freedom vs responsibility/structure
      6: [5, 8], // Service vs freedom/materialism
      7: [3, 8], // Spirituality vs materialism/show
      8: [2, 3, 6, 7], // Materialism vs cooperation/creativity/service/spirituality
      9: [1, 8] // Humanitarianism vs selfishness/materialism
    };
    
    return conflictMap[destinyNumber] || [];
  }
  
  // Get incompatible soul urge numbers
  private static getIncompatibleSoulUrgeNumbers(soulUrgeNumber: number): number[] {
    // Numbers that create inner conflict
    const soulConflictMap: { [key: number]: number[] } = {
      1: [2, 6], // Independence vs dependence/service
      2: [1, 5], // Harmony vs independence/freedom
      3: [4, 7], // Expression vs restriction/introversion
      4: [3, 5], // Stability vs creativity/freedom
      5: [2, 4, 6], // Freedom vs harmony/stability/service
      6: [1, 5], // Service vs independence/freedom
      7: [3, 8], // Spirituality vs superficiality/materialism
      8: [2, 7, 9], // Material success vs cooperation/spirituality/service
      9: [1, 8] // Universal love vs selfishness/materialism
    };
    
    return soulConflictMap[soulUrgeNumber] || [];
  }
  
  // Calculate compatibility score with celebrity
  private static calculateCelebrityCompatibility(
    userLifePath: number,
    userDestiny: number,
    userSoulUrge: number,
    celebrityLifePath: number
  ): number {
    
    // Base compatibility from life path
    const compatiblePaths = this.getCompatibleLifePaths(userLifePath);
    if (!compatiblePaths.includes(celebrityLifePath)) {
      return 30; // Low compatibility
    }
    
    // Calculate detailed score
    let score = 50; // Base score
    
    // Life path compatibility (primary factor)
    if (userLifePath === celebrityLifePath) {
      score += 40; // Same life path - very high compatibility
    } else {
      // Compatible but different life paths
      const compatibilityBonus = this.getLifePathCompatibilityBonus(userLifePath, celebrityLifePath);
      score += compatibilityBonus;
    }
    
    // Add variety bonus to prevent all scores being the same
    const varietyBonus = Math.floor(Math.random() * 15) + 5; // 5-20 points
    score += varietyBonus;
    
    return Math.min(100, Math.max(50, score));
  }
  
  // Generate fallback match reason when AI is unavailable
  private static generateFallbackMatchReason(
    userName: string,
    userLifePath: number,
    celebrityName: string,
    celebrityLifePath: number,
    celebrityProfession: string
  ): string {
    const compatibilityDescriptions = {
      1: 'independent and ambitious',
      2: 'cooperative and diplomatic',
      3: 'creative and expressive', 
      4: 'practical and reliable',
      5: 'adventurous and free-spirited',
      6: 'nurturing and responsible',
      7: 'analytical and spiritual',
      8: 'successful and achievement-focused',
      9: 'humanitarian and wise'
    };
    
    const userTrait = compatibilityDescriptions[userLifePath] || 'unique';
    const celebrityTrait = compatibilityDescriptions[celebrityLifePath] || 'special';
    
    if (userLifePath === celebrityLifePath) {
      return `Your Life Path ${userLifePath} energy perfectly mirrors ${celebrityName}'s ${celebrityProfession.toLowerCase()} spirit. As fellow ${userTrait} souls, you share the same cosmic frequency and natural understanding.`;
    } else {
      return `Your ${userTrait} Life Path ${userLifePath} energy creates a magnetic resonance with ${celebrityName}'s ${celebrityTrait} Life Path ${celebrityLifePath} vibration. This cosmic alignment suggests deep compatibility and mutual inspiration in your shared journey.`;
    }
  }
  
  // Get life path compatibility bonus
  private static getLifePathCompatibilityBonus(lifePath1: number, lifePath2: number): number {
    const bonusMatrix: { [key: string]: number } = {
      '1-3': 35, '1-5': 40, '1-7': 30, '1-9': 35,
      '2-4': 35, '2-6': 40, '2-8': 30,
      '3-5': 35, '3-6': 30, '3-9': 40,
      '4-6': 35, '4-8': 40,
      '5-7': 35, '5-9': 30,
      '6-8': 25, '6-9': 35,
      '7-9': 35
    };
    
    const key = `${Math.min(lifePath1, lifePath2)}-${Math.max(lifePath1, lifePath2)}`;
    return bonusMatrix[key] || 25;
  }
}