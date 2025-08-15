export interface UserProfile {
  name: string;
  birthday: string;
  lifePath: number;
  expression: number;
  soulUrge: number;
}

export interface CompatibleMatch {
  lifePath: number;
  expression: number;
  soulUrge: number;
  compatibilityRating: number;
  description: string;
  matchType: string;
  suitableBirthDates: string[];
}

export class LoveMatchService {
  // Numerological combinations for compatibility analysis
  private readonly numerologicalCombinations = [
    { lifePath: 1, expression: 1, soulUrge: 1 },
    { lifePath: 1, expression: 2, soulUrge: 3 },
    { lifePath: 1, expression: 5, soulUrge: 7 },
    { lifePath: 2, expression: 2, soulUrge: 6 },
    { lifePath: 2, expression: 6, soulUrge: 2 },
    { lifePath: 2, expression: 9, soulUrge: 4 },
    { lifePath: 3, expression: 3, soulUrge: 3 },
    { lifePath: 3, expression: 6, soulUrge: 9 },
    { lifePath: 3, expression: 1, soulUrge: 5 },
    { lifePath: 4, expression: 4, soulUrge: 8 },
    { lifePath: 4, expression: 8, soulUrge: 4 },
    { lifePath: 4, expression: 2, soulUrge: 6 },
    { lifePath: 5, expression: 5, soulUrge: 1 },
    { lifePath: 5, expression: 1, soulUrge: 3 },
    { lifePath: 5, expression: 7, soulUrge: 9 },
    { lifePath: 6, expression: 6, soulUrge: 2 },
    { lifePath: 6, expression: 2, soulUrge: 9 },
    { lifePath: 6, expression: 9, soulUrge: 6 },
    { lifePath: 7, expression: 7, soulUrge: 5 },
    { lifePath: 7, expression: 5, soulUrge: 7 },
    { lifePath: 7, expression: 2, soulUrge: 4 },
    { lifePath: 8, expression: 8, soulUrge: 1 },
    { lifePath: 8, expression: 1, soulUrge: 4 },
    { lifePath: 8, expression: 4, soulUrge: 8 },
    { lifePath: 9, expression: 9, soulUrge: 3 },
    { lifePath: 9, expression: 3, soulUrge: 6 },
    { lifePath: 9, expression: 6, soulUrge: 9 },
    { lifePath: 11, expression: 11, soulUrge: 2 },
    { lifePath: 11, expression: 2, soulUrge: 7 },
    { lifePath: 22, expression: 22, soulUrge: 4 },
    { lifePath: 22, expression: 4, soulUrge: 8 },
    { lifePath: 33, expression: 33, soulUrge: 6 },
    { lifePath: 1, expression: 8, soulUrge: 5 },
    { lifePath: 2, expression: 7, soulUrge: 1 },
    { lifePath: 3, expression: 4, soulUrge: 8 },
    { lifePath: 4, expression: 1, soulUrge: 3 },
    { lifePath: 5, expression: 9, soulUrge: 2 },
    { lifePath: 6, expression: 3, soulUrge: 7 },
    { lifePath: 7, expression: 1, soulUrge: 9 },
    { lifePath: 8, expression: 6, soulUrge: 5 },
    { lifePath: 9, expression: 2, soulUrge: 4 }
  ];

  /**
   * Calculate Life Path number from birth date
   */
  private calculateLifePath(birthday: string): number {
    const [month, day, year] = birthday.split('/').map(Number);
    let sum = month + day + year;
    
    // Reduce to single digit (except master numbers 11, 22, 33)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
  }

