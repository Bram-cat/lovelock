// Comprehensive Numerology Compatibility Database
// Based on extensive research from numerology.com, seventhlifepath.com, and other authoritative sources

export interface DetailedCompatibility {
  baseScore: number;
  minScore: number;
  maxScore: number;
  strengths: string[];
  challenges: string[];
  description: string;
  relationshipDynamic: string;
  advice: string;
}

export interface NumerologySymbol {
  number: number;
  symbol: string;
  element: string;
  color: string;
  planet: string;
  meaning: string;
}

export class NumerologyCompatibilityDatabase {
  
  // Comprehensive compatibility matrix with realistic score variations
  private static readonly COMPATIBILITY_MATRIX: { [key: string]: DetailedCompatibility } = {
    // Life Path 1 Compatibilities
    '1-1': {
      baseScore: 72,
      minScore: 65,
      maxScore: 79,
      strengths: ['Mutual understanding of independence', 'Shared leadership qualities', 'Ambitious partnership'],
      challenges: ['Power struggles', 'Competition between partners', 'Both want to lead'],
      description: 'Two strong leaders who understand each other\'s drive for success.',
      relationshipDynamic: 'Dynamic but potentially competitive',
      advice: 'Take turns leading and support each other\'s individual goals.'
    },
    '1-2': {
      baseScore: 78,
      minScore: 72,
      maxScore: 84,
      strengths: ['1 leads, 2 supports beautifully', 'Balanced partnership', 'Complementary strengths'],
      challenges: ['1 may be too dominating', '2 might feel overshadowed', 'Communication gaps'],
      description: 'A natural leader paired with a supportive cooperator.',
      relationshipDynamic: 'Harmonious when balanced',
      advice: 'The 1 should appreciate the 2\'s support, while the 2 should express their needs.'
    },
    '1-3': {
      baseScore: 89,
      minScore: 85,
      maxScore: 94,
      strengths: ['Exciting adventures together', 'Creative inspiration', 'Fun and dynamic relationship'],
      challenges: ['3 may be too scattered for 1', '1 may be too serious for 3', 'Different priorities'],
      description: 'One of the best combinations - leadership meets creativity and joy.',
      relationshipDynamic: 'Vibrant and inspiring',
      advice: 'Embrace each other\'s different approaches to life and have fun together.'
    },
    '1-4': {
      baseScore: 65,
      minScore: 58,
      maxScore: 72,
      strengths: ['Strong foundation building', 'Mutual respect for hard work', 'Stable partnership'],
      challenges: ['1 may find 4 too slow', '4 may find 1 too impulsive', 'Different paces'],
      description: 'Solid but sometimes challenging - innovation meets tradition.',
      relationshipDynamic: 'Stable but requires patience',
      advice: 'Find a middle ground between spontaneity and planning.'
    },
    '1-5': {
      baseScore: 84,
      minScore: 79,
      maxScore: 89,
      strengths: ['Adventurous partnership', 'Freedom and independence', 'Dynamic energy'],
      challenges: ['Both may be too independent', 'Lack of commitment', 'Restlessness'],
      description: 'High energy combination that loves freedom and new experiences.',
      relationshipDynamic: 'Exciting but unpredictable',
      advice: 'Make sure to create stability within the adventure.'
    },
    '1-6': {
      baseScore: 81,
      minScore: 76,
      maxScore: 86,
      strengths: ['6 supports 1\'s ambitions', 'Nurturing meets leadership', 'Family-focused'],
      challenges: ['6 may be too controlling', '1 may neglect family duties', 'Different priorities'],
      description: 'Leadership paired with nurturing creates a balanced home life.',
      relationshipDynamic: 'Supportive and family-oriented',
      advice: 'The 1 should appreciate home life, while the 6 gives space for ambition.'
    },
    '1-7': {
      baseScore: 74,
      minScore: 68,
      maxScore: 80,
      strengths: ['Intellectual connection', 'Respect for independence', 'Deep understanding'],
      challenges: ['7 may be too withdrawn', '1 may be too aggressive', 'Communication issues'],
      description: 'Mental compatibility with potential for deep connection.',
      relationshipDynamic: 'Intellectually stimulating',
      advice: 'Create space for both social interaction and quiet contemplation.'
    },
    '1-8': {
      baseScore: 69,
      minScore: 62,
      maxScore: 76,
      strengths: ['Shared ambition', 'Material success', 'Power couple potential'],
      challenges: ['Too much competition', 'Workaholism', 'Neglecting emotions'],
      description: 'Two ambitious personalities that can either clash or conquer together.',
      relationshipDynamic: 'Intense and achievement-focused',
      advice: 'Collaborate instead of competing, and make time for romance.'
    },
    '1-9': {
      baseScore: 77,
      minScore: 71,
      maxScore: 83,
      strengths: ['Shared humanitarian goals', 'Leadership for greater good', 'Inspiring partnership'],
      challenges: ['9 may be too idealistic', '1 may be too self-focused', 'Different motivations'],
      description: 'Leadership meets compassion in a potentially inspiring partnership.',
      relationshipDynamic: 'Purposeful and meaningful',
      advice: 'Align your individual goals with shared humanitarian values.'
    },

    // Life Path 2 Compatibilities  
    '2-2': {
      baseScore: 86,
      minScore: 82,
      maxScore: 90,
      strengths: ['Perfect understanding', 'Emotional harmony', 'Gentle partnership'],
      challenges: ['May lack direction', 'Indecisiveness', 'Too passive'],
      description: 'Two gentle souls who understand each other deeply.',
      relationshipDynamic: 'Harmonious but needs external motivation',
      advice: 'Take turns making decisions and encourage each other to take action.'
    },
    '2-3': {
      baseScore: 71,
      minScore: 65,
      maxScore: 77,
      strengths: ['2 supports 3\'s creativity', 'Emotional and artistic balance', 'Gentle encouragement'],
      challenges: ['3 may be too scattered', '2 may feel neglected', 'Different energy levels'],
      description: 'Supportive energy meets creative expression.',
      relationshipDynamic: 'Creative but uneven',
      advice: 'The 3 should include the 2 in their creative adventures.'
    },
    '2-4': {
      baseScore: 88,
      minScore: 84,
      maxScore: 92,
      strengths: ['Perfect balance of emotions and stability', 'Long-term commitment', 'Building together'],
      challenges: ['May become routine', '4 may be too rigid', '2 may be too emotional'],
      description: 'One of the most stable and harmonious combinations.',
      relationshipDynamic: 'Steady and reliable',
      advice: 'Keep the romance alive within your stable foundation.'
    },
    '2-5': {
      baseScore: 61,
      minScore: 55,
      maxScore: 67,
      strengths: ['5 brings excitement to 2\'s life', 'Adventure and security balance', 'Growth opportunity'],
      challenges: ['Too different paces', '5 may be too restless', '2 may be too clingy'],
      description: 'Stability meets adventure - requires compromise.',
      relationshipDynamic: 'Challenging but growth-oriented',
      advice: 'Find ways to have adventures together while maintaining security.'
    },
    '2-6': {
      baseScore: 91,
      minScore: 87,
      maxScore: 95,
      strengths: ['Both are nurturing', 'Family-focused', 'Emotional support', 'Perfect domestic partnership'],
      challenges: ['May become too comfortable', 'Lack of excitement', 'Over-responsibility'],
      description: 'The most nurturing and family-oriented combination.',
      relationshipDynamic: 'Loving and supportive',
      advice: 'Make sure to maintain your individual identities within the partnership.'
    },
    '2-7': {
      baseScore: 75,
      minScore: 69,
      maxScore: 81,
      strengths: ['Emotional and spiritual connection', 'Intuitive understanding', 'Deep conversations'],
      challenges: ['7 may be too withdrawn', 'Different social needs', 'Communication styles'],
      description: 'Emotional depth meets spiritual seeking.',
      relationshipDynamic: 'Spiritually connected',
      advice: 'Respect each other\'s need for solitude and togetherness.'
    },
    '2-8': {
      baseScore: 79,
      minScore: 74,
      maxScore: 84,
      strengths: ['2 supports 8\'s ambitions', 'Emotional stability for success', 'Balanced partnership'],
      challenges: ['8 may be too focused on work', '2 may feel neglected', 'Different values'],
      description: 'Supportive partnership where emotions balance ambition.',
      relationshipDynamic: 'Supportive of success',
      advice: 'The 8 should prioritize the relationship alongside career goals.'
    },
    '2-9': {
      baseScore: 83,
      minScore: 78,
      maxScore: 88,
      strengths: ['Shared compassion', 'Humanitarian partnership', 'Emotional and spiritual growth'],
      challenges: ['9 may be too idealistic', 'Both may neglect practical matters', 'Over-giving'],
      description: 'Compassionate souls working together for higher purposes.',
      relationshipDynamic: 'Spiritually and emotionally fulfilling',
      advice: 'Balance your idealistic goals with practical relationship needs.'
    },

    // Life Path 3 Compatibilities
    '3-3': {
      baseScore: 76,
      minScore: 70,
      maxScore: 82,
      strengths: ['Creative synergy', 'Fun and laughter', 'Artistic collaboration', 'Mutual understanding'],
      challenges: ['May lack stability', 'Scattered energy', 'Financial irresponsibility'],
      description: 'Double the creativity and double the fun, but needs grounding.',
      relationshipDynamic: 'Creative and joyful',
      advice: 'Make sure to handle practical matters together and stay focused.'
    },
    '3-4': {
      baseScore: 58,
      minScore: 52,
      maxScore: 64,
      strengths: ['4 provides structure for 3\'s creativity', 'Balance of fun and stability', 'Long-term growth'],
      challenges: ['Very different approaches', '4 may be too rigid', '3 may be too scattered'],
      description: 'Creativity meets structure - challenging but potentially rewarding.',
      relationshipDynamic: 'Requires significant compromise',
      advice: 'Appreciate each other\'s different strengths and find middle ground.'
    },
    '3-5': {
      baseScore: 87,
      minScore: 83,
      maxScore: 91,
      strengths: ['Adventure and creativity', 'Freedom-loving partnership', 'Exciting experiences', 'Mutual inspiration'],
      challenges: ['Lack of commitment', 'Financial instability', 'Too much stimulation'],
      description: 'A vibrant, exciting partnership full of adventures and creativity.',
      relationshipDynamic: 'Dynamic and inspiring',
      advice: 'Create some stability within your exciting lifestyle.'
    },
    '3-6': {
      baseScore: 73,
      minScore: 67,
      maxScore: 79,
      strengths: ['6 nurtures 3\'s creativity', 'Family and artistic balance', 'Supportive environment'],
      challenges: ['6 may be too controlling', '3 may feel restricted', 'Different priorities'],
      description: 'Creativity supported by nurturing, but freedom vs. responsibility tensions.',
      relationshipDynamic: 'Nurturing but potentially restrictive',
      advice: 'The 6 should give creative freedom while the 3 appreciates support.'
    },
    '3-7': {
      baseScore: 66,
      minScore: 60,
      maxScore: 72,
      strengths: ['Creative and intellectual stimulation', 'Artistic and spiritual growth', 'Deep conversations'],
      challenges: ['Very different social needs', '7 may be too serious', '3 may be too superficial'],
      description: 'Creative expression meets deep thinking - interesting but challenging.',
      relationshipDynamic: 'Intellectually stimulating but socially mismatched',
      advice: 'Respect each other\'s different ways of processing the world.'
    },
    '3-8': {
      baseScore: 63,
      minScore: 57,
      maxScore: 69,
      strengths: ['Creative and business success', '3 lightens 8\'s intensity', 'Potential for material and artistic achievement'],
      challenges: ['Very different priorities', '8 may not understand 3\'s needs', 'Work vs. play conflicts'],
      description: 'Creativity meets ambition - can work with mutual understanding.',
      relationshipDynamic: 'Potentially successful but requires understanding',
      advice: 'The 8 should value creativity while the 3 supports practical goals.'
    },
    '3-9': {
      baseScore: 85,
      minScore: 81,
      maxScore: 89,
      strengths: ['Creative and humanitarian partnership', 'Artistic expression for greater good', 'Inspiring each other', 'Shared compassion'],
      challenges: ['May neglect practical matters', 'Both can be scattered', 'Over-idealistic'],
      description: 'Creativity and compassion combine for an inspiring partnership.',
      relationshipDynamic: 'Inspiring and meaningful',
      advice: 'Ground your creative and humanitarian dreams in practical action.'
    },

    // Continue with remaining combinations...
    // Life Path 4 Compatibilities
    '4-4': {
      baseScore: 82,
      minScore: 78,
      maxScore: 86,
      strengths: ['Shared values of stability', 'Practical partnership', 'Building together', 'Mutual reliability'],
      challenges: ['May become too routine', 'Resistance to change', 'Lack of spontaneity'],
      description: 'Two builders creating a solid, reliable foundation together.',
      relationshipDynamic: 'Stable and predictable',
      advice: 'Introduce variety and spontaneity to keep the relationship fresh.'
    },
    '4-5': {
      baseScore: 54,
      minScore: 48,
      maxScore: 60,
      strengths: ['5 brings excitement to 4\'s life', 'Potential for growth', 'Balancing stability and adventure'],
      challenges: ['Fundamentally different approaches', '5 may feel trapped', '4 may feel insecure'],
      description: 'Stability meets freedom - one of the most challenging combinations.',
      relationshipDynamic: 'Highly challenging',
      advice: 'Requires significant compromise and understanding from both sides.'
    },
    '4-6': {
      baseScore: 86,
      minScore: 82,
      maxScore: 90,
      strengths: ['Shared focus on family and home', 'Mutual responsibility', 'Building a secure future', 'Practical love'],
      challenges: ['May become too serious', 'Workaholism', 'Neglecting romance'],
      description: 'Two responsible souls building a secure and loving home.',
      relationshipDynamic: 'Responsible and family-focused',
      advice: 'Make time for romance and fun within your structured life.'
    },
    '4-7': {
      baseScore: 78,
      minScore: 73,
      maxScore: 83,
      strengths: ['Mutual respect for depth', 'Building intellectual foundation', 'Quiet strength', 'Loyalty'],
      challenges: ['Both may be too serious', 'Communication challenges', 'Emotional distance'],
      description: 'Two deep thinkers who appreciate substance over superficiality.',
      relationshipDynamic: 'Deep but potentially isolating',
      advice: 'Make effort to connect emotionally and socially with others.'
    },
    '4-8': {
      baseScore: 89,
      minScore: 85,
      maxScore: 93,
      strengths: ['Shared ambition and structure', 'Building material success', 'Mutual respect for hard work', 'Power couple potential'],
      challenges: ['Workaholism', 'Neglecting emotions', 'Too much focus on material goals'],
      description: 'A powerhouse combination for building material and professional success.',
      relationshipDynamic: 'Achievement-focused partnership',
      advice: 'Remember to prioritize your emotional connection alongside your goals.'
    },
    '4-9': {
      baseScore: 67,
      minScore: 61,
      maxScore: 73,
      strengths: ['Building for humanitarian causes', 'Practical idealism', 'Service-oriented partnership'],
      challenges: ['Different motivations', '9 may be too idealistic', '4 may be too practical'],
      description: 'Practical building meets humanitarian idealism.',
      relationshipDynamic: 'Purpose-driven but potentially misaligned',
      advice: 'Find ways to make idealistic dreams practically achievable.'
    },

    // Life Path 5 Compatibilities
    '5-5': {
      baseScore: 81,
      minScore: 76,
      maxScore: 86,
      strengths: ['Mutual love of freedom', 'Adventure partnership', 'Understanding of need for space', 'Dynamic energy'],
      challenges: ['Lack of commitment', 'No stability anchor', 'Scattered energy', 'Financial irresponsibility'],
      description: 'Double the adventure and freedom, but may lack stability.',
      relationshipDynamic: 'Exciting but unstable',
      advice: 'Create some structure and commitment within your free-spirited lifestyle.'
    },
    '5-6': {
      baseScore: 62,
      minScore: 56,
      maxScore: 68,
      strengths: ['6 provides stability for 5\'s adventures', 'Balance of freedom and security', 'Nurturing growth'],
      challenges: ['Fundamental differences in values', '5 may feel restricted', '6 may feel abandoned'],
      description: 'Freedom meets responsibility - challenging but potentially balancing.',
      relationshipDynamic: 'Tension between freedom and security',
      advice: 'The 5 should appreciate security while the 6 allows some freedom.'
    },
    '5-7': {
      baseScore: 74,
      minScore: 69,
      maxScore: 79,
      strengths: ['Intellectual adventures', 'Spiritual exploration', 'Mental stimulation', 'Independent spirits'],
      challenges: ['Both avoid commitment', '7 may be too withdrawn', '5 may be too scattered'],
      description: 'Two free spirits who explore life and ideas together.',
      relationshipDynamic: 'Intellectually adventurous',
      advice: 'Balance your need for freedom with emotional intimacy.'
    },
    '5-8': {
      baseScore: 65,
      minScore: 59,
      maxScore: 71,
      strengths: ['5 inspires 8 to enjoy life', 'Adventure balanced with success', 'Dynamic energy'],
      challenges: ['Very different priorities', '8 may be too controlling', '5 may be irresponsible'],
      description: 'Adventure meets ambition - requires understanding and compromise.',
      relationshipDynamic: 'Potentially dynamic but conflicting',
      advice: 'Find ways to have adventures that also support long-term goals.'
    },
    '5-9': {
      baseScore: 72,
      minScore: 67,
      maxScore: 77,
      strengths: ['Freedom and humanitarian ideals', 'Adventurous compassion', 'Inspiring each other', 'Broad perspectives'],
      challenges: ['May lack practical foundation', 'Both can be scattered', 'Commitment issues'],
      description: 'Free-spirited humanitarians exploring the world together.',
      relationshipDynamic: 'Idealistic and adventurous',
      advice: 'Ground your ideals in practical action and create some stability.'
    },

    // Life Path 6 Compatibilities
    '6-6': {
      baseScore: 88,
      minScore: 84,
      maxScore: 92,
      strengths: ['Perfect understanding of nurturing', 'Family-focused partnership', 'Mutual support', 'Creating beautiful home'],
      challenges: ['May become codependent', 'Over-responsibility', 'Neglecting individual needs'],
      description: 'The ultimate nurturing partnership focused on family and home.',
      relationshipDynamic: 'Deeply nurturing and supportive',
      advice: 'Maintain your individual identities while nurturing each other.'
    },
    '6-7': {
      baseScore: 71,
      minScore: 65,
      maxScore: 77,
      strengths: ['Nurturing meets wisdom', 'Creating peaceful sanctuary', 'Emotional and spiritual growth', 'Deep caring'],
      challenges: ['7 may resist 6\'s nurturing', 'Different social needs', 'Communication styles'],
      description: 'Caring nature meets spiritual depth in a potentially profound connection.',
      relationshipDynamic: 'Quietly profound',
      advice: 'Respect the 7\'s need for solitude while maintaining emotional connection.'
    },
    '6-8': {
      baseScore: 83,
      minScore: 78,
      maxScore: 88,
      strengths: ['6 supports 8\'s ambitions', 'Building successful family life', 'Nurturing success', 'Material and emotional security'],
      challenges: ['8 may be too work-focused', '6 may feel neglected', 'Different priority systems'],
      description: 'Nurturing support meets ambitious drive for comprehensive success.',
      relationshipDynamic: 'Supportive of material and family success',
      advice: 'The 8 should prioritize family time while the 6 supports career goals.'
    },
    '6-9': {
      baseScore: 87,
      minScore: 83,
      maxScore: 91,
      strengths: ['Shared humanitarian values', 'Nurturing for greater good', 'Compassionate partnership', 'Service-oriented love'],
      challenges: ['May neglect own needs', 'Over-giving to others', 'Idealistic expectations'],
      description: 'Two caring souls dedicated to nurturing and serving others.',
      relationshipDynamic: 'Compassionately service-oriented',
      advice: 'Remember to nurture your own relationship while serving others.'
    },

    // Life Path 7 Compatibilities
    '7-7': {
      baseScore: 79,
      minScore: 74,
      maxScore: 84,
      strengths: ['Deep spiritual connection', 'Mutual understanding of need for solitude', 'Intellectual communion', 'Intuitive bond'],
      challenges: ['May become too isolated', 'Lack of practical action', 'Communication challenges'],
      description: 'Two souls meeting on a deep spiritual and intellectual level.',
      relationshipDynamic: 'Spiritually and intellectually profound',
      advice: 'Make sure to engage with the practical world together.'
    },
    '7-8': {
      baseScore: 64,
      minScore: 58,
      maxScore: 70,
      strengths: ['Wisdom supports ambition', 'Balancing material and spiritual', 'Deep thinking about success'],
      challenges: ['Very different values', '8 may be too materialistic', '7 may be too withdrawn'],
      description: 'Spiritual wisdom meets material ambition - challenging combination.',
      relationshipDynamic: 'Philosophically challenging',
      advice: 'Find ways to honor both material success and spiritual growth.'
    },
    '7-9': {
      baseScore: 76,
      minScore: 71,
      maxScore: 81,
      strengths: ['Spiritual and humanitarian partnership', 'Deep wisdom and compassion', 'Meaningful connection', 'Service to humanity'],
      challenges: ['May be too idealistic', 'Neglecting practical needs', 'Both can be withdrawn'],
      description: 'Wisdom and compassion unite for profound spiritual partnership.',
      relationshipDynamic: 'Spiritually meaningful and profound',
      advice: 'Balance your spiritual ideals with practical relationship needs.'
    },

    // Life Path 8 Compatibilities
    '8-8': {
      baseScore: 75,
      minScore: 70,
      maxScore: 80,
      strengths: ['Shared ambition and drive', 'Understanding of material goals', 'Power couple potential', 'Mutual respect'],
      challenges: ['Too competitive', 'Workaholism', 'Neglecting emotional needs', 'Material focus'],
      description: 'Two ambitious souls who can either compete or conquer together.',
      relationshipDynamic: 'Intensely ambitious',
      advice: 'Collaborate instead of competing and make time for emotional intimacy.'
    },
    '8-9': {
      baseScore: 68,
      minScore: 62,
      maxScore: 74,
      strengths: ['Success for humanitarian causes', 'Material resources for service', 'Balancing achievement and compassion'],
      challenges: ['Different motivations', '8 may be too self-focused', '9 may be too idealistic'],
      description: 'Material success meets humanitarian ideals.',
      relationshipDynamic: 'Purpose versus profit tensions',
      advice: 'Align your material success with meaningful service to others.'
    },

    // Life Path 9 Compatibilities
    '9-9': {
      baseScore: 84,
      minScore: 80,
      maxScore: 88,
      strengths: ['Shared humanitarian vision', 'Deep compassion and understanding', 'Service-oriented partnership', 'Spiritual connection'],
      challenges: ['May neglect practical matters', 'Over-idealistic', 'Martyrdom complex', 'Financial challenges'],
      description: 'Two compassionate souls dedicated to serving humanity.',
      relationshipDynamic: 'Profoundly meaningful and service-oriented',
      advice: 'Ground your humanitarian ideals in practical action and financial responsibility.'
    }
  };

  // Numerology symbols and meanings
  private static readonly NUMEROLOGY_SYMBOLS: { [key: number]: NumerologySymbol } = {
    1: {
      number: 1,
      symbol: '☉',
      element: 'Fire',
      color: 'Red',
      planet: 'Sun',
      meaning: 'Leadership, independence, new beginnings, pioneer spirit'
    },
    2: {
      number: 2,
      symbol: '☽',
      element: 'Water',
      color: 'Orange',
      planet: 'Moon',
      meaning: 'Cooperation, diplomacy, partnership, sensitivity'
    },
    3: {
      number: 3,
      symbol: '♃',
      element: 'Fire',
      color: 'Yellow',
      planet: 'Jupiter',
      meaning: 'Creativity, communication, artistic expression, optimism'
    },
    4: {
      number: 4,
      symbol: '♅',
      element: 'Earth',
      color: 'Green',
      planet: 'Uranus',
      meaning: 'Stability, hard work, organization, practicality'
    },
    5: {
      number: 5,
      symbol: '☿',
      element: 'Air',
      color: 'Blue',
      planet: 'Mercury',
      meaning: 'Freedom, adventure, curiosity, dynamic energy'
    },
    6: {
      number: 6,
      symbol: '♀',
      element: 'Earth',
      color: 'Indigo',
      planet: 'Venus',
      meaning: 'Nurturing, responsibility, family, unconditional love'
    },
    7: {
      number: 7,
      symbol: '♆',
      element: 'Water',
      color: 'Violet',
      planet: 'Neptune',
      meaning: 'Spirituality, introspection, mystery, analytical mind'
    },
    8: {
      number: 8,
      symbol: '♄',
      element: 'Earth',
      color: 'Pink',
      planet: 'Saturn',
      meaning: 'Material success, authority, business acumen, achievement'
    },
    9: {
      number: 9,
      symbol: '♂',
      element: 'Fire',
      color: 'Gold',
      planet: 'Mars',
      meaning: 'Humanitarianism, wisdom, completion, universal love'
    }
  };

  // Get detailed compatibility with realistic score variations
  static getDetailedCompatibility(lifePath1: number, lifePath2: number): DetailedCompatibility {
    const key = `${Math.min(lifePath1, lifePath2)}-${Math.max(lifePath1, lifePath2)}`;
    const baseCompat = this.COMPATIBILITY_MATRIX[key];
    
    if (!baseCompat) {
      // Fallback for missing combinations
      return {
        baseScore: 70,
        minScore: 60,
        maxScore: 80,
        strengths: ['Mutual understanding', 'Growth potential', 'Complementary qualities'],
        challenges: ['Communication differences', 'Varying life priorities', 'Adjustment period needed'],
        description: 'A unique pairing with potential for growth and understanding.',
        relationshipDynamic: 'Requires mutual effort',
        advice: 'Focus on understanding each other\'s perspectives and find common ground.'
      };
    }

    return baseCompat;
  }

  // Generate realistic compatibility score with natural fluctuation
  static generateCompatibilityScore(lifePath1: number, lifePath2: number): number {
    const compatibility = this.getDetailedCompatibility(lifePath1, lifePath2);
    const range = compatibility.maxScore - compatibility.minScore;
    const randomFactor = Math.random() * range;
    return Math.round(compatibility.minScore + randomFactor);
  }

  // Get numerology symbol for a life path number
  static getNumerologySymbol(lifePathNumber: number): NumerologySymbol {
    return this.NUMEROLOGY_SYMBOLS[lifePathNumber] || {
      number: lifePathNumber,
      symbol: '✨',
      element: 'Universal',
      color: 'White',
      planet: 'Cosmic',
      meaning: 'Unique spiritual path'
    };
  }

  // Calculate all numerological symbols for a person
  static calculatePersonalSymbols(birthDate: string, fullName: string): {
    lifePathSymbol: NumerologySymbol;
    destinySymbol: NumerologySymbol;
    personalitySymbol: NumerologySymbol;
  } {
    // Calculate life path number
    const lifePathNumber = this.calculateLifePathFromDate(birthDate);
    
    // Calculate destiny number from full name
    const destinyNumber = this.calculateDestinyNumber(fullName);
    
    // Calculate personality number (consonants only)
    const personalityNumber = this.calculatePersonalityNumber(fullName);

    return {
      lifePathSymbol: this.getNumerologySymbol(lifePathNumber),
      destinySymbol: this.getNumerologySymbol(destinyNumber),
      personalitySymbol: this.getNumerologySymbol(personalityNumber)
    };
  }

  // Helper method to calculate life path from date
  private static calculateLifePathFromDate(dateStr: string): number {
    const [month, day, year] = dateStr.split('/').map(Number);
    let sum = month + day + year;
    
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum > 9 ? sum % 9 || 9 : sum; // Convert master numbers to base for compatibility
  }

  // Calculate destiny number from full name
  private static calculateDestinyNumber(fullName: string): number {
    const letterValues: { [key: string]: number } = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    let sum = 0;
    for (const char of fullName.toLowerCase().replace(/[^a-z]/g, '')) {
      sum += letterValues[char] || 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum > 9 ? sum % 9 || 9 : sum;
  }

  // Calculate personality number (consonants only)
  private static calculatePersonalityNumber(fullName: string): number {
    const letterValues: { [key: string]: number } = {
      b: 2, c: 3, d: 4, f: 6, g: 7, h: 8, j: 1, k: 2, l: 3, m: 4,
      n: 5, p: 7, q: 8, r: 9, s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    let sum = 0;
    for (const char of fullName.toLowerCase().replace(/[^bcdfghjklmnpqrstvwxyz]/g, '')) {
      sum += letterValues[char] || 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum > 9 ? sum % 9 || 9 : sum;
  }
}