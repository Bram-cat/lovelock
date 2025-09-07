// Astrology Service using Horoscope API
export interface AstrologyPrediction {
  sign: string;
  date_range: string;
  current_date: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
  love: string;
  career: string;
  health: string;
  money: string;
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  dates: string;
  traits: string[];
  compatibility: string[];
  colors: string[];
  strengths: string[];
  weaknesses: string[];
}

export class AstrologyService {
  private static readonly HOROSCOPE_API_URL = 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope/';
  
  // Zodiac sign data
  private static readonly ZODIAC_SIGNS: { [key: string]: ZodiacSign } = {
    'aries': {
      name: 'Aries',
      symbol: '♈',
      element: 'Fire',
      dates: 'March 21 - April 19',
      traits: ['Energetic', 'Confident', 'Independent', 'Competitive', 'Impulsive'],
      compatibility: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      colors: ['Red', 'Orange'],
      strengths: ['Leadership', 'Courage', 'Determination', 'Enthusiasm'],
      weaknesses: ['Impatience', 'Aggression', 'Selfishness', 'Impulsiveness']
    },
    'taurus': {
      name: 'Taurus',
      symbol: '♉',
      element: 'Earth',
      dates: 'April 20 - May 20',
      traits: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Stable'],
      compatibility: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      colors: ['Green', 'Pink'],
      strengths: ['Reliability', 'Patience', 'Practicality', 'Devotion'],
      weaknesses: ['Stubbornness', 'Possessiveness', 'Materialism', 'Laziness']
    },
    'gemini': {
      name: 'Gemini',
      symbol: '♊',
      element: 'Air',
      dates: 'May 21 - June 20',
      traits: ['Adaptable', 'Curious', 'Social', 'Witty', 'Indecisive'],
      compatibility: ['Libra', 'Aquarius', 'Aries', 'Leo'],
      colors: ['Yellow', 'Silver'],
      strengths: ['Adaptability', 'Communication', 'Intelligence', 'Versatility'],
      weaknesses: ['Inconsistency', 'Superficiality', 'Indecision', 'Anxiety']
    },
    'cancer': {
      name: 'Cancer',
      symbol: '♋',
      element: 'Water',
      dates: 'June 21 - July 22',
      traits: ['Emotional', 'Intuitive', 'Protective', 'Caring', 'Moody'],
      compatibility: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      colors: ['White', 'Silver'],
      strengths: ['Empathy', 'Nurturing', 'Intuition', 'Loyalty'],
      weaknesses: ['Moodiness', 'Pessimism', 'Manipulation', 'Insecurity']
    },
    'leo': {
      name: 'Leo',
      symbol: '♌',
      element: 'Fire',
      dates: 'July 23 - August 22',
      traits: ['Generous', 'Warm-hearted', 'Creative', 'Enthusiastic', 'Arrogant'],
      compatibility: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      colors: ['Gold', 'Orange'],
      strengths: ['Creativity', 'Generosity', 'Leadership', 'Warmth'],
      weaknesses: ['Arrogance', 'Stubbornness', 'Self-centeredness', 'Laziness']
    },
    'virgo': {
      name: 'Virgo',
      symbol: '♍',
      element: 'Earth',
      dates: 'August 23 - September 22',
      traits: ['Analytical', 'Practical', 'Hardworking', 'Loyal', 'Critical'],
      compatibility: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      colors: ['Navy Blue', 'Grey'],
      strengths: ['Analysis', 'Practicality', 'Hard work', 'Loyalty'],
      weaknesses: ['Criticism', 'Worry', 'Shyness', 'Perfectionism']
    },
    'libra': {
      name: 'Libra',
      symbol: '♎',
      element: 'Air',
      dates: 'September 23 - October 22',
      traits: ['Diplomatic', 'Gracious', 'Fair-minded', 'Social', 'Indecisive'],
      compatibility: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      colors: ['Blue', 'Green'],
      strengths: ['Diplomacy', 'Fairness', 'Social skills', 'Cooperation'],
      weaknesses: ['Indecision', 'Avoidance', 'Self-pity', 'Superficiality']
    },
    'scorpio': {
      name: 'Scorpio',
      symbol: '♏',
      element: 'Water',
      dates: 'October 23 - November 21',
      traits: ['Intense', 'Passionate', 'Mysterious', 'Determined', 'Jealous'],
      compatibility: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      colors: ['Deep Red', 'Black'],
      strengths: ['Determination', 'Passion', 'Intuition', 'Resourcefulness'],
      weaknesses: ['Jealousy', 'Secretiveness', 'Resentment', 'Manipulation']
    },
    'sagittarius': {
      name: 'Sagittarius',
      symbol: '♐',
      element: 'Fire',
      dates: 'November 22 - December 21',
      traits: ['Adventurous', 'Optimistic', 'Freedom-loving', 'Honest', 'Impatient'],
      compatibility: ['Aries', 'Leo', 'Libra', 'Aquarius'],
      colors: ['Purple', 'Turquoise'],
      strengths: ['Adventure', 'Optimism', 'Philosophy', 'Honesty'],
      weaknesses: ['Impatience', 'Carelessness', 'Tactlessness', 'Inconsistency']
    },
    'capricorn': {
      name: 'Capricorn',
      symbol: '♑',
      element: 'Earth',
      dates: 'December 22 - January 19',
      traits: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious', 'Pessimistic'],
      compatibility: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      colors: ['Black', 'Brown'],
      strengths: ['Responsibility', 'Discipline', 'Management', 'Ambition'],
      weaknesses: ['Pessimism', 'Stubbornness', 'Condescension', 'Materialism']
    },
    'aquarius': {
      name: 'Aquarius',
      symbol: '♒',
      element: 'Air',
      dates: 'January 20 - February 18',
      traits: ['Progressive', 'Original', 'Independent', 'Humanitarian', 'Aloof'],
      compatibility: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      colors: ['Blue', 'Silver'],
      strengths: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
      weaknesses: ['Aloofness', 'Unpredictability', 'Stubbornness', 'Detachment']
    },
    'pisces': {
      name: 'Pisces',
      symbol: '♓',
      element: 'Water',
      dates: 'February 19 - March 20',
      traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Overly trusting'],
      compatibility: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
      colors: ['Sea Green', 'Lavender'],
      strengths: ['Compassion', 'Artistic', 'Intuition', 'Gentleness'],
      weaknesses: ['Fearfulness', 'Overly trusting', 'Sadness', 'Escapism']
    }
  };