  /**
   * Calculate Expression number from full name
   */
  private calculateExpression(fullName: string): number {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
      'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    };

    let sum = 0;
    for (const char of fullName.toUpperCase().replace(/[^A-Z]/g, '')) {
      sum += letterValues[char] || 0;
    }

    // Reduce to single digit (except master numbers)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  /**
   * Calculate Soul Urge number from vowels in name
   */
  private calculateSoulUrge(fullName: string): number {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3, 'Y': 7
    };

    let sum = 0;
    for (const char of fullName.toUpperCase().replace(/[^A-Z]/g, '')) {
      if (letterValues[char]) {
        sum += letterValues[char];
      }
    }

    // Reduce to single digit (except master numbers)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  /**
   * Calculate compatibility rating between two profiles
   */
  private calculateCompatibility(user: UserProfile, match: UserProfile): number {
    let compatibility = 0;
    
    // Life Path compatibility (40% weight)
    const lifePathDiff = Math.abs(user.lifePath - match.lifePath);
    const lifePathScore = Math.max(0, 100 - (lifePathDiff * 15));
    compatibility += lifePathScore * 0.4;
    
    // Expression compatibility (35% weight)
    const expressionDiff = Math.abs(user.expression - match.expression);
    const expressionScore = Math.max(0, 100 - (expressionDiff * 12));
    compatibility += expressionScore * 0.35;
    
    // Soul Urge compatibility (25% weight)
    const soulUrgeDiff = Math.abs(user.soulUrge - match.soulUrge);
    const soulUrgeScore = Math.max(0, 100 - (soulUrgeDiff * 10));
    compatibility += soulUrgeScore * 0.25;
    
    // Special bonuses for exact matches
    if (user.lifePath === match.lifePath) compatibility += 10;
    if (user.expression === match.expression) compatibility += 8;
    if (user.soulUrge === match.soulUrge) compatibility += 7;
    
    // Master number bonuses
    if ((user.lifePath === 11 || user.lifePath === 22 || user.lifePath === 33) &&
        (match.lifePath === 11 || match.lifePath === 22 || match.lifePath === 33)) {
      compatibility += 15;
    }

    return Math.min(100, Math.round(compatibility));
  }

  /**
   * Generate compatibility description based on numbers
   */
  private generateCompatibilityDescription(user: UserProfile, match: CompatibleMatch): string {
    const rating = match.compatibilityRating;
    
    if (rating >= 90) {
      return `This numerological combination shows exceptional harmony! Your Life Path ${user.lifePath}, Expression ${user.expression}, and Soul Urge ${user.soulUrge} align beautifully with Life Path ${match.lifePath}, Expression ${match.expression}, and Soul Urge ${match.soulUrge}. This suggests deep understanding and natural compatibility.`;
    } else if (rating >= 75) {
      return `Great compatibility potential! Your numbers (${user.lifePath}-${user.expression}-${user.soulUrge}) complement well with (${match.lifePath}-${match.expression}-${match.soulUrge}), indicating strong potential for a harmonious and supportive relationship.`;
    } else if (rating >= 60) {
      return `Good compatibility match. While there are some numerical differences between (${user.lifePath}-${user.expression}-${user.soulUrge}) and (${match.lifePath}-${match.expression}-${match.soulUrge}), this combination suggests a relationship that could grow stronger through understanding.`;
    } else if (rating >= 45) {
      return `Interesting numerological combination. Your numbers (${user.lifePath}-${user.expression}-${user.soulUrge}) with (${match.lifePath}-${match.expression}-${match.soulUrge}) present both challenges and growth opportunities that could lead to valuable life lessons.`;
    } else {
      return `Challenging but potentially transformative combination. The contrast between (${user.lifePath}-${user.expression}-${user.soulUrge}) and (${match.lifePath}-${match.expression}-${match.soulUrge}) could create growth opportunities through different perspectives.`;
    }
  }

  /**
   * Get match type description
   */
  private getMatchType(user: UserProfile, match: CompatibleMatch): string {
    if (user.lifePath === match.lifePath && user.expression === match.expression && user.soulUrge === match.soulUrge) {
      return "Perfect Mirror Match";
    } else if (user.lifePath === match.lifePath) {
      return "Life Path Harmony";
    } else if (user.expression === match.expression) {
      return "Expression Alignment";
    } else if (user.soulUrge === match.soulUrge) {
      return "Soul Connection";
    } else if (Math.abs(user.lifePath - match.lifePath) <= 1) {
      return "Life Path Complement";
    } else if (Math.abs(user.expression - match.expression) <= 1) {
      return "Expression Balance";
    } else {
      return "Growth Partnership";
    }
  }

  /**
   * Generate suitable birth dates for a numerological combination
   */
  private generateSuitableBirthDates(lifePath: number, expression: number, soulUrge: number): string[] {
    const suitableDates: string[] = [];
    
    // Generate dates based on Life Path number (birth date sum)
    const lifePathDates = this.getDatesForLifePath(lifePath);
    
    // Generate dates based on Expression number (name-based, but we'll use complementary dates)
    const expressionDates = this.getDatesForExpression(expression);
    
    // Generate dates based on Soul Urge number (vowels in name, but we'll use harmonious dates)
    const soulUrgeDates = this.getDatesForSoulUrge(soulUrge);
    
    // Combine and deduplicate dates
    const allDates = [...lifePathDates, ...expressionDates, ...soulUrgeDates];
    const uniqueDates = [...new Set(allDates)];
    
    // Sort dates and return top 8-12 most relevant
    return uniqueDates.sort().slice(0, 10);
  }

  /**
   * Get suitable birth dates for a specific Life Path number
   */
  private getDatesForLifePath(lifePath: number): string[] {
    const dates: string[] = [];
    const currentYear = new Date().getFullYear();
    const birthYears = [currentYear - 25, currentYear - 30, currentYear - 35]; // Common age ranges
    
    // Generate dates that would result in the target Life Path number
    for (const year of birthYears) {
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= Math.min(daysInMonth, 28); day += 3) { // Sample every 3rd day
          const dateSum = this.calculateLifePathFromDate(month, day, year);
          if (dateSum === lifePath) {
            const monthStr = month.toString().padStart(2, '0');
            const dayStr = day.toString().padStart(2, '0');
            dates.push(`${monthStr}/${dayStr}`);
            if (dates.length >= 4) break;
          }
        }
        if (dates.length >= 4) break;
      }
      if (dates.length >= 4) break;
    }
    
    return dates;
  }

  /**
   * Get complementary dates for Expression number
   */
  private getDatesForExpression(expression: number): string[] {
    // Return dates that complement the expression number
    const complementaryDates: { [key: number]: string[] } = {
      1: ["01/01", "10/10", "01/19", "10/28"],
      2: ["02/02", "11/11", "02/20", "11/29"],
      3: ["03/03", "12/12", "03/21", "12/30"],
      4: ["04/04", "01/13", "04/22", "01/31"],
      5: ["05/05", "02/14", "05/23", "02/14"],
      6: ["06/06", "03/15", "06/24", "03/15"],
      7: ["07/07", "04/16", "07/25", "04/16"],
      8: ["08/08", "05/17", "08/26", "05/17"],
      9: ["09/09", "06/18", "09/27", "06/18"],
      11: ["11/02", "02/11", "11/20", "02/29"],
      22: ["04/22", "22/04", "04/13", "13/04"],
      33: ["06/33", "33/06", "06/15", "15/06"]
    };
    
    return complementaryDates[expression] || ["01/01", "06/15", "12/25"];
  }

  /**
   * Get harmonious dates for Soul Urge number
   */
  private getDatesForSoulUrge(soulUrge: number): string[] {
    // Return dates that harmonize with the soul urge number
    const harmoniousDates: { [key: number]: string[] } = {
      1: ["01/10", "10/01", "07/16", "04/13"],
      2: ["02/11", "11/02", "08/17", "05/14"],
      3: ["03/12", "12/03", "09/18", "06/15"],
      4: ["04/13", "01/04", "10/19", "07/16"],
      5: ["05/14", "02/05", "11/20", "08/17"],
      6: ["06/15", "03/06", "12/21", "09/18"],
      7: ["07/16", "04/07", "01/22", "10/19"],
      8: ["08/17", "05/08", "02/23", "11/20"],
      9: ["09/18", "06/09", "03/24", "12/21"],
      11: ["11/11", "02/11", "05/14", "08/17"],
      22: ["02/22", "04/22", "06/24", "08/26"],
      33: ["03/33", "06/33", "09/36", "12/39"]
    };
    
    return harmoniousDates[soulUrge] || ["06/21", "12/21", "03/21", "09/21"];
  }

  /**
   * Calculate Life Path number from specific date components
   */
  private calculateLifePathFromDate(month: number, day: number, year: number): number {
    const dateString = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    return this.calculateLifePath(dateString);
  }

  /**
   * Calculate user's numerological profile
   */
  calculateUserProfile(fullName: string, birthday: string): UserProfile {
    return {
      name: fullName,
      birthday: birthday,
      lifePath: this.calculateLifePath(birthday),
      expression: this.calculateExpression(fullName),
      soulUrge: this.calculateSoulUrge(fullName)
    };
  }

  /**
   * Find compatible matches for a user based on numerological combinations
   */
  findCompatibleMatches(userProfile: UserProfile): CompatibleMatch[] {
    const matches: CompatibleMatch[] = [];

    // Calculate compatibility with each numerological combination
    for (const combination of this.numerologicalCombinations) {
      const mockProfile: UserProfile = {
        name: "",
        birthday: "",
        lifePath: combination.lifePath,
        expression: combination.expression,
        soulUrge: combination.soulUrge
      };
      
      const compatibilityRating = this.calculateCompatibility(userProfile, mockProfile);
      
      const match: CompatibleMatch = {
        lifePath: combination.lifePath,
        expression: combination.expression,
        soulUrge: combination.soulUrge,
        compatibilityRating: compatibilityRating,
        description: "",
        matchType: "",
        suitableBirthDates: []
      };
      
      match.description = this.generateCompatibilityDescription(userProfile, match);
      match.matchType = this.getMatchType(userProfile, match);
      match.suitableBirthDates = this.generateSuitableBirthDates(combination.lifePath, combination.expression, combination.soulUrge);
      matches.push(match);
    }

    // Sort by compatibility rating (highest first) and return top 12
    return matches
      .sort((a, b) => b.compatibilityRating - a.compatibilityRating)
      .slice(0, 12);
  }

  /**
   * Get detailed numerology explanation
   */
  getNumerologyExplanation(number: number, type: 'lifePath' | 'expression' | 'soulUrge'): string {
    const explanations = {
      lifePath: {
        1: "Natural leader, independent, pioneering spirit",
        2: "Cooperative, diplomatic, seeks harmony and partnership",
        3: "Creative, expressive, optimistic and social",
        4: "Practical, hardworking, values stability and order",
        5: "Adventurous, freedom-loving, seeks variety and change",
        6: "Nurturing, responsible, focused on home and family",
        7: "Analytical, spiritual, seeks knowledge and understanding",
        8: "Ambitious, material success, natural business sense",
        9: "Humanitarian, generous, seeks to serve others",
        11: "Intuitive, inspirational, spiritual messenger",
        22: "Master builder, practical visionary, creates lasting impact",
        33: "Master teacher, compassionate healer, serves humanity"
      },
      expression: {
        1: "Leadership abilities, innovation, self-reliance",
        2: "Cooperation, mediation, supportive nature",
        3: "Artistic talents, communication skills, joy-bringing",
        4: "Organization, reliability, methodical approach",
        5: "Versatility, curiosity, progressive thinking",
        6: "Healing abilities, counseling, community service",
        7: "Research, analysis, spiritual seeking",
        8: "Executive abilities, financial acumen, authority",
        9: "Teaching, philanthropy, universal love",
        11: "Inspiration, intuition, enlightenment",
        22: "Master planning, large-scale building, practical idealism",
        33: "Master healing, compassionate service, spiritual teaching"
      },
      soulUrge: {
        1: "Desires independence, leadership, and recognition",
        2: "Seeks love, companionship, and peaceful relationships",
        3: "Craves creative expression, joy, and social connection",
        4: "Wants security, order, and practical achievements",
        5: "Yearns for freedom, adventure, and new experiences",
        6: "Desires to nurture, heal, and create harmony",
        7: "Seeks wisdom, spiritual understanding, and solitude",
        8: "Wants material success, power, and recognition",
        9: "Desires to serve humanity and make a difference",
        11: "Seeks spiritual enlightenment and inspiration",
        22: "Wants to build something lasting and meaningful",
        33: "Desires to heal and teach on a universal level"
      }
    };

    return explanations[type][number as keyof typeof explanations[typeof type]] || "Unique spiritual path";
  }
}
