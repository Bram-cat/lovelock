export interface NumerologyReading {
  life_path_number: number;
  destiny_number: number;
  soul_urge_number: number;
  personality_number: number;
  birth_day_number: number;
  expression_number: number;
  life_path_description: string;
  destiny_description: string;
  soul_urge_description: string;
  personality_description: string;
  lucky_numbers: number[];
  lucky_colors: string[];
  strengths: string[];
  challenges: string[];
  career_guidance: string;
  relationship_guidance: string;
  spiritual_guidance: string;
}

export interface RoxyApiResponse {
  success: boolean;
  data: {
    life_path_number?: number;
    destiny_number?: number;
    soul_urge_number?: number;
    interpretations?: any;
  };
}

export class RoxyNumerologyService {
  private static readonly API_TOKEN = process.env.ROXY_TOKEN;
  private static readonly BASE_URL =
    "https://roxyapi.com/api/v1/data/astro/numerology";

  // Rate limiting for Roxy API - standard rate limiting
  private static roxyCallTimes: number[] = [];
  private static readonly ROXY_MAX_REQUESTS_PER_MINUTE = 60;
  private static readonly ROXY_RATE_WINDOW = 60000; // 1 minute window

  // Response caching for Roxy API
  private static responseCache = new Map<
    string,
    { data: any; timestamp: number }
  >();
  private static readonly CACHE_DURATION = 600000; // 10 minutes for numerology readings

  // Rate limiting for Roxy API
  private static async waitForRoxyRateLimit(): Promise<void> {
    const now = Date.now();

    // Clean old calls outside the rate window
    this.roxyCallTimes = this.roxyCallTimes.filter(
      (callTime) => now - callTime < this.ROXY_RATE_WINDOW
    );

    // If we've made max calls in the last minute, wait
    if (this.roxyCallTimes.length >= this.ROXY_MAX_REQUESTS_PER_MINUTE) {
      const oldestCall = Math.min(...this.roxyCallTimes);
      const waitTime = this.ROXY_RATE_WINDOW - (now - oldestCall) + 100; // +100ms buffer

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Record this call
    this.roxyCallTimes.push(now);
  }

  // Check cache for existing response
  private static getCachedRoxyResponse(cacheKey: string): any | null {
    const cached = this.responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    return null;
  }

  // Store response in cache
  private static setCachedRoxyResponse(cacheKey: string, data: any): void {
    this.responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.responseCache.delete(key);
      }
    }
  }

  // Generate cache key for requests
  private static generateRoxyCacheKey(
    firstName: string,
    lastName: string,
    birthDate: string
  ): string {
    return `roxy_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${birthDate}`;
  }

  // Simplified Roxy API request - try but don't block on failure
  private static async makeRoxyRequest(
    endpoint: string,
    params: any
  ): Promise<any> {
    if (!this.API_TOKEN) {
      throw new Error("No Roxy API token configured");
    }

    await this.waitForRoxyRateLimit();

    const url = new URL(`${this.BASE_URL}/${endpoint}`);

    // Add all parameters including token to URL
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    url.searchParams.append("token", this.API_TOKEN);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Roxy API request failed: ${response.status}`);
    }

    return await response.json();
  }

  // Get comprehensive numerology reading using Roxy API (via birth chart)
  static async getNumerologyReading(
    firstName: string,
    lastName: string,
    birthDate: string,
    birthTime?: string
  ): Promise<NumerologyReading | null> {
    const cacheKey = this.generateRoxyCacheKey(firstName, lastName, birthDate);

    // Check cache first
    const cachedResponse = this.getCachedRoxyResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    console.log("Attempting to fetch from Roxy API for numerology reading");

    try {
      // Convert MM/DD/YYYY to YYYY-MM-DD format if needed
      let formattedBirthDate = birthDate;
      if (birthDate.includes("/")) {
        const [month, day, year] = birthDate.split("/");
        formattedBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Try to get basic numerology data from Roxy API
      const params = {
        first_name: firstName,
        last_name: lastName,
        birthdate: formattedBirthDate,
      };

      // Try main numerology endpoint
      const roxyData = await this.makeRoxyRequest("", params);

      if (roxyData) {
        console.log("✅ Successfully fetched from Roxy numerology API");
        // Transform response to our format
        const reading = this.transformRoxyDataToReading(
          roxyData,
          firstName,
          lastName,
          birthDate
        );

        // Cache the result
        this.setCachedRoxyResponse(cacheKey, reading);
        return reading;
      }

      // Fallback if API fails
      const fallbackData = this.getFallbackNumerology(
        firstName + " " + lastName,
        birthDate
      );
      this.setCachedRoxyResponse(cacheKey, fallbackData);
      return fallbackData;
    } catch (error) {
      console.log("🔄 Roxy API unavailable, using enhanced local calculations...");

      const fallbackData = this.getFallbackNumerology(
        firstName + " " + lastName,
        birthDate
      );
      this.setCachedRoxyResponse(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  // Transform Roxy API numerology data to our NumerologyReading interface
  private static transformRoxyDataToReading(
    roxyData: any,
    firstName: string,
    lastName: string,
    birthDate: string
  ): NumerologyReading {
    const fullName = `${firstName} ${lastName}`;

    // Extract numbers from Roxy numerology API response with fallbacks
    const lifePathNumber =
      roxyData.life_path_number || this.calculateLifePathNumber(birthDate);
    const destinyNumber =
      roxyData.destiny_number ||
      roxyData.expression_number ||
      this.calculateDestinyNumber(fullName);
    const soulUrgeNumber =
      roxyData.soul_urge_number ||
      roxyData.hearts_desire_number ||
      this.calculateSoulUrgeNumber(fullName);
    const personalityNumber =
      roxyData.personality_number || this.calculatePersonalityNumber(fullName);

    return {
      life_path_number: lifePathNumber,
      destiny_number: destinyNumber,
      soul_urge_number: soulUrgeNumber,
      personality_number: personalityNumber,
      birth_day_number:
        roxyData.birth_day_number || this.calculateBirthDayNumber(birthDate),
      expression_number: roxyData.expression_number || destinyNumber,
      life_path_description: this.getLifePathDescription(lifePathNumber),
      destiny_description: this.getDestinyDescription(destinyNumber),
      soul_urge_description: this.getSoulUrgeDescription(soulUrgeNumber),
      personality_description:
        this.getPersonalityDescription(personalityNumber),
      lucky_numbers: this.generateLuckyNumbers(lifePathNumber),
      lucky_colors: this.getLuckyColors(lifePathNumber),
      strengths: this.getStrengths(lifePathNumber),
      challenges: this.getChallenges(lifePathNumber),
      career_guidance: this.getCareerGuidance(lifePathNumber, firstName),
      relationship_guidance: this.getRelationshipGuidance(
        lifePathNumber,
        firstName
      ),
      spiritual_guidance: this.getSpiritualGuidance(lifePathNumber, firstName),
    };
  }

  // Get life path number (fallback to local calculation)
  static async getLifePathNumber(birthDate: string): Promise<number> {
    // Since Roxy API doesn't have direct numerology endpoints, use local calculation
    return this.calculateLifePathNumber(birthDate);
  }

  // Get destiny number (fallback to local calculation)
  static async getDestinyNumber(
    firstName: string,
    lastName: string
  ): Promise<number> {
    // Since Roxy API doesn't have direct numerology endpoints, use local calculation
    return this.calculateDestinyNumber(`${firstName} ${lastName}`);
  }

  // Enhance API data with additional insights
  private static enhanceNumerologyData(
    data: NumerologyReading,
    name: string
  ): NumerologyReading {
    return {
      ...data,
      lucky_numbers:
        data.lucky_numbers || this.generateLuckyNumbers(data.life_path_number),
      lucky_colors:
        data.lucky_colors || this.getLuckyColors(data.life_path_number),
      strengths: data.strengths || this.getStrengths(data.life_path_number),
      challenges: data.challenges || this.getChallenges(data.life_path_number),
      career_guidance:
        data.career_guidance ||
        this.getCareerGuidance(data.life_path_number, name),
      relationship_guidance:
        data.relationship_guidance ||
        this.getRelationshipGuidance(data.life_path_number, name),
      spiritual_guidance:
        data.spiritual_guidance ||
        this.getSpiritualGuidance(data.life_path_number, name),
    };
  }

  // Fallback numerology calculation when API fails
  private static getFallbackNumerology(
    name: string,
    birthDate: string
  ): NumerologyReading {
    const lifePathNumber = this.calculateLifePathNumber(birthDate);
    const destinyNumber = this.calculateDestinyNumber(name);
    const soulUrgeNumber = this.calculateSoulUrgeNumber(name);
    const personalityNumber = this.calculatePersonalityNumber(name);
    const birthDayNumber = this.calculateBirthDayNumber(birthDate);

    return {
      life_path_number: lifePathNumber,
      destiny_number: destinyNumber,
      soul_urge_number: soulUrgeNumber,
      personality_number: personalityNumber,
      birth_day_number: birthDayNumber,
      expression_number: destinyNumber, // Same as destiny number
      life_path_description: this.getLifePathDescription(lifePathNumber),
      destiny_description: this.getDestinyDescription(destinyNumber),
      soul_urge_description: this.getSoulUrgeDescription(soulUrgeNumber),
      personality_description:
        this.getPersonalityDescription(personalityNumber),
      lucky_numbers: this.generateLuckyNumbers(lifePathNumber),
      lucky_colors: this.getLuckyColors(lifePathNumber),
      strengths: this.getStrengths(lifePathNumber),
      challenges: this.getChallenges(lifePathNumber),
      career_guidance: this.getCareerGuidance(lifePathNumber, name),
      relationship_guidance: this.getRelationshipGuidance(lifePathNumber, name),
      spiritual_guidance: this.getSpiritualGuidance(lifePathNumber, name),
    };
  }

  // Manual calculation methods as fallbacks
  private static calculateLifePathNumber(birthDate: string): number {
    // Handle different date formats
    let month: number, day: number, year: number;
    if (birthDate.includes("/")) {
      [month, day, year] = birthDate.split("/").map(Number);
    } else if (birthDate.includes("-")) {
      [year, month, day] = birthDate.split("-").map(Number);
    } else {
      // Default fallback
      return 1;
    }

    let sum = month + day + year;

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculateDestinyNumber(name: string): number {
    const letterValues: { [key: string]: number } = {
      A: 1,
      B: 2,
      C: 3,
      D: 4,
      E: 5,
      F: 6,
      G: 7,
      H: 8,
      I: 9,
      J: 1,
      K: 2,
      L: 3,
      M: 4,
      N: 5,
      O: 6,
      P: 7,
      Q: 8,
      R: 9,
      S: 1,
      T: 2,
      U: 3,
      V: 4,
      W: 5,
      X: 6,
      Y: 7,
      Z: 8,
    };

    let sum = name
      .toUpperCase()
      .split("")
      .reduce((acc, letter) => {
        return acc + (letterValues[letter] || 0);
      }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculateSoulUrgeNumber(name: string): number {
    const vowelValues: { [key: string]: number } = {
      A: 1,
      E: 5,
      I: 9,
      O: 6,
      U: 3,
      Y: 7,
    };

    let sum = name
      .toUpperCase()
      .split("")
      .reduce((acc, letter) => {
        return acc + (vowelValues[letter] || 0);
      }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculatePersonalityNumber(name: string): number {
    const consonantValues: { [key: string]: number } = {
      B: 2,
      C: 3,
      D: 4,
      F: 6,
      G: 7,
      H: 8,
      J: 1,
      K: 2,
      L: 3,
      M: 4,
      N: 5,
      P: 7,
      Q: 8,
      R: 9,
      S: 1,
      T: 2,
      V: 4,
      W: 5,
      X: 6,
      Z: 8,
    };

    let sum = name
      .toUpperCase()
      .split("")
      .reduce((acc, letter) => {
        return acc + (consonantValues[letter] || 0);
      }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculateBirthDayNumber(birthDate: string): number {
    // Handle different date formats
    let day: number;
    if (birthDate.includes("/")) {
      [, day] = birthDate.split("/").map(Number);
    } else if (birthDate.includes("-")) {
      [, , day] = birthDate.split("-").map(Number);
    } else {
      return 1; // Default fallback
    }

    let sum = day;

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  // Description methods for each number type
  private static getLifePathDescription(number: number): string {
    const descriptions: { [key: number]: string } = {
      1: "You are a natural-born leader with pioneering spirit and strong independence. Your path involves creating new opportunities and inspiring others.",
      2: "You are a natural peacemaker and diplomat with exceptional sensitivity. Your path involves cooperation, partnership, and bringing harmony to situations.",
      3: "You are a creative communicator with natural artistic talents. Your path involves self-expression, creativity, and inspiring others through your gifts.",
      4: "You are a practical builder with strong organizational skills. Your path involves creating solid foundations and bringing stability to the world.",
      5: "You are a freedom-loving adventurer with natural versatility. Your path involves exploring new experiences and bringing positive change.",
      6: "You are a natural nurturer and healer with strong family values. Your path involves caring for others and creating harmony in relationships.",
      7: "You are a spiritual seeker and deep thinker with analytical mind. Your path involves inner wisdom and helping others find deeper truths.",
      8: "You are a natural business leader with strong material instincts. Your path involves achieving success and using power responsibly.",
      9: "You are a humanitarian with universal compassion. Your path involves serving humanity and completing important cycles in life.",
      11: "You are a master teacher and spiritual messenger. Your path involves inspiring others and bringing higher consciousness to the world.",
      22: "You are a master builder with the ability to manifest dreams into reality. Your path involves creating lasting positive change on a large scale.",
      33: "You are a master healer and teacher of love. Your path involves unconditional service and helping humanity evolve spiritually.",
    };

    return descriptions[number] || descriptions[1];
  }

  private static getDestinyDescription(number: number): string {
    const descriptions: { [key: number]: string } = {
      1: "Your destiny is to lead and pioneer new paths. You're meant to be independent, original, and courageously forge ahead where others fear to tread.",
      2: "Your destiny is to cooperate and bring people together. You're meant to be the diplomat, mediator, and gentle force that creates harmony.",
      3: "Your destiny is to communicate and create. You're meant to express yourself artistically and inspire others through your creative gifts.",
      4: "Your destiny is to build and organize. You're meant to create practical systems and structures that serve humanity for generations.",
      5: "Your destiny is to experience freedom and bring progressive change. You're meant to explore, adapt, and help others embrace positive transformation.",
      6: "Your destiny is to nurture and heal. You're meant to care for family, community, and help create loving, harmonious environments.",
      7: "Your destiny is to seek truth and develop wisdom. You're meant to study, research, and share deeper spiritual and intellectual insights.",
      8: "Your destiny is to achieve material success and use power wisely. You're meant to organize resources and create abundance responsibly.",
      9: "Your destiny is to serve humanity with compassion. You're meant to be generous, forgiving, and help complete important humanitarian missions.",
    };

    return descriptions[number] || descriptions[1];
  }

  private static getSoulUrgeDescription(number: number): string {
    const descriptions: { [key: number]: string } = {
      1: "Your soul craves independence and leadership. You deeply desire to be original, pioneering, and make your unique mark on the world.",
      2: "Your soul craves peace and partnership. You deeply desire cooperation, love, and harmonious relationships with others.",
      3: "Your soul craves creative expression. You deeply desire to communicate, create art, and bring joy and inspiration to others.",
      4: "Your soul craves order and stability. You deeply desire to build something lasting and provide security for yourself and others.",
      5: "Your soul craves freedom and adventure. You deeply desire variety, travel, and the excitement of new experiences.",
      6: "Your soul craves love and family. You deeply desire to nurture others and create a beautiful, harmonious home environment.",
      7: "Your soul craves knowledge and spiritual truth. You deeply desire to understand life's mysteries and develop inner wisdom.",
      8: "Your soul craves achievement and recognition. You deeply desire material success and the respect that comes with accomplishment.",
      9: "Your soul craves universal service. You deeply desire to help humanity and make the world a better place for all.",
    };

    return descriptions[number] || descriptions[1];
  }

  private static getPersonalityDescription(number: number): string {
    const descriptions: { [key: number]: string } = {
      1: "Others see you as confident, independent, and naturally authoritative. You project leadership qualities and original thinking.",
      2: "Others see you as gentle, cooperative, and naturally diplomatic. You project sensitivity and the ability to bring people together.",
      3: "Others see you as creative, expressive, and naturally entertaining. You project artistic flair and excellent communication skills.",
      4: "Others see you as reliable, practical, and naturally organized. You project stability and the ability to get things done.",
      5: "Others see you as dynamic, versatile, and naturally adventurous. You project energy and the ability to adapt to any situation.",
      6: "Others see you as caring, responsible, and naturally nurturing. You project warmth and the ability to heal and comfort others.",
      7: "Others see you as mysterious, intellectual, and naturally spiritual. You project depth and the ability to understand complex matters.",
      8: "Others see you as successful, powerful, and naturally business-minded. You project competence and the ability to manage resources.",
      9: "Others see you as compassionate, wise, and naturally generous. You project humanitarian ideals and universal understanding.",
    };

    return descriptions[number] || descriptions[1];
  }

  // Additional helper methods
  private static generateLuckyNumbers(lifePathNumber: number): number[] {
    const base = [lifePathNumber];
    const related = [
      (lifePathNumber * 2) % 10 || 10,
      (lifePathNumber * 3) % 10 || 10,
      (lifePathNumber + 7) % 10 || 10,
      (lifePathNumber + 14) % 100,
    ];
    return [...base, ...related].slice(0, 5);
  }

  private static getLuckyColors(lifePathNumber: number): string[] {
    const colorMap: { [key: number]: string[] } = {
      1: ["Red", "Orange", "Gold"],
      2: ["Blue", "Green", "Silver"],
      3: ["Yellow", "Pink", "Purple"],
      4: ["Green", "Brown", "Gray"],
      5: ["Blue", "Turquoise", "Silver"],
      6: ["Pink", "Blue", "White"],
      7: ["Purple", "Violet", "Indigo"],
      8: ["Black", "Navy", "Dark Green"],
      9: ["Gold", "Red", "Orange"],
    };
    return colorMap[lifePathNumber] || colorMap[1];
  }

  private static getStrengths(lifePathNumber: number): string[] {
    const strengthMap: { [key: number]: string[] } = {
      1: ["Leadership", "Independence", "Innovation", "Courage"],
      2: ["Cooperation", "Diplomacy", "Sensitivity", "Peacemaking"],
      3: ["Creativity", "Communication", "Optimism", "Inspiration"],
      4: ["Organization", "Reliability", "Practicality", "Determination"],
      5: ["Adaptability", "Freedom", "Versatility", "Progressive thinking"],
      6: ["Nurturing", "Responsibility", "Healing", "Compassion"],
      7: ["Analysis", "Spirituality", "Intuition", "Wisdom"],
      8: ["Business acumen", "Material success", "Organization", "Power"],
      9: ["Humanitarianism", "Compassion", "Generosity", "Universal love"],
    };
    return strengthMap[lifePathNumber] || strengthMap[1];
  }

  private static getChallenges(lifePathNumber: number): string[] {
    const challengeMap: { [key: number]: string[] } = {
      1: ["Impatience", "Selfishness", "Stubbornness", "Loneliness"],
      2: ["Oversensitivity", "Indecision", "Dependence", "Shyness"],
      3: [
        "Scattered energy",
        "Superficiality",
        "Criticism sensitivity",
        "Exaggeration",
      ],
      4: ["Rigidity", "Narrow-mindedness", "Overwork", "Stubbornness"],
      5: ["Restlessness", "Irresponsibility", "Impatience", "Inconsistency"],
      6: ["Perfectionism", "Worry", "Interference", "Self-righteousness"],
      7: ["Isolation", "Skepticism", "Coldness", "Perfectionism"],
      8: ["Materialism", "Workaholism", "Impatience", "Intolerance"],
      9: ["Emotional extremes", "Impracticality", "Moodiness", "Martyrdom"],
    };
    return challengeMap[lifePathNumber] || challengeMap[1];
  }

  private static getCareerGuidance(
    lifePathNumber: number,
    name: string
  ): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, your leadership abilities make you perfect for entrepreneurship, management, or pioneering new fields. Take charge of projects and don't be afraid to innovate.`,
      2: `${name}, your diplomatic nature suits careers in counseling, mediation, teamwork, or partnership roles. You excel when collaborating with others.`,
      3: `${name}, your creative communication skills are perfect for arts, writing, teaching, or entertainment. Express yourself and inspire others through your talents.`,
      4: `${name}, your organizational abilities suit careers in engineering, construction, accounting, or any field requiring systematic approaches and reliability.`,
      5: `${name}, your versatility and love of freedom suit careers in travel, sales, journalism, or any field that offers variety and new experiences.`,
      6: `${name}, your nurturing nature is perfect for healthcare, education, social work, or any career focused on helping and healing others.`,
      7: `${name}, your analytical mind suits research, spirituality, psychology, or any field requiring deep thinking and investigation.`,
      8: `${name}, your business acumen is perfect for finance, real estate, corporate leadership, or any field involving material success and organization.`,
      9: `${name}, your humanitarian spirit suits careers in charity work, counseling, arts, or any field that serves the greater good of humanity.`,
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }

  private static getRelationshipGuidance(
    lifePathNumber: number,
    name: string
  ): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, in relationships, remember to balance your independence with partnership. Your strong personality attracts others, but make room for their leadership too.`,
      2: `${name}, you naturally create harmony in relationships. Your sensitivity is a gift, but don't lose yourself trying to please everyone. Set healthy boundaries.`,
      3: `${name}, bring joy and creativity to your relationships. Your communication skills are wonderful, but remember to listen as much as you speak.`,
      4: `${name}, you build stable, lasting relationships through reliability and commitment. Remember to express emotions and not just focus on practical matters.`,
      5: `${name}, you need freedom in relationships. Choose partners who understand your need for variety and adventure, but commit when you find the right person.`,
      6: `${name}, you're naturally nurturing in relationships. Remember to receive care as well as give it, and don't try to fix everyone around you.`,
      7: `${name}, you need deep, meaningful connections. Take time to open up emotionally and don't let your analytical nature prevent intimate bonding.`,
      8: `${name}, balance your ambitious nature with quality time for relationships. Success means nothing without people to share it with.`,
      9: `${name}, your compassionate nature attracts many people. Remember to focus your love and not spread yourself too thin emotionally.`,
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }

  private static getSpiritualGuidance(
    lifePathNumber: number,
    name: string
  ): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, your spiritual path involves learning to lead with wisdom and using your pioneering spirit to help others find their own paths.`,
      2: `${name}, your spiritual path involves bringing peace and healing to the world through your natural ability to unite and harmonize.`,
      3: `${name}, your spiritual path involves using your creative gifts to inspire and uplift others, spreading joy and beauty in the world.`,
      4: `${name}, your spiritual path involves building solid foundations for spiritual growth and helping create practical systems that serve humanity.`,
      5: `${name}, your spiritual path involves experiencing spiritual freedom and helping others break free from limiting beliefs and patterns.`,
      6: `${name}, your spiritual path involves unconditional love and service, healing others through your compassionate heart and nurturing spirit.`,
      7: `${name}, your spiritual path involves seeking and sharing spiritual wisdom, helping others understand deeper truths about existence.`,
      8: `${name}, your spiritual path involves learning to use material success and power as tools for spiritual service and positive change.`,
      9: `${name}, your spiritual path involves humanitarian service and helping humanity evolve through love, compassion, and universal understanding.`,
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }


  // Status monitoring for rate limiting
  static getServiceStatus(): {
    rateLimitStatus: string;
    callsInLastMinute: number;
    maxCallsPerMinute: number;
    cacheSize: number;
    apiTokenConfigured: boolean;
  } {
    const now = Date.now();

    // Clean old calls for current status
    this.roxyCallTimes = this.roxyCallTimes.filter(
      (callTime) => now - callTime < this.ROXY_RATE_WINDOW
    );

    return {
      rateLimitStatus:
        this.roxyCallTimes.length >= this.ROXY_MAX_REQUESTS_PER_MINUTE
          ? "RATE_LIMITED"
          : "OK",
      callsInLastMinute: this.roxyCallTimes.length,
      maxCallsPerMinute: this.ROXY_MAX_REQUESTS_PER_MINUTE,
      cacheSize: this.responseCache.size,
      apiTokenConfigured: !!this.API_TOKEN,
    };
  }
}