  // Get zodiac sign from birth date
  static getZodiacSign(birthDate: string): string {
    const [month, day] = birthDate.split('/').map(Number);
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
    
    return 'aries'; // fallback
  }

  // Get zodiac sign information
  static getZodiacInfo(sign: string): ZodiacSign | null {
    return this.ZODIAC_SIGNS[sign.toLowerCase()] || null;
  }

  // Get daily horoscope with improved accuracy
  static async getDailyHoroscope(sign: string): Promise<AstrologyPrediction | null> {
    try {
      // Try real API first
      const response = await fetch(`${this.HOROSCOPE_API_URL}daily?sign=${sign}&day=TODAY`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && (data.data?.horoscope_data || data.horoscope)) {
          return {
            sign: sign,
            date_range: this.getZodiacInfo(sign)?.dates || '',
            current_date: data.date || new Date().toLocaleDateString(),
            description: data.data?.horoscope_data || data.horoscope || '',
            compatibility: this.getAccurateCompatibility(sign),
            mood: this.getAccurateMood(sign),
            color: this.getZodiacInfo(sign)?.colors[0] || 'Blue',
            lucky_number: this.getAccurateLuckyNumber(sign),
            lucky_time: this.getAccurateLuckyTime(sign),
            love: this.getAccurateInsight('love', sign),
            career: this.getAccurateInsight('career', sign),
            health: this.getAccurateInsight('health', sign),
            money: this.getAccurateInsight('money', sign)
          };
        }
      }
      
      // Fall back to accurate local predictions
      return this.getEnhancedFallbackHoroscope(sign);
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      return this.getEnhancedFallbackHoroscope(sign);
    }
  }

  // Get weekly horoscope from API
  static async getWeeklyHoroscope(sign: string): Promise<AstrologyPrediction | null> {
    try {
      const response = await fetch(`${this.HOROSCOPE_API_URL}weekly?sign=${sign}&day=THIS_WEEK`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.getFallbackHoroscope(sign);
    } catch (error) {
      console.error('Error fetching weekly horoscope:', error);
      return this.getFallbackHoroscope(sign);
    }
  }

  // Fallback horoscope when API fails
  private static getFallbackHoroscope(sign: string): AstrologyPrediction {
    const zodiac = this.ZODIAC_SIGNS[sign.toLowerCase()];
    const today = new Date().toLocaleDateString();
    
    const fallbackPredictions: { [key: string]: string } = {
      'aries': 'Your natural leadership qualities are highlighted today. Trust your instincts and take initiative in important matters.',
      'taurus': 'Stability and patience will serve you well today. Focus on practical matters and enjoy simple pleasures.',
      'gemini': 'Communication is key today. Your versatility and adaptability will help you navigate any challenges.',
      'cancer': 'Trust your intuition today. Your nurturing nature will be appreciated by those around you.',
      'leo': 'Your creativity and enthusiasm are at their peak. Share your ideas and let your natural charisma shine.',
      'virgo': 'Attention to detail will pay off today. Your practical approach will solve any problems that arise.',
      'libra': 'Harmony and balance are important today. Your diplomatic skills will help resolve any conflicts.',
      'scorpio': 'Your determination and passion will guide you today. Trust your deep instincts about people and situations.',
      'sagittarius': 'Adventure calls today. Your optimistic outlook will attract positive opportunities.',
      'capricorn': 'Your disciplined approach will yield results today. Stay focused on your long-term goals.',
      'aquarius': 'Your unique perspective is valuable today. Don&apos;t be afraid to think outside the box.',
      'pisces': 'Your compassion and intuition are heightened today. Trust your feelings about people and situations.'
    };

    return {
      sign: zodiac?.name || sign,
      date_range: zodiac?.dates || '',
      current_date: today,
      description: fallbackPredictions[sign.toLowerCase()] || 'Today brings opportunities for growth and self-discovery.',
      compatibility: zodiac?.compatibility[0] || 'Universal',
      mood: 'Positive',
      color: zodiac?.colors[0] || 'Blue',
      lucky_number: String(Math.floor(Math.random() * 9) + 1),
      lucky_time: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      love: this.getRandomInsight('love'),
      career: this.getRandomInsight('career'),
      health: this.getRandomInsight('health'),
      money: this.getRandomInsight('money')
    };
  }

  // Enhanced fallback with more accurate predictions
  private static getEnhancedFallbackHoroscope(sign: string): AstrologyPrediction {
    const zodiac = this.ZODIAC_SIGNS[sign.toLowerCase()];
    const today = new Date().toLocaleDateString();
    
    // More accurate, sign-specific predictions
    const enhancedPredictions = this.getSignSpecificPredictions(sign);
    
    return {
      sign: zodiac?.name || sign,
      date_range: zodiac?.dates || '',
      current_date: today,
      description: enhancedPredictions.general,
      compatibility: this.getAccurateCompatibility(sign),
      mood: this.getAccurateMood(sign),
      color: zodiac?.colors[0] || 'Blue',
      lucky_number: this.getAccurateLuckyNumber(sign),
      lucky_time: this.getAccurateLuckyTime(sign),
      love: enhancedPredictions.love,
      career: enhancedPredictions.career,
      health: enhancedPredictions.health,
      money: enhancedPredictions.money
    };
  }

  // Get sign-specific predictions based on actual astrological traits
  private static getSignSpecificPredictions(sign: string) {
    const zodiac = this.ZODIAC_SIGNS[sign.toLowerCase()];
    if (!zodiac) return this.getGenericPredictions();

    const predictions = {
      'aries': {
        general: 'Your fiery Mars energy is especially strong today. Take initiative on projects you\'ve been postponing.',
        love: 'Your passionate nature attracts romantic opportunities. Be direct but not overwhelming.',
        career: 'Leadership opportunities arise. Your competitive spirit gives you an edge in negotiations.',
        health: 'High energy levels support physical activities. Channel restlessness into exercise.',
        money: 'Impulsive spending urges are strong. Take time to consider major purchases carefully.'
      },
      'taurus': {
        general: 'Venus influences bring stability and comfort. Focus on practical matters and enjoy simple pleasures.',
        love: 'Steady, reliable energy attracts long-term partners. Express love through thoughtful gestures.',
        career: 'Patience and persistence pay off. Your practical approach solves complex problems.',
        health: 'Comfort foods appeal, but moderation is key. Gentle, consistent exercise works best.',
        money: 'Financial stability improves through careful planning. Good day for long-term investments.'
      },
      'gemini': {
        general: 'Mercury enhances communication. Multiple projects and social connections bring opportunities.',
        love: 'Witty conversation charms potential partners. Variety and mental stimulation strengthen bonds.',
        career: 'Networking and communication skills shine. Multiple tasks require good organization.',
        health: 'Mental stimulation is as important as physical activity. Try activities that engage your mind.',
        money: 'Multiple income streams look promising. Avoid scattered financial decisions.'
      },
      'cancer': {
        general: 'Moon influences heighten intuition. Trust your emotional instincts about people and situations.',
        love: 'Nurturing energy creates deep emotional connections. Family relationships also benefit.',
        career: 'Empathy and intuition guide successful decisions. Caring for team members builds loyalty.',
        health: 'Emotional wellbeing directly affects physical health. Create a peaceful environment.',
        money: 'Security-focused financial decisions feel right. Trust instincts about investments.'
      },
      'leo': {
        general: 'Solar energy illuminates your natural charisma. Creative self-expression brings recognition.',
        love: 'Generous, warm-hearted approach attracts admirers. Creative romantic gestures work well.',
        career: 'Leadership qualities shine in group settings. Creative projects receive positive attention.',
        health: 'Heart-centered activities boost vitality. Creative pursuits energize mind and body.',
        money: 'Generous spending on others brings joy. Balance giving with saving for future goals.'
      },
      'virgo': {
        general: 'Analytical Mercury energy helps perfect important details. Organization brings peace of mind.',
        love: 'Thoughtful attention to partner\'s needs strengthens relationships. Practical gestures show love.',
        career: 'Attention to detail catches important errors. Organizational skills impress supervisors.',
        health: 'Structured wellness routines yield the best results. Focus on nutrition and preventive care.',
        money: 'Careful budgeting and analysis improve financial position. Review and optimize expenses.'
      },
      'libra': {
        general: 'Venus brings harmony and balance. Diplomatic skills help resolve conflicts gracefully.',
        love: 'Charm and fairness attract quality relationships. Aesthetic beauty enhances romantic appeal.',
        career: 'Mediation and partnership skills create win-win situations. Aesthetic projects flourish.',
        health: 'Balance in all areas supports wellbeing. Beautiful environments enhance health.',
        money: 'Balanced approach to spending and saving works well. Aesthetic purchases bring lasting joy.'
      },
      'scorpio': {
        general: 'Plutonian transformation energy runs deep. Trust your intense instincts about hidden truths.',
        love: 'Magnetic intensity attracts profound connections. Emotional honesty deepens existing bonds.',
        career: 'Investigative skills uncover valuable information. Transformation projects succeed.',
        health: 'Emotional healing supports physical recovery. Deep breathing and meditation help.',
        money: 'Research reveals profitable opportunities. Trust instincts about financial transformations.'
      },
      'sagittarius': {
        general: 'Jupiter expands horizons through learning and adventure. Optimism attracts opportunities.',
        love: 'Philosophical discussions and shared adventures strengthen bonds. International connections flourish.',
        career: 'Vision and enthusiasm inspire teams. Educational or travel-related work succeeds.',
        health: 'Adventure and exploration energize your spirit. Outdoor activities boost vitality.',
        money: 'Optimistic investments show promise. International or educational spending brings growth.'
      },
      'capricorn': {
        general: 'Saturn supports disciplined progress toward long-term goals. Structure brings success.',
        love: 'Responsible, mature approach to relationships builds lasting foundations. Patience pays off.',
        career: 'Discipline and ambition lead to recognition. Long-term planning shows results.',
        health: 'Structured fitness routines and consistent habits support lasting health improvements.',
        money: 'Conservative financial strategies build solid foundations. Long-term investments mature.'
      },
      'aquarius': {
        general: 'Uranian innovation brings unique solutions. Group activities and humanitarian causes inspire.',
        love: 'Unconventional approaches to romance work well. Friendship forms the basis of love.',
        career: 'Original ideas and team collaboration create breakthrough innovations. Technology helps.',
        health: 'Alternative health approaches prove effective. Group fitness activities motivate.',
        money: 'Innovative investment strategies and group financial ventures show potential.'
      },
      'pisces': {
        general: 'Neptunian intuition and compassion guide decisions. Creative and spiritual pursuits flourish.',
        love: 'Empathetic connection creates soulmate-level bonds. Artistic expression enhances romance.',
        career: 'Intuition guides creative and healing work. Compassionate leadership inspires others.',
        health: 'Water activities and spiritual practices support healing. Listen to body\'s subtle signals.',
        money: 'Intuitive financial decisions prove wise. Charitable giving brings unexpected returns.'
      }
    };

    return predictions[sign.toLowerCase()] || this.getGenericPredictions();
  }

  private static getGenericPredictions() {
    return {
      general: 'Today brings opportunities for personal growth and positive change.',
      love: 'Open communication strengthens romantic connections.',
      career: 'Professional opportunities arise through networking and collaboration.',
      health: 'Balance between activity and rest supports overall wellbeing.',
      money: 'Thoughtful financial decisions create stability and growth.'
    };
  }

  // More accurate helper methods
  private static getAccurateCompatibility(sign: string): string {
    const zodiac = this.getZodiacInfo(sign);
    if (!zodiac?.compatibility.length) return 'Open to all signs today';
    
    const today = new Date().getDay(); // 0-6
    const compatibleSign = zodiac.compatibility[today % zodiac.compatibility.length];
    return `Excellent harmony with ${compatibleSign} today`;
  }

  private static getAccurateMood(sign: string): string {
    const zodiac = this.getZodiacInfo(sign);
    if (!zodiac) return 'Balanced';
    
    const elementMoods = {
      'Fire': ['Energetic', 'Passionate', 'Confident', 'Dynamic'],
      'Earth': ['Stable', 'Practical', 'Grounded', 'Focused'],
      'Air': ['Social', 'Communicative', 'Intellectual', 'Versatile'],
      'Water': ['Intuitive', 'Emotional', 'Empathetic', 'Reflective']
    };
    
    const moods = elementMoods[zodiac.element] || ['Balanced'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  private static getAccurateLuckyNumber(sign: string): string {
    const zodiac = this.getZodiacInfo(sign);
    if (!zodiac) return String(Math.floor(Math.random() * 9) + 1);
    
    // Use sign's traditional lucky numbers if available, otherwise element-based
    const elementNumbers = {
      'Fire': [1, 3, 9, 10, 19, 28],
      'Earth': [2, 6, 8, 15, 24, 33],
      'Air': [5, 7, 14, 16, 23, 41],
      'Water': [4, 11, 13, 22, 29, 38]
    };
    
    const numbers = elementNumbers[zodiac.element] || [7, 11, 21];
    return String(numbers[Math.floor(Math.random() * numbers.length)]);
  }

  private static getAccurateLuckyTime(sign: string): string {
    const zodiac = this.getZodiacInfo(sign);
    if (!zodiac) return `${Math.floor(Math.random() * 12) + 1}:00 AM`;
    
    // Element-based lucky times
    const elementTimes = {
      'Fire': ['6:00 AM', '12:00 PM', '3:00 PM', '9:00 PM'],
      'Earth': ['7:00 AM', '2:00 PM', '8:00 PM', '11:00 PM'],
      'Air': ['8:00 AM', '11:00 AM', '4:00 PM', '7:00 PM'],
      'Water': ['5:00 AM', '9:00 AM', '6:00 PM', '10:00 PM']
    };
    
    const times = elementTimes[zodiac.element] || ['12:00 PM'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private static getAccurateInsight(type: 'love' | 'career' | 'health' | 'money', sign: string): string {
    const specific = this.getSignSpecificPredictions(sign);
    return specific[type] || this.getRandomInsight(type);
  }

  // Get compatibility between two zodiac signs
  static getCompatibility(sign1: string, sign2: string): {
    score: number;
    description: string;
    strengths: string[];
    challenges: string[];
  } {
    const zodiac1 = this.ZODIAC_SIGNS[sign1.toLowerCase()];
    const zodiac2 = this.ZODIAC_SIGNS[sign2.toLowerCase()];

    if (!zodiac1 || !zodiac2) {
      return {
        score: 50,
        description: 'Compatibility analysis unavailable',
        strengths: [],
        challenges: []
      };
    }

    // Calculate compatibility score based on element compatibility
    let score = 50; // base score
    
    // Same element = higher compatibility
    if (zodiac1.element === zodiac2.element) {
      score += 20;
    }
    
    // Compatible elements
    const elementCompatibility: { [key: string]: string[] } = {
      'Fire': ['Air', 'Fire'],
      'Earth': ['Water', 'Earth'],
      'Air': ['Fire', 'Air'],
      'Water': ['Earth', 'Water']
    };
    
    if (elementCompatibility[zodiac1.element]?.includes(zodiac2.element)) {
      score += 15;
    }

    // Check if they are in each other's compatibility list
    if (zodiac1.compatibility.includes(zodiac2.name)) score += 15;
    if (zodiac2.compatibility.includes(zodiac1.name)) score += 15;

    // Generate description based on score
    let description = '';
    if (score >= 80) {
      description = `${zodiac1.name} and ${zodiac2.name} have excellent compatibility! Your shared values and complementary traits create a harmonious partnership.`;
    } else if (score >= 60) {
      description = `${zodiac1.name} and ${zodiac2.name} have good compatibility. With understanding and effort, this can be a rewarding relationship.`;
    } else if (score >= 40) {
      description = `${zodiac1.name} and ${zodiac2.name} have moderate compatibility. Success depends on mutual respect and compromise.`;
    } else {
      description = `${zodiac1.name} and ${zodiac2.name} may face challenges, but with patience and understanding, you can learn from each other.`;
    }

    return {
      score: Math.min(100, score),
      description,
      strengths: this.getCompatibilityStrengths(zodiac1, zodiac2),
      challenges: this.getCompatibilityChallenges(zodiac1, zodiac2)
    };
  }

  private static getCompatibilityStrengths(zodiac1: ZodiacSign, zodiac2: ZodiacSign): string[] {
    const strengths: string[] = [];
    
    // Find common traits (with null safety)
    const traits1 = zodiac1.traits || [];
    const traits2 = zodiac2.traits || [];
    const commonTraits = traits1.filter(trait => 
      traits2.some(t2 => t2.toLowerCase().includes(trait.toLowerCase().substring(0, 3)))
    );
    
    if (commonTraits.length > 0) {
      strengths.push(`Shared traits: ${commonTraits.join(', ')}`);
    }
    
    // Element compatibility strengths
    if (zodiac1.element === zodiac2.element) {
      strengths.push(`Same ${zodiac1.element} element creates natural understanding`);
    }
    
    // Add specific strengths based on elements
    if (zodiac1.element === 'Fire' && zodiac2.element === 'Air') {
      strengths.push('Fire and Air elements fuel each other\'s passions and ideas');
    } else if (zodiac1.element === 'Earth' && zodiac2.element === 'Water') {
      strengths.push('Earth and Water elements create stability and emotional depth');
    }
    
    return strengths;
  }

  private static getCompatibilityChallenges(zodiac1: ZodiacSign, zodiac2: ZodiacSign): string[] {
    const challenges: string[] = [];
    
    // Find conflicting weaknesses (with null safety)
    const weaknesses1 = zodiac1.weaknesses || [];
    const weaknesses2 = zodiac2.weaknesses || [];
    const conflictingWeaknesses = weaknesses1.filter(weakness => 
      weaknesses2.includes(weakness)
    );
    
    if (conflictingWeaknesses.length > 0) {
      challenges.push(`Both may struggle with: ${conflictingWeaknesses.join(', ')}`);
    }
    
    // Element-based challenges
    if ((zodiac1.element === 'Fire' && zodiac2.element === 'Water') ||
        (zodiac1.element === 'Water' && zodiac2.element === 'Fire')) {
      challenges.push('Fire and Water elements may clash - balance passion with emotion');
    } else if ((zodiac1.element === 'Earth' && zodiac2.element === 'Air') ||
               (zodiac1.element === 'Air' && zodiac2.element === 'Earth')) {
      challenges.push('Earth and Air elements may have different paces - balance practicality with ideas');
    }
    
    return challenges;
  }

  // Get trust insights based on zodiac sign
  static getTrustInsights(sign: string): {
    trustworthiness: number;
    trustStyle: string;
    trustChallenges: string[];
    trustStrengths: string[];
  } {
    const zodiac = this.ZODIAC_SIGNS[sign.toLowerCase()];
    if (!zodiac) {
      return {
        trustworthiness: 50,
        trustStyle: 'Unknown',
        trustChallenges: [],
        trustStrengths: []
      };
    }

    // Calculate trustworthiness based on zodiac traits
    let trustworthiness = 50;
    
    // Positive traits that increase trust
    const trustPositiveTraits = ['reliable', 'loyal', 'honest', 'responsible', 'devoted', 'practical'];
    const traits = zodiac.traits || [];
    const positiveCount = traits.filter(trait => 
      trustPositiveTraits.some(trustTrait => trait.toLowerCase().includes(trustTrait))
    ).length;
    
    trustworthiness += positiveCount * 10;
    
    // Negative traits that decrease trust
    const trustNegativeTraits = ['impulsive', 'moody', 'jealous', 'manipulative', 'unpredictable'];
    const negativeCount = traits.filter(trait => 
      trustNegativeTraits.some(trustTrait => trait.toLowerCase().includes(trustTrait))
    ).length;
    
    trustworthiness -= negativeCount * 5;
    
    // Element-based trust style
    const trustStyles: { [key: string]: string } = {
      'Fire': 'Direct and passionate - trusts quickly but expects loyalty',
      'Earth': 'Steady and reliable - builds trust gradually through consistency',
      'Air': 'Intellectual and communicative - trusts through open dialogue',
      'Water': 'Intuitive and emotional - trusts based on emotional connection'
    };

    return {
      trustworthiness: Math.max(0, Math.min(100, trustworthiness)),
      trustStyle: trustStyles[zodiac.element] || 'Balanced approach to trust',
      trustChallenges: (zodiac.weaknesses || []).filter(weakness => 
        ['stubbornness', 'jealousy', 'manipulation', 'secretiveness', 'unpredictability'].includes(weakness.toLowerCase())
      ),
      trustStrengths: (zodiac.strengths || []).filter(strength => 
        ['loyalty', 'reliability', 'honesty', 'devotion', 'responsibility'].includes(strength.toLowerCase())
      )
    };
  }

  // Helper methods for generating dynamic content
  private static getRandomCompatibility(sign: string): string {
    const zodiacInfo = this.getZodiacInfo(sign);
    const compatibleSigns = zodiacInfo?.compatibility || [];
    const randomSign = compatibleSigns[Math.floor(Math.random() * compatibleSigns.length)];
    return `High compatibility with ${randomSign}`;
  }

  private static getRandomMood(): string {
    const moods = ['Energetic', 'Calm', 'Optimistic', 'Focused', 'Creative', 'Confident', 'Peaceful', 'Ambitious'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  private static getRandomLuckyNumber(): string {
    return String(Math.floor(Math.random() * 99) + 1);
  }

  private static getRandomLuckyTime(): string {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const period = Math.random() > 0.5 ? 'AM' : 'PM';
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  private static getRandomInsight(type: 'love' | 'career' | 'health' | 'money'): string {
    const insights = {
      love: [
        'A meaningful connection is on the horizon',
        'Communication is key in your relationships today',
        'Trust your heart, but use your head',
        'New romantic opportunities may arise',
        'Focus on self-love first'
      ],
      career: [
        'A promotion or recognition is coming your way',
        'Network with colleagues today for future opportunities',
        'Your creative ideas will be well-received',
        'Take calculated risks in your professional life',
        'Leadership opportunities await you'
      ],
      health: [
        'Listen to your body and rest when needed',
        'A new fitness routine will boost your energy',
        'Mental health is just as important as physical health',
        'Hydration and nutrition are key today',
        'Stress management techniques will serve you well'
      ],
      money: [
        'Financial stability is within reach',
        'A unexpected source of income may appear',
        'Be cautious with major purchases today',
        'Investment opportunities look promising',
        'Budget wisely to achieve your goals'
      ]
    };
    
    const typeInsights = insights[type];
    return typeInsights[Math.floor(Math.random() * typeInsights.length)];
  }
}