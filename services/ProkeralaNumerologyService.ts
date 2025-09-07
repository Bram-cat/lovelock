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

export interface ProkeralaResponse {
  status: number;
  message: string;
  data: {
    numerology: NumerologyReading;
  };
}

export class ProkeralaNumerologyService {
  private static readonly CLIENT_ID = process.env.PROKERALA_CLIENT_ID || '46e136d4-4850-462d-93cb-28cef2ba7f43';
  private static readonly CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET || '0DMFYW8QNXC9MpKDTHTLybcoDMXiHLiPd6tNs0UP';
  private static readonly BASE_URL = 'https://api.prokerala.com/v2/numerology';
  
  // Token caching to avoid generating new tokens for every request
  private static cachedToken: string | null = null;
  private static tokenExpiryTime: number = 0;
  
  // Rate limiting for Prokerala API - 25 requests per minute
  private static prokeralaCallTimes: number[] = [];
  private static readonly PROKERALA_MAX_REQUESTS_PER_MINUTE = 25;
  private static readonly PROKERALA_RATE_WINDOW = 60000; // 1 minute window
  private static readonly PROKERALA_MIN_DELAY = 2400; // ~2.4s minimum delay (25 calls per minute)
  private static requestQueue: Array<{ resolve: Function; reject: Function; params: any }> = [];
  private static isProcessingQueue = false;
  
  // Response caching for Prokerala
  private static responseCache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 600000; // 10 minutes for numerology readings
  
  // Enhanced rate limiting for Prokerala API
  private static async waitForProkeralaRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Clean old calls outside the rate window
    this.prokeralaCallTimes = this.prokeralaCallTimes.filter(
      callTime => (now - callTime) < this.PROKERALA_RATE_WINDOW
    );
    
    // If we've made 25 calls in the last minute, wait
    if (this.prokeralaCallTimes.length >= this.PROKERALA_MAX_REQUESTS_PER_MINUTE) {
      const oldestCall = Math.min(...this.prokeralaCallTimes);
      const waitTime = this.PROKERALA_RATE_WINDOW - (now - oldestCall) + 100; // +100ms buffer
      
      if (waitTime > 0) {
        console.log(`🚦 Prokerala rate limit: Waiting ${Math.round(waitTime/1000)}s (${this.prokeralaCallTimes.length}/25 calls in window)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Record this call
    this.prokeralaCallTimes.push(now);
  }
  
  // Check cache for existing response
  private static getCachedProkeralaResponse(cacheKey: string): any | null {
    const cached = this.responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('💾 Using cached Prokerala response');
      return cached.data;
    }
    
    return null;
  }
  
  // Store response in cache
  private static setCachedProkeralaResponse(cacheKey: string, data: any): void {
    this.responseCache.set(cacheKey, {
      data,
      timestamp: Date.now()
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
  private static generateProkeralaCacheKey(name: string, birthDate: string): string {
    return `prokerala_${name.toLowerCase().replace(/\s+/g, '_')}_${birthDate}`;
  }
  
  // Get access token for API calls using proper client credentials with caching
  private static async getAccessToken(): Promise<string | null> {
    try {
      // Check if we have a valid cached token
      const now = Date.now();
      if (this.cachedToken && now < this.tokenExpiryTime) {
        console.log('Using cached Prokerala access token');
        return this.cachedToken;
      }

      console.log('Requesting new Prokerala access token');
      const response = await fetch('https://api.prokerala.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}`,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token request error:', response.status, errorText);
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.access_token) {
        // Cache the token with expiry time (subtract 60 seconds for safety)
        this.cachedToken = data.access_token;
        this.tokenExpiryTime = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
        console.log('New Prokerala access token cached, expires in:', data.expires_in || 3600, 'seconds');
        return data.access_token;
      } else {
        console.error('No access token in response:', data);
        return null;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get comprehensive numerology reading with rate limiting
  static async getNumerologyReading(
    name: string, 
    birthDate: string, 
    birthTime?: string, 
    birthLocation?: string
  ): Promise<NumerologyReading | null> {
    const cacheKey = this.generateProkeralaCacheKey(name, birthDate);
    
    // Check cache first
    const cachedResponse = this.getCachedProkeralaResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try API first, fallback to local calculation if needed
    console.log('Attempting to fetch from Prokerala API for enhanced accuracy');
    
    try {
      // Wait for rate limit before making any API calls
      await this.waitForProkeralaRateLimit();
      
      const token = await this.getAccessToken();
      if (!token) {
        console.log('No API token, using local calculation');
        const fallback = this.getFallbackNumerology(name, birthDate);
        this.setCachedProkeralaResponse(cacheKey, fallback);
        return fallback;
      }

      // Parse birth date (MM/DD/YYYY)
      const [month, day, year] = birthDate.split('/').map(Number);
      
      // Try multiple API endpoints for comprehensive data
      const apiResults = await Promise.allSettled([
        this.fetchNumerologyNumbers(token, name, year, month, day, birthTime, birthLocation),
        this.getLifePathNumber(birthDate),
        this.getDestinyNumber(name)
      ]);

      // Check if we got valid API data
      const numerologyData = apiResults[0].status === 'fulfilled' ? apiResults[0].value : null;
      const lifePathFromAPI = apiResults[1].status === 'fulfilled' ? apiResults[1].value : null;
      const destinyFromAPI = apiResults[2].status === 'fulfilled' ? apiResults[2].value : null;

      if (numerologyData || lifePathFromAPI || destinyFromAPI) {
        console.log('Successfully fetched data from Prokerala API');
        // Merge API data with our enhanced local calculations
        const fallbackData = this.getFallbackNumerology(name, birthDate);
        
        const enhancedData = {
          ...fallbackData,
          // Use API data when available, fallback to local calculation otherwise
          life_path_number: lifePathFromAPI || fallbackData.life_path_number,
          destiny_number: destinyFromAPI || fallbackData.destiny_number,
          // Enhance with API-specific insights if available
          life_path_description: numerologyData?.life_path_description || fallbackData.life_path_description,
          destiny_description: numerologyData?.destiny_description || fallbackData.destiny_description,
          // Add API-enhanced predictions and insights
          career_guidance: this.enhanceCareerGuidance(fallbackData.career_guidance, numerologyData),
          relationship_guidance: this.enhanceRelationshipGuidance(fallbackData.relationship_guidance, numerologyData),
          spiritual_guidance: this.enhanceSpiritualGuidance(fallbackData.spiritual_guidance, numerologyData),
        };
        
        // Cache the enhanced data
        this.setCachedProkeralaResponse(cacheKey, enhancedData);
        return enhancedData;
      }

      console.log('API data not available, using enhanced local calculation');
      const fallbackData = this.getFallbackNumerology(name, birthDate);
      
      // Cache the fallback data
      this.setCachedProkeralaResponse(cacheKey, fallbackData);
      return fallbackData;

    } catch (error) {
      console.error('Error fetching from Prokerala API:', error);
      
      // Handle rate limiting specifically
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        console.log('🔄 Prokerala rate limited - using cached or fallback data');
      }
      
      console.log('Falling back to local numerology calculation');
      const fallbackData = this.getFallbackNumerology(name, birthDate);
      
      // Cache the fallback data
      this.setCachedProkeralaResponse(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  // New method to fetch numerology numbers from API
  private static async fetchNumerologyNumbers(
    token: string, 
    name: string, 
    year: number, 
    month: number, 
    day: number,
    birthTime?: string,
    birthLocation?: string
  ): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/numerology-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        birth_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        birth_time: birthTime ? `${birthTime}:00` : '12:00:00',
        birth_location: birthLocation || 'New York, USA',
        coordinates: this.getCoordinatesForLocation(birthLocation) || {
          latitude: 40.7128,
          longitude: -74.0060
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.status === 200 ? data.data : null;
    }
    
    throw new Error(`API request failed: ${response.status}`);
  }

  // Get life path number calculation
  static async getLifePathNumber(birthDate: string): Promise<number> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return this.calculateLifePathNumber(birthDate);
      }

      const [month, day, year] = birthDate.split('/').map(Number);
      
      const response = await fetch(`${this.BASE_URL}/life-path-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.life_path_number || this.calculateLifePathNumber(birthDate);
      }

      return this.calculateLifePathNumber(birthDate);
    } catch (error) {
      console.error('Error fetching life path number:', error);
      return this.calculateLifePathNumber(birthDate);
    }
  }

  // Get destiny number from name
  static async getDestinyNumber(name: string): Promise<number> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return this.calculateDestinyNumber(name);
      }

      const response = await fetch(`${this.BASE_URL}/destiny-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.destiny_number || this.calculateDestinyNumber(name);
      }

      return this.calculateDestinyNumber(name);
    } catch (error) {
      console.error('Error fetching destiny number:', error);
      return this.calculateDestinyNumber(name);
    }
  }

  // Enhance API data with additional insights
  private static enhanceNumerologyData(data: NumerologyReading, name: string): NumerologyReading {
    return {
      ...data,
      lucky_numbers: data.lucky_numbers || this.generateLuckyNumbers(data.life_path_number),
      lucky_colors: data.lucky_colors || this.getLuckyColors(data.life_path_number),
      strengths: data.strengths || this.getStrengths(data.life_path_number),
      challenges: data.challenges || this.getChallenges(data.life_path_number),
      career_guidance: data.career_guidance || this.getCareerGuidance(data.life_path_number, name),
      relationship_guidance: data.relationship_guidance || this.getRelationshipGuidance(data.life_path_number, name),
      spiritual_guidance: data.spiritual_guidance || this.getSpiritualGuidance(data.life_path_number, name),
    };
  }

  // Fallback numerology calculation when API fails
  private static getFallbackNumerology(name: string, birthDate: string): NumerologyReading {
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
      personality_description: this.getPersonalityDescription(personalityNumber),
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
    const [month, day, year] = birthDate.split('/').map(Number);
    let sum = month + day + year;
    
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
  }

  private static calculateDestinyNumber(name: string): number {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
      'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    };

    let sum = name.toUpperCase().split('').reduce((acc, letter) => {
      return acc + (letterValues[letter] || 0);
    }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculateSoulUrgeNumber(name: string): number {
    const vowelValues: { [key: string]: number } = {
      'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3, 'Y': 7
    };

    let sum = name.toUpperCase().split('').reduce((acc, letter) => {
      return acc + (vowelValues[letter] || 0);
    }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculatePersonalityNumber(name: string): number {
    const consonantValues: { [key: string]: number } = {
      'B': 2, 'C': 3, 'D': 4, 'F': 6, 'G': 7, 'H': 8, 'J': 1, 'K': 2, 'L': 3,
      'M': 4, 'N': 5, 'P': 7, 'Q': 8, 'R': 9, 'S': 1, 'T': 2, 'V': 4, 'W': 5,
      'X': 6, 'Z': 8
    };

    let sum = name.toUpperCase().split('').reduce((acc, letter) => {
      return acc + (consonantValues[letter] || 0);
    }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  }

  private static calculateBirthDayNumber(birthDate: string): number {
    const [, day] = birthDate.split('/').map(Number);
    let sum = day;

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
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
      33: "You are a master healer and teacher of love. Your path involves unconditional service and helping humanity evolve spiritually."
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
      9: "Your destiny is to serve humanity with compassion. You're meant to be generous, forgiving, and help complete important humanitarian missions."
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
      9: "Your soul craves universal service. You deeply desire to help humanity and make the world a better place for all."
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
      9: "Others see you as compassionate, wise, and naturally generous. You project humanitarian ideals and universal understanding."
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
      9: ["Gold", "Red", "Orange"]
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
      9: ["Humanitarianism", "Compassion", "Generosity", "Universal love"]
    };
    return strengthMap[lifePathNumber] || strengthMap[1];
  }

  private static getChallenges(lifePathNumber: number): string[] {
    const challengeMap: { [key: number]: string[] } = {
      1: ["Impatience", "Selfishness", "Stubbornness", "Loneliness"],
      2: ["Oversensitivity", "Indecision", "Dependence", "Shyness"],
      3: ["Scattered energy", "Superficiality", "Criticism sensitivity", "Exaggeration"],
      4: ["Rigidity", "Narrow-mindedness", "Overwork", "Stubbornness"],
      5: ["Restlessness", "Irresponsibility", "Impatience", "Inconsistency"],
      6: ["Perfectionism", "Worry", "Interference", "Self-righteousness"],
      7: ["Isolation", "Skepticism", "Coldness", "Perfectionism"],
      8: ["Materialism", "Workaholism", "Impatience", "Intolerance"],
      9: ["Emotional extremes", "Impracticality", "Moodiness", "Martyrdom"]
    };
    return challengeMap[lifePathNumber] || challengeMap[1];
  }

  private static getCareerGuidance(lifePathNumber: number, name: string): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, your leadership abilities make you perfect for entrepreneurship, management, or pioneering new fields. Take charge of projects and don't be afraid to innovate.`,
      2: `${name}, your diplomatic nature suits careers in counseling, mediation, teamwork, or partnership roles. You excel when collaborating with others.`,
      3: `${name}, your creative communication skills are perfect for arts, writing, teaching, or entertainment. Express yourself and inspire others through your talents.`,
      4: `${name}, your organizational abilities suit careers in engineering, construction, accounting, or any field requiring systematic approaches and reliability.`,
      5: `${name}, your versatility and love of freedom suit careers in travel, sales, journalism, or any field that offers variety and new experiences.`,
      6: `${name}, your nurturing nature is perfect for healthcare, education, social work, or any career focused on helping and healing others.`,
      7: `${name}, your analytical mind suits research, spirituality, psychology, or any field requiring deep thinking and investigation.`,
      8: `${name}, your business acumen is perfect for finance, real estate, corporate leadership, or any field involving material success and organization.`,
      9: `${name}, your humanitarian spirit suits careers in charity work, counseling, arts, or any field that serves the greater good of humanity.`
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }

  private static getRelationshipGuidance(lifePathNumber: number, name: string): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, in relationships, remember to balance your independence with partnership. Your strong personality attracts others, but make room for their leadership too.`,
      2: `${name}, you naturally create harmony in relationships. Your sensitivity is a gift, but don't lose yourself trying to please everyone. Set healthy boundaries.`,
      3: `${name}, bring joy and creativity to your relationships. Your communication skills are wonderful, but remember to listen as much as you speak.`,
      4: `${name}, you build stable, lasting relationships through reliability and commitment. Remember to express emotions and not just focus on practical matters.`,
      5: `${name}, you need freedom in relationships. Choose partners who understand your need for variety and adventure, but commit when you find the right person.`,
      6: `${name}, you're naturally nurturing in relationships. Remember to receive care as well as give it, and don't try to fix everyone around you.`,
      7: `${name}, you need deep, meaningful connections. Take time to open up emotionally and don't let your analytical nature prevent intimate bonding.`,
      8: `${name}, balance your ambitious nature with quality time for relationships. Success means nothing without people to share it with.`,
      9: `${name}, your compassionate nature attracts many people. Remember to focus your love and not spread yourself too thin emotionally.`
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }

  private static getSpiritualGuidance(lifePathNumber: number, name: string): string {
    const guidanceMap: { [key: number]: string } = {
      1: `${name}, your spiritual path involves learning to lead with wisdom and using your pioneering spirit to help others find their own paths.`,
      2: `${name}, your spiritual path involves bringing peace and healing to the world through your natural ability to unite and harmonize.`,
      3: `${name}, your spiritual path involves using your creative gifts to inspire and uplift others, spreading joy and beauty in the world.`,
      4: `${name}, your spiritual path involves building solid foundations for spiritual growth and helping create practical systems that serve humanity.`,
      5: `${name}, your spiritual path involves experiencing spiritual freedom and helping others break free from limiting beliefs and patterns.`,
      6: `${name}, your spiritual path involves unconditional love and service, healing others through your compassionate heart and nurturing spirit.`,
      7: `${name}, your spiritual path involves seeking and sharing spiritual wisdom, helping others understand deeper truths about existence.`,
      8: `${name}, your spiritual path involves learning to use material success and power as tools for spiritual service and positive change.`,
      9: `${name}, your spiritual path involves humanitarian service and helping humanity evolve through love, compassion, and universal understanding.`
    };
    return guidanceMap[lifePathNumber] || guidanceMap[1];
  }

  // Enhancement methods to combine API data with local insights
  private static enhanceCareerGuidance(localGuidance: string, apiData?: any): string {
    if (!apiData?.career_suggestions) {
      return localGuidance;
    }
    
    return `${localGuidance}\n\nAdditional insights: ${apiData.career_suggestions.join(', ')} would be particularly beneficial for your numerological profile.`;
  }

  private static enhanceRelationshipGuidance(localGuidance: string, apiData?: any): string {
    if (!apiData?.compatibility_insights) {
      return localGuidance;
    }
    
    return `${localGuidance}\n\nAPI Enhancement: ${apiData.compatibility_insights}`;
  }

  private static enhanceSpiritualGuidance(localGuidance: string, apiData?: any): string {
    if (!apiData?.spiritual_insights) {
      return localGuidance;
    }
    
    return `${localGuidance}\n\nSpiritual Enhancement: ${apiData.spiritual_insights}`;
  }

  // Get daily predictions with API enhancement
  static async getDailyPredictions(
    name: string, 
    birthDate: string, 
    date?: Date, 
    birthTime?: string, 
    birthLocation?: string
  ): Promise<{
    love: string;
    career: string;
    health: string;
    spiritual: string;
    luckyNumbers: number[];
    luckyColors: string[];
    energyLevel: number;
  }> {
    const targetDate = date || new Date();
    const numerologyReading = await this.getNumerologyReading(name, birthDate, birthTime, birthLocation);
    
    if (!numerologyReading) {
      throw new Error('Unable to generate numerology reading');
    }

    try {
      // Try to get daily predictions from API
      const token = await this.getAccessToken();
      if (token) {
        const dailyData = await this.fetchDailyPredictions(token, name, birthDate, targetDate);
        if (dailyData) {
          return dailyData;
        }
      }
    } catch (error) {
      console.log('API daily predictions not available, using enhanced local predictions');
    }

    // Fallback to enhanced local predictions
    return this.generateEnhancedDailyPredictions(numerologyReading, targetDate);
  }

  // Helper method to get coordinates for common locations
  private static getCoordinatesForLocation(location?: string): { latitude: number; longitude: number } | null {
    if (!location) return null;
    
    const locationMap: { [key: string]: { latitude: number; longitude: number } } = {
      'new york': { latitude: 40.7128, longitude: -74.0060 },
      'new york, usa': { latitude: 40.7128, longitude: -74.0060 },
      'london': { latitude: 51.5074, longitude: -0.1278 },
      'london, uk': { latitude: 51.5074, longitude: -0.1278 },
      'paris': { latitude: 48.8566, longitude: 2.3522 },
      'paris, france': { latitude: 48.8566, longitude: 2.3522 },
      'tokyo': { latitude: 35.6762, longitude: 139.6503 },
      'tokyo, japan': { latitude: 35.6762, longitude: 139.6503 },
      'sydney': { latitude: -33.8688, longitude: 151.2093 },
      'sydney, australia': { latitude: -33.8688, longitude: 151.2093 },
      'mumbai': { latitude: 19.0760, longitude: 72.8777 },
      'mumbai, india': { latitude: 19.0760, longitude: 72.8777 },
      'delhi': { latitude: 28.7041, longitude: 77.1025 },
      'delhi, india': { latitude: 28.7041, longitude: 77.1025 },
      'los angeles': { latitude: 34.0522, longitude: -118.2437 },
      'los angeles, usa': { latitude: 34.0522, longitude: -118.2437 },
      'chicago': { latitude: 41.8781, longitude: -87.6298 },
      'chicago, usa': { latitude: 41.8781, longitude: -87.6298 },
      'toronto': { latitude: 43.6532, longitude: -79.3832 },
      'toronto, canada': { latitude: 43.6532, longitude: -79.3832 },
    };
    
    const normalizedLocation = location.toLowerCase().trim();
    return locationMap[normalizedLocation] || null;
  }

  private static async fetchDailyPredictions(token: string, name: string, birthDate: string, date: Date): Promise<any> {
    const [month, day, year] = birthDate.split('/').map(Number);
    
    const response = await fetch(`${this.BASE_URL}/daily-prediction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        birth_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        prediction_date: date.toISOString().split('T')[0],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 200 && data.data) {
        return {
          love: data.data.love_prediction || 'Love energy is flowing favorably today.',
          career: data.data.career_prediction || 'Professional opportunities are aligned.',
          health: data.data.health_prediction || 'Your vitality is strong today.',
          spiritual: data.data.spiritual_prediction || 'Spiritual growth is highlighted.',
          luckyNumbers: data.data.lucky_numbers || [1, 7, 21],
          luckyColors: data.data.lucky_colors || ['Blue', 'Gold'],
          energyLevel: data.data.energy_level || 75
        };
      }
    }

    throw new Error('API daily predictions failed');
  }

  private static generateEnhancedDailyPredictions(reading: NumerologyReading, date: Date): any {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const personalDayNumber = (reading.life_path_number + dayOfYear) % 9 + 1;
    
    const predictions = {
      1: {
        love: 'New romantic opportunities or fresh energy in existing relationships. Your confidence attracts others.',
        career: 'Leadership opportunities emerge. Take initiative on important projects.',
        health: 'High energy levels. Perfect day for starting new fitness routines.',
        spiritual: 'Focus on self-discovery and personal growth. Meditate on your goals.'
      },
      2: {
        love: 'Harmony and cooperation dominate your relationships. Deep emotional connections.',
        career: 'Teamwork and partnerships bring success. Collaborate rather than compete.',
        health: 'Balance is key. Gentle exercises like yoga or walking are beneficial.',
        spiritual: 'Focus on compassion and helping others. Your intuition is heightened.'
      },
      3: {
        love: 'Playful, joyful energy in love. Express your feelings creatively.',
        career: 'Your communication skills shine. Present ideas or network actively.',
        health: 'Creative activities boost your wellbeing. Dance or art therapy helps.',
        spiritual: 'Express gratitude and share your joy with others. Laughter heals.'
      },
      4: {
        love: 'Stability and commitment are highlighted. Build lasting foundations.',
        career: 'Hard work and persistence pay off. Focus on practical, achievable goals.',
        health: 'Structured routines benefit you. Maintain consistent healthy habits.',
        spiritual: 'Ground yourself in nature. Practice patience and perseverance.'
      },
      5: {
        love: 'Adventure and excitement in romance. Try something new with your partner.',
        career: 'Change and variety are favored. Embrace new opportunities or methods.',
        health: 'Dynamic activities energize you. Mix up your routine for best results.',
        spiritual: 'Embrace freedom and explore new spiritual practices or philosophies.'
      },
      6: {
        love: 'Family and nurturing take priority. Deep, caring connections flourish.',
        career: 'Service-oriented work brings fulfillment. Help others achieve their goals.',
        health: 'Caring for others nourishes your soul. Maintain emotional balance.',
        spiritual: 'Practice unconditional love and compassion. Heal old wounds.'
      },
      7: {
        love: 'Deep, spiritual connections are possible. Look beyond surface attractions.',
        career: 'Research and analysis lead to breakthrough insights. Trust your intuition.',
        health: 'Quiet reflection and meditation restore your energy. Avoid crowds.',
        spiritual: 'Seek inner wisdom through meditation. Mystical experiences are possible.'
      },
      8: {
        love: 'Practical approach to relationships. Shared goals strengthen bonds.',
        career: 'Business success and financial opportunities abound. Think big.',
        health: 'Ambitious health goals can be achieved. Invest in your wellbeing.',
        spiritual: 'Balance material and spiritual pursuits. Success includes service.'
      },
      9: {
        love: 'Universal love and compassion guide your relationships. Forgiveness heals.',
        career: 'Complete important projects. Your wisdom and experience are valued.',
        health: 'Holistic approaches to health work well. Consider mind-body connections.',
        spiritual: 'Share your wisdom with others. Focus on humanitarian causes.'
      }
    };

    const dayPrediction = predictions[personalDayNumber] || predictions[1];
    
    return {
      love: dayPrediction.love,
      career: dayPrediction.career,
      health: dayPrediction.health,
      spiritual: dayPrediction.spiritual,
      luckyNumbers: reading.lucky_numbers.slice(0, 3),
      luckyColors: reading.lucky_colors.slice(0, 2),
      energyLevel: 60 + (personalDayNumber * 5) + Math.floor(Math.random() * 20)
    };
  }
  
  // Status monitoring for rate limiting
  static getServiceStatus(): {
    rateLimitStatus: string;
    callsInLastMinute: number;
    maxCallsPerMinute: number;
    cacheSize: number;
    tokenCached: boolean;
    tokenExpiry: string | null;
  } {
    const now = Date.now();
    
    // Clean old calls for current status
    this.prokeralaCallTimes = this.prokeralaCallTimes.filter(
      callTime => (now - callTime) < this.PROKERALA_RATE_WINDOW
    );
    
    return {
      rateLimitStatus: this.prokeralaCallTimes.length >= this.PROKERALA_MAX_REQUESTS_PER_MINUTE ? 'RATE_LIMITED' : 'OK',
      callsInLastMinute: this.prokeralaCallTimes.length,
      maxCallsPerMinute: this.PROKERALA_MAX_REQUESTS_PER_MINUTE,
      cacheSize: this.responseCache.size,
      tokenCached: !!this.cachedToken,
      tokenExpiry: this.tokenExpiryTime > 0 ? new Date(this.tokenExpiryTime).toISOString() : null
    };
  }
}