// Comprehensive Numerology Data Service with Fixed Calculations

export interface NumerologyData {
  lifePathNumbers: { [key: number]: LifePathInfo };
  personalityNumbers: { [key: number]: PersonalityInfo };
  destinyNumbers: { [key: number]: DestinyInfo };
  soulUrgeNumbers: { [key: number]: SoulUrgeInfo };
  birthdayNumbers: { [key: number]: BirthdayInfo };
  nameLetterValues: { [key: string]: number };
}

export interface LifePathInfo {
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careerPaths: string[];
  relationships: string;
  lifeApproach: string;
  hiddenDepth: string;
  loveCompatibility: string[];
  luckyNumbers: string[];
  luckyColors: string[];
}

export interface PersonalityInfo {
  title: string;
  description: string;
  traits: string[];
  impression: string;
  attraction: string;
}

export interface DestinyInfo {
  title: string;
  description: string;
  purpose: string;
  talents: string[];
  mission: string;
}

export interface SoulUrgeInfo {
  title: string;
  description: string;
  desires: string[];
  motivation: string;
  fulfillment: string;
}

export interface BirthdayInfo {
  title: string;
  description: string;
  gifts: string[];
  specialTalents: string;
}

export interface CalculationStep {
  step: string;
  value: number;
  explanation: string;
}

export interface NumerologyProfile {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
  personalYearNumber: number;
  lifePathInfo: LifePathInfo;
  destinyInfo: DestinyInfo;
  soulUrgeInfo: SoulUrgeInfo;
  personalityInfo: PersonalityInfo;
  birthdayInfo: BirthdayInfo;
  characterAnalysis: string;
  predictions: PredictionCategory[];
  calculations: {
    lifePath: CalculationStep[];
    destiny: CalculationStep[];
    soulUrge: CalculationStep[];
    personality: CalculationStep[];
    personalYear: CalculationStep[];
  };
}

export interface PredictionCategory {
  category: string;
  icon: string;
  timeframe: string;
  insights: string[];
  strength: "high" | "medium" | "low";
}

class NumerologyService {
  private numerologyData: NumerologyData;

  constructor() {
    this.numerologyData = this.initializeNumerologyData();
  }

  private initializeNumerologyData(): NumerologyData {
    return {
      nameLetterValues: {
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
      },
      lifePathNumbers: this.getLifePathData(),
      destinyNumbers: this.getDestinyData(),
      soulUrgeNumbers: this.getSoulUrgeData(),
      personalityNumbers: this.getPersonalityData(),
      birthdayNumbers: this.getBirthdayData(),
    };
  }

  // Calculate Life Path Number (proper numerology method)
  calculateLifePath(birthDate: string): {
    number: number;
    calculations: CalculationStep[];
  } {
    const calculations: CalculationStep[] = [];

    // Parse date components - handle MM/DD/YYYY format
    const dateParts = birthDate.split(/[\/\-]/);
    let month: number, day: number, year: number;

    if (dateParts.length === 3) {
      month = parseInt(dateParts[0]);
      day = parseInt(dateParts[1]);
      year = parseInt(dateParts[2]);
    } else {
      throw new Error("Invalid date format. Please use MM/DD/YYYY format.");
    }

    calculations.push({
      step: "Parse birth date",
      value: 0,
      explanation: `Month: ${month}, Day: ${day}, Year: ${year}`,
    });

    // Reduce each component to single digit first (except master numbers)
    const reduceToSingle = (num: number, label: string) => {
      let original = num;
      while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        const temp = num.toString();
        num = temp.split("").reduce((acc, digit) => acc + parseInt(digit), 0);
        calculations.push({
          step: `Reduce ${label}`,
          value: num,
          explanation: `${original} → ${temp.split("").join(" + ")} = ${num}`,
        });
        original = num;
      }
      return num;
    };

    const reducedMonth = reduceToSingle(month, "month");
    const reducedDay = reduceToSingle(day, "day");
    const reducedYear = reduceToSingle(year, "year");

    // Add the reduced components
    let sum = reducedMonth + reducedDay + reducedYear;

    calculations.push({
      step: "Add reduced components",
      value: sum,
      explanation: `${reducedMonth} + ${reducedDay} + ${reducedYear} = ${sum}`,
    });

    // Final reduction to single digit or master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString();
      const newSum = temp
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);

      calculations.push({
        step: "Final reduction",
        value: newSum,
        explanation: `${temp.split("").join(" + ")} = ${newSum}`,
      });

      sum = newSum;
    }

    return { number: sum, calculations };
  }

  // Calculate Destiny Number (from full name)
  calculateDestiny(fullName: string): {
    number: number;
    calculations: CalculationStep[];
  } {
    const calculations: CalculationStep[] = [];
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "");

    let sum = 0;
    let letterValues: string[] = [];

    for (const letter of cleanName) {
      const value = this.numerologyData.nameLetterValues[letter] || 0;
      sum += value;
      letterValues.push(`${letter}(${value})`);
    }

    calculations.push({
      step: "Calculate letter values",
      value: sum,
      explanation: `${letterValues.join(" + ")} = ${sum}`,
    });

    // Reduce to single digit or master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString();
      const newSum = temp
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);

      calculations.push({
        step: "Reduce to single digit",
        value: newSum,
        explanation: `${temp.split("").join(" + ")} = ${newSum}`,
      });

      sum = newSum;
    }

    return { number: sum, calculations };
  }

  // Calculate Soul Urge Number (from vowels in name)
  calculateSoulUrge(fullName: string): {
    number: number;
    calculations: CalculationStep[];
  } {
    const calculations: CalculationStep[] = [];
    const vowels = "AEIOU";
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "");

    let sum = 0;
    let vowelValues: string[] = [];

    for (const letter of cleanName) {
      if (vowels.includes(letter)) {
        const value = this.numerologyData.nameLetterValues[letter] || 0;
        sum += value;
        vowelValues.push(`${letter}(${value})`);
      }
    }

    calculations.push({
      step: "Calculate vowel values",
      value: sum,
      explanation: `${vowelValues.join(" + ")} = ${sum}`,
    });

    // Reduce to single digit or master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString();
      const newSum = temp
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);

      calculations.push({
        step: "Reduce to single digit",
        value: newSum,
        explanation: `${temp.split("").join(" + ")} = ${newSum}`,
      });

      sum = newSum;
    }

    return { number: sum, calculations };
  }

  // Calculate Personality Number (from consonants in name)
  calculatePersonality(fullName: string): {
    number: number;
    calculations: CalculationStep[];
  } {
    const calculations: CalculationStep[] = [];
    const vowels = "AEIOU";
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, "");

    let sum = 0;
    let consonantValues: string[] = [];

    for (const letter of cleanName) {
      if (!vowels.includes(letter)) {
        const value = this.numerologyData.nameLetterValues[letter] || 0;
        sum += value;
        consonantValues.push(`${letter}(${value})`);
      }
    }

    calculations.push({
      step: "Calculate consonant values",
      value: sum,
      explanation: `${consonantValues.join(" + ")} = ${sum}`,
    });

    // Reduce to single digit or master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString();
      const newSum = temp
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);

      calculations.push({
        step: "Reduce to single digit",
        value: newSum,
        explanation: `${temp.split("").join(" + ")} = ${newSum}`,
      });

      sum = newSum;
    }

    return { number: sum, calculations };
  }

  // Calculate Personal Year Number
  calculatePersonalYear(
    birthDate: string,
    currentYear?: number
  ): { number: number; calculations: CalculationStep[] } {
    const calculations: CalculationStep[] = [];
    const year = currentYear || new Date().getFullYear();

    // Get month and day from birth date
    const dateParts = birthDate.split(/[\/\-]/);
    const month = parseInt(dateParts[0]);
    const day = parseInt(dateParts[1]);

    let sum = month + day + year;

    calculations.push({
      step: "Add birth month, day, and current year",
      value: sum,
      explanation: `${month} + ${day} + ${year} = ${sum}`,
    });

    // Reduce to single digit
    while (sum > 9) {
      const temp = sum.toString();
      const newSum = temp
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);

      calculations.push({
        step: "Reduce to single digit",
        value: newSum,
        explanation: `${temp.split("").join(" + ")} = ${newSum}`,
      });

      sum = newSum;
    }

    return { number: sum, calculations };
  }

  // Generate complete numerology profile
  generateProfile(fullName: string, birthDate: string): NumerologyProfile {
    try {
      const lifePathResult = this.calculateLifePath(birthDate);
      const destinyResult = this.calculateDestiny(fullName);
      const soulUrgeResult = this.calculateSoulUrge(fullName);
      const personalityResult = this.calculatePersonality(fullName);
      const personalYearResult = this.calculatePersonalYear(birthDate);

      const birthdayNumber = parseInt(birthDate.split(/[\/\-]/)[1]);

      return {
        lifePathNumber: lifePathResult.number,
        destinyNumber: destinyResult.number,
        soulUrgeNumber: soulUrgeResult.number,
        personalityNumber: personalityResult.number,
        birthdayNumber: birthdayNumber,
        personalYearNumber: personalYearResult.number,
        lifePathInfo:
          this.numerologyData.lifePathNumbers[lifePathResult.number] ||
          this.getDefaultLifePathInfo(),
        destinyInfo:
          this.numerologyData.destinyNumbers[destinyResult.number] ||
          this.getDefaultDestinyInfo(),
        soulUrgeInfo:
          this.numerologyData.soulUrgeNumbers[soulUrgeResult.number] ||
          this.getDefaultSoulUrgeInfo(),
        personalityInfo:
          this.numerologyData.personalityNumbers[personalityResult.number] ||
          this.getDefaultPersonalityInfo(),
        birthdayInfo:
          this.numerologyData.birthdayNumbers[birthdayNumber] ||
          this.getDefaultBirthdayInfo(),
        characterAnalysis: this.generateCharacterAnalysis(
          lifePathResult.number,
          destinyResult.number,
          soulUrgeResult.number
        ),
        predictions: [], // Will be generated separately
        calculations: {
          lifePath: lifePathResult.calculations,
          destiny: destinyResult.calculations,
          soulUrge: soulUrgeResult.calculations,
          personality: personalityResult.calculations,
          personalYear: personalYearResult.calculations,
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate numerology profile: ${error}`);
    }
  }

  generateCharacterAnalysis(
    lifePath: number,
    destiny: number,
    soulUrge: number
  ): string {
    const lifePathInfo = this.getLifePathInfo(lifePath);
    const destinyInfo = this.getDestinyInfo(destiny);
    const soulUrgeInfo = this.getSoulUrgeInfo(soulUrge);

    return `Your Life Path ${lifePath} (${lifePathInfo.title}) reveals your natural journey through life, while your Destiny ${destiny} (${destinyInfo.title}) shows your ultimate purpose. Your Soul Urge ${soulUrge} (${soulUrgeInfo.title}) represents your heart's deepest desires. Together, these numbers create a unique cosmic blueprint that guides your spiritual evolution and personal growth.`;
  }



  // Data getter methods with actual numerology data
  private getLifePathData() {
    return {
      1: {
        title: "The Leader",
        description:
          "Natural born leaders with strong independence and pioneering spirit.",
        strengths: [
          "Leadership",
          "Independence",
          "Innovation",
          "Determination",
        ],
        challenges: ["Impatience", "Stubbornness", "Ego conflicts"],
        careerPaths: ["Entrepreneur", "CEO", "Manager", "Inventor"],
        relationships: "You need a partner who respects your independence.",
        lifeApproach: "Direct and action-oriented, you prefer to lead.",
        hiddenDepth:
          "Beneath your confidence lies a deep need for recognition.",
        loveCompatibility: ["2", "8", "9"],
        luckyNumbers: ["1", "10", "19", "28"],
        luckyColors: ["Red", "Orange", "Yellow"],
      },
      2: {
        title: "The Peacemaker",
        description:
          "Natural diplomats with exceptional ability to work with others.",
        strengths: ["Cooperation", "Diplomacy", "Sensitivity", "Teamwork"],
        challenges: ["Over-sensitivity", "Indecisiveness", "Dependency"],
        careerPaths: ["Counselor", "Mediator", "Teacher", "Social Worker"],
        relationships: "You thrive in partnerships and seek deep connections.",
        lifeApproach: "Gentle and collaborative, you prefer harmony.",
        hiddenDepth: "Your sensitivity is both strength and vulnerability.",
        loveCompatibility: ["1", "6", "8"],
        luckyNumbers: ["2", "11", "20", "29"],
        luckyColors: ["Blue", "Green", "Silver"],
      },
      3: {
        title: "The Creative Communicator",
        description:
          "Naturally creative and expressive with exceptional communication skills.",
        strengths: [
          "Creativity",
          "Communication",
          "Optimism",
          "Artistic talent",
        ],
        challenges: ["Scattered energy", "Superficiality", "Mood swings"],
        careerPaths: ["Artist", "Writer", "Performer", "Designer"],
        relationships: "You need partners who appreciate your creativity.",
        lifeApproach: "Expressive and optimistic, life is your canvas.",
        hiddenDepth: "Behind cheerfulness, you may struggle with self-doubt.",
        loveCompatibility: ["1", "5", "7"],
        luckyNumbers: ["3", "12", "21", "30"],
        luckyColors: ["Yellow", "Orange", "Pink"],
      },
      4: {
        title: "The Builder",
        description:
          "Practical, reliable, and hardworking with exceptional organizational skills.",
        strengths: ["Reliability", "Organization", "Hard work", "Practicality"],
        challenges: [
          "Rigidity",
          "Resistance to change",
          "Workaholic tendencies",
        ],
        careerPaths: ["Engineer", "Architect", "Accountant", "Manager"],
        relationships: "You seek stable, long-term partnerships.",
        lifeApproach: "Methodical and steady, you build to last.",
        hiddenDepth: "You fear chaos and find security in routine.",
        loveCompatibility: ["2", "6", "8"],
        luckyNumbers: ["4", "13", "22", "31"],
        luckyColors: ["Green", "Brown", "Gray"],
      },
      5: {
        title: "The Freedom Seeker",
        description:
          "Adventurous and versatile with insatiable curiosity about life.",
        strengths: ["Adaptability", "Curiosity", "Freedom", "Versatility"],
        challenges: ["Restlessness", "Inconsistency", "Commitment issues"],
        careerPaths: ["Travel Writer", "Sales", "Marketing", "Journalist"],
        relationships: "You need partners who share your love of adventure.",
        lifeApproach: "Dynamic and exploratory, life is an adventure.",
        hiddenDepth: "Your need for freedom stems from fear of being trapped.",
        loveCompatibility: ["1", "3", "7"],
        luckyNumbers: ["5", "14", "23", "32"],
        luckyColors: ["Blue", "Turquoise", "Silver"],
      },
      6: {
        title: "The Nurturer",
        description:
          "Naturally caring and responsible with desire to help others.",
        strengths: ["Nurturing", "Responsibility", "Compassion", "Healing"],
        challenges: ["Over-responsibility", "Martyrdom", "Perfectionism"],
        careerPaths: ["Healthcare", "Teaching", "Counseling", "Social Work"],
        relationships: "You're devoted to family and seek commitment.",
        lifeApproach: "Service-oriented, you find fulfillment helping others.",
        hiddenDepth: "You may sacrifice your needs for others.",
        loveCompatibility: ["2", "4", "9"],
        luckyNumbers: ["6", "15", "24", "33"],
        luckyColors: ["Pink", "Rose", "Lavender"],
      },
      7: {
        title: "The Seeker",
        description: "Deeply spiritual and analytical with quest for truth.",
        strengths: ["Intuition", "Analysis", "Spirituality", "Research"],
        challenges: ["Isolation", "Overthinking", "Skepticism"],
        careerPaths: [
          "Researcher",
          "Scientist",
          "Philosopher",
          "Spiritual Teacher",
        ],
        relationships: "You need intellectual and spiritual connection.",
        lifeApproach: "Contemplative, you seek deeper meaning.",
        hiddenDepth: "Your analytical nature masks spiritual longing.",
        loveCompatibility: ["3", "5", "9"],
        luckyNumbers: ["7", "16", "25", "34"],
        luckyColors: ["Purple", "Violet", "Indigo"],
      },
      8: {
        title: "The Achiever",
        description:
          "Naturally ambitious and business-minded with ability to manifest success.",
        strengths: [
          "Ambition",
          "Business acumen",
          "Leadership",
          "Material success",
        ],
        challenges: ["Materialism", "Workaholism", "Power struggles"],
        careerPaths: [
          "Business Executive",
          "Entrepreneur",
          "Finance",
          "Real Estate",
        ],
        relationships: "You're attracted to successful, ambitious partners.",
        lifeApproach: "Goal-oriented, you measure success tangibly.",
        hiddenDepth: "Your drive for success may mask insecurities.",
        loveCompatibility: ["1", "2", "4"],
        luckyNumbers: ["8", "17", "26", "35"],
        luckyColors: ["Black", "Navy", "Maroon"],
      },
      9: {
        title: "The Humanitarian",
        description:
          "Naturally compassionate and idealistic with desire to serve humanity.",
        strengths: ["Compassion", "Wisdom", "Generosity", "Idealism"],
        challenges: ["Impracticality", "Emotional extremes", "Disappointment"],
        careerPaths: [
          "Non-profit",
          "Teaching",
          "Healing Arts",
          "Social Justice",
        ],
        relationships: "You seek partners who share humanitarian values.",
        lifeApproach: "Idealistic, you want to make the world better.",
        hiddenDepth: "Universal love conflicts with personal needs.",
        loveCompatibility: ["1", "6", "7"],
        luckyNumbers: ["9", "18", "27", "36"],
        luckyColors: ["Gold", "Crimson", "Bronze"],
      },
      11: {
        title: "The Intuitive Illuminator",
        description:
          "Master number with heightened intuition and spiritual awareness.",
        strengths: [
          "Intuition",
          "Inspiration",
          "Spiritual awareness",
          "Vision",
        ],
        challenges: ["Nervous energy", "Impracticality", "Emotional intensity"],
        careerPaths: ["Spiritual Teacher", "Counselor", "Artist", "Healer"],
        relationships: "You need spiritually aware partners.",
        lifeApproach: "Intuitive and inspirational, you light the way.",
        hiddenDepth: "Spiritual gifts can feel overwhelming.",
        loveCompatibility: ["2", "6", "9"],
        luckyNumbers: ["11", "29", "38", "47"],
        luckyColors: ["White", "Silver", "Pearl"],
      },
      22: {
        title: "The Master Builder",
        description: "Master number with ability to turn dreams into reality.",
        strengths: [
          "Vision",
          "Practical application",
          "Leadership",
          "Building",
        ],
        challenges: ["Pressure", "Perfectionism", "Overwhelm"],
        careerPaths: [
          "Architect",
          "Large-scale Entrepreneur",
          "Political Leader",
        ],
        relationships: "You need partners who understand your big dreams.",
        lifeApproach: "Visionary yet practical, you build meaningfully.",
        hiddenDepth: "Pressure to achieve greatness can be overwhelming.",
        loveCompatibility: ["4", "6", "8"],
        luckyNumbers: ["22", "31", "40", "49"],
        luckyColors: ["Royal Blue", "Gold", "Platinum"],
      },
      33: {
        title: "The Master Teacher",
        description:
          "Master number representing highest level of spiritual teaching.",
        strengths: ["Healing", "Teaching", "Compassion", "Spiritual wisdom"],
        challenges: ["Emotional burden", "Sacrifice", "Overwhelm"],
        careerPaths: ["Spiritual Teacher", "Healer", "Humanitarian Leader"],
        relationships: "You attract people who need healing and guidance.",
        lifeApproach: "Devoted to service, you're a beacon of love.",
        hiddenDepth: "Your calling to serve can be emotionally demanding.",
        loveCompatibility: ["6", "9", "11"],
        luckyNumbers: ["33", "42", "51", "60"],
        luckyColors: ["Emerald", "Rose Gold", "Crystal"],
      },
    };
  }

  private getDestinyData() {
    return {
      1: {
        title: "Destined to Lead",
        description: "Your purpose is to develop leadership.",
        purpose: "To lead and inspire.",
        talents: ["Leadership", "Innovation"],
        mission: "Break new ground.",
      },
      2: {
        title: "Destined to Unite",
        description: "Your purpose is to bring harmony.",
        purpose: "To create peace.",
        talents: ["Diplomacy", "Cooperation"],
        mission: "Build bridges.",
      },
      3: {
        title: "Destined to Inspire",
        description: "Your purpose is to bring joy.",
        purpose: "To inspire through creativity.",
        talents: ["Creativity", "Communication"],
        mission: "Share your gifts.",
      },
      4: {
        title: "Destined to Build",
        description: "Your purpose is to create foundations.",
        purpose: "To build lasting systems.",
        talents: ["Organization", "Reliability"],
        mission: "Create stability.",
      },
      5: {
        title: "Destined to Explore",
        description: "Your purpose is to experience diversity.",
        purpose: "To explore and teach freedom.",
        talents: ["Adaptability", "Communication"],
        mission: "Show life's possibilities.",
      },
      6: {
        title: "Destined to Heal",
        description: "Your purpose is to nurture.",
        purpose: "To care and heal.",
        talents: ["Nurturing", "Healing"],
        mission: "Create harmony.",
      },
      7: {
        title: "Destined to Seek Truth",
        description: "Your purpose is to uncover wisdom.",
        purpose: "To seek and share truth.",
        talents: ["Analysis", "Intuition"],
        mission: "Share wisdom.",
      },
      8: {
        title: "Destined to Achieve",
        description: "Your purpose is to master material world.",
        purpose: "To create abundance.",
        talents: ["Business acumen", "Leadership"],
        mission: "Create opportunities.",
      },
      9: {
        title: "Destined to Serve",
        description: "Your purpose is to serve humanity.",
        purpose: "To serve the greater good.",
        talents: ["Compassion", "Wisdom"],
        mission: "Serve humanity.",
      },
      11: {
        title: "Destined to Illuminate",
        description: "Your purpose is to inspire spiritually.",
        purpose: "To inspire awakening.",
        talents: ["Intuition", "Inspiration"],
        mission: "Be a spiritual beacon.",
      },
      22: {
        title: "Destined to Master Build",
        description: "Your purpose is to manifest visions.",
        purpose: "To build lasting significance.",
        talents: ["Vision", "Manifestation"],
        mission: "Turn visions to reality.",
      },
      33: {
        title: "Destined to Master Teach",
        description: "Your purpose is to be a master teacher.",
        purpose: "To teach through love.",
        talents: ["Teaching", "Healing"],
        mission: "Example of love.",
      },
    };
  }

  private getSoulUrgeData() {
    return {
      1: {
        title: "Soul Urge for Leadership",
        description: "Your heart desires to lead.",
        desires: ["Recognition", "Leadership"],
        motivation: "To be first.",
        fulfillment: "Leading others.",
      },
      2: {
        title: "Soul Urge for Harmony",
        description: "Your heart desires peace.",
        desires: ["Peace", "Love"],
        motivation: "To create harmony.",
        fulfillment: "Creating peace.",
      },
      3: {
        title: "Soul Urge for Expression",
        description: "Your heart desires creativity.",
        desires: ["Expression", "Joy"],
        motivation: "To create beauty.",
        fulfillment: "Creative expression.",
      },
      4: {
        title: "Soul Urge for Security",
        description: "Your heart desires stability.",
        desires: ["Security", "Order"],
        motivation: "To build lasting things.",
        fulfillment: "Creating stability.",
      },
      5: {
        title: "Soul Urge for Freedom",
        description: "Your heart desires adventure.",
        desires: ["Freedom", "Adventure"],
        motivation: "To experience life fully.",
        fulfillment: "Exploring freely.",
      },
      6: {
        title: "Soul Urge for Service",
        description: "Your heart desires to care.",
        desires: ["Service", "Family"],
        motivation: "To nurture others.",
        fulfillment: "Helping others.",
      },
      7: {
        title: "Soul Urge for Understanding",
        description: "Your heart desires truth.",
        desires: ["Truth", "Wisdom"],
        motivation: "To understand mysteries.",
        fulfillment: "Gaining wisdom.",
      },
      8: {
        title: "Soul Urge for Success",
        description: "Your heart desires achievement.",
        desires: ["Success", "Recognition"],
        motivation: "To achieve greatness.",
        fulfillment: "Material success.",
      },
      9: {
        title: "Soul Urge for Service to Humanity",
        description: "Your heart desires to serve all.",
        desires: ["Service", "Compassion"],
        motivation: "To serve humanity.",
        fulfillment: "Helping the world.",
      },
      11: {
        title: "Soul Urge for Spiritual Inspiration",
        description: "Your heart desires to inspire.",
        desires: ["Inspiration", "Teaching"],
        motivation: "To inspire spiritually.",
        fulfillment: "Inspiring others.",
      },
      22: {
        title: "Soul Urge for Master Building",
        description: "Your heart desires grand visions.",
        desires: ["Vision", "Building"],
        motivation: "To manifest greatness.",
        fulfillment: "Building significance.",
      },
      33: {
        title: "Soul Urge for Master Teaching",
        description: "Your heart desires to teach love.",
        desires: ["Teaching", "Healing"],
        motivation: "To teach through love.",
        fulfillment: "Healing others.",
      },
    };
  }

  private getPersonalityData() {
    return {
      1: {
        title: "The Leader Personality",
        description: "You appear confident and capable.",
        traits: ["Confident", "Independent"],
        impression: "Natural leader.",
        attraction: "Confidence and initiative.",
      },
      2: {
        title: "The Cooperative Personality",
        description: "You appear gentle and diplomatic.",
        traits: ["Gentle", "Diplomatic"],
        impression: "Brings harmony.",
        attraction: "Calming presence.",
      },
      3: {
        title: "The Creative Personality",
        description: "You appear artistic and expressive.",
        traits: ["Creative", "Expressive"],
        impression: "Brings joy.",
        attraction: "Creativity and energy.",
      },
      4: {
        title: "The Reliable Personality",
        description: "You appear stable and dependable.",
        traits: ["Reliable", "Practical"],
        impression: "Can be counted on.",
        attraction: "Stability and trust.",
      },
      5: {
        title: "The Dynamic Personality",
        description: "You appear energetic and adventurous.",
        traits: ["Dynamic", "Adventurous"],
        impression: "Makes life interesting.",
        attraction: "Energy and adventure.",
      },
      6: {
        title: "The Caring Personality",
        description: "You appear nurturing and responsible.",
        traits: ["Nurturing", "Caring"],
        impression: "Cares about family.",
        attraction: "Warmth and caring.",
      },
      7: {
        title: "The Mysterious Personality",
        description: "You appear thoughtful and wise.",
        traits: ["Thoughtful", "Mysterious"],
        impression: "Has deep insights.",
        attraction: "Depth and mystery.",
      },
      8: {
        title: "The Successful Personality",
        description: "You appear ambitious and successful.",
        traits: ["Ambitious", "Successful"],
        impression: "Knows success.",
        attraction: "Success and authority.",
      },
      9: {
        title: "The Compassionate Personality",
        description: "You appear wise and generous.",
        traits: ["Wise", "Generous"],
        impression: "Cares about humanity.",
        attraction: "Wisdom and compassion.",
      },
      11: {
        title: "The Inspirational Personality",
        description: "You appear intuitive and inspiring.",
        traits: ["Intuitive", "Inspiring"],
        impression: "Has spiritual insights.",
        attraction: "Inspiration and awareness.",
      },
      22: {
        title: "The Master Builder Personality",
        description: "You appear visionary and capable.",
        traits: ["Visionary", "Capable"],
        impression: "Can manifest dreams.",
        attraction: "Vision and capability.",
      },
      33: {
        title: "The Master Teacher Personality",
        description: "You appear wise and loving.",
        traits: ["Wise", "Loving"],
        impression: "Natural teacher.",
        attraction: "Love and wisdom.",
      },
    };
  }

  private getBirthdayData() {
    return {
      1: {
        title: "Born Leader",
        description: "Natural leadership abilities.",
        gifts: ["Leadership", "Independence"],
        specialTalents: "Inspiring others to follow your vision.",
      },
      2: {
        title: "Born Peacemaker",
        description: "Natural diplomatic abilities.",
        gifts: ["Diplomacy", "Cooperation"],
        specialTalents: "Bringing people together.",
      },
      3: {
        title: "Born Communicator",
        description: "Natural creative abilities.",
        gifts: ["Creativity", "Communication"],
        specialTalents: "Expressing yourself creatively.",
      },
      4: {
        title: "Born Builder",
        description: "Natural organizational abilities.",
        gifts: ["Organization", "Building"],
        specialTalents: "Creating lasting structures.",
      },
      5: {
        title: "Born Explorer",
        description: "Natural adaptability.",
        gifts: ["Adaptability", "Freedom"],
        specialTalents: "Adapting to any situation.",
      },
      6: {
        title: "Born Nurturer",
        description: "Natural healing abilities.",
        gifts: ["Nurturing", "Healing"],
        specialTalents: "Healing and creating harmony.",
      },
      7: {
        title: "Born Seeker",
        description: "Natural analytical abilities.",
        gifts: ["Analysis", "Intuition"],
        specialTalents: "Seeing beyond the surface.",
      },
      8: {
        title: "Born Achiever",
        description: "Natural business abilities.",
        gifts: ["Business acumen", "Leadership"],
        specialTalents: "Creating material success.",
      },
      9: {
        title: "Born Humanitarian",
        description: "Natural compassion.",
        gifts: ["Compassion", "Service"],
        specialTalents: "Understanding human nature.",
      },
      11: {
        title: "Born Illuminator",
        description: "Natural intuitive abilities.",
        gifts: ["Intuition", "Inspiration"],
        specialTalents: "Inspiring others spiritually.",
      },
      22: {
        title: "Born Master Builder",
        description: "Natural visionary abilities.",
        gifts: ["Vision", "Manifestation"],
        specialTalents: "Turning visions into reality.",
      },
      33: {
        title: "Born Master Teacher",
        description: "Natural teaching abilities.",
        gifts: ["Teaching", "Healing"],
        specialTalents: "Teaching through example.",
      },
    };
  }

  // Default info methods
  private getDefaultLifePathInfo(): LifePathInfo {
    return {
      title: "Unique Path",
      description: "Your path is unique and special.",
      strengths: ["Individuality"],
      challenges: ["Finding your way"],
      careerPaths: ["Various paths available"],
      relationships: "Seek authentic connections.",
      lifeApproach: "Follow your intuition.",
      hiddenDepth: "Trust your inner wisdom.",
      loveCompatibility: ["All numbers"],
      luckyNumbers: ["Personal numbers"],
      luckyColors: ["Personal colors"],
    };
  }

  private getDefaultDestinyInfo(): DestinyInfo {
    return {
      title: "Unique Destiny",
      description: "Your destiny is unfolding perfectly.",
      purpose: "To fulfill your unique mission.",
      talents: ["Special gifts"],
      mission: "Follow your heart's calling.",
    };
  }

  private getDefaultSoulUrgeInfo(): SoulUrgeInfo {
    return {
      title: "Unique Desires",
      description: "Your soul seeks authentic expression.",
      desires: ["Authenticity", "Purpose"],
      motivation: "To be true to yourself.",
      fulfillment: "Living authentically brings joy.",
    };
  }

  private getDefaultPersonalityInfo(): PersonalityInfo {
    return {
      title: "Unique Personality",
      description: "You have a distinctive presence.",
      traits: ["Authentic", "Unique"],
      impression: "Others see your authenticity.",
      attraction: "People are drawn to your genuineness.",
    };
  }

  private getDefaultBirthdayInfo(): BirthdayInfo {
    return {
      title: "Special Day",
      description: "Your birthday holds special significance.",
      gifts: ["Unique talents"],
      specialTalents: "You have special gifts to share with the world.",
    };
  }

  // Public methods for external access
  getLifePathInfo(number: number): LifePathInfo {
    return (
      this.numerologyData.lifePathNumbers[number] ||
      this.getDefaultLifePathInfo()
    );
  }

  getDestinyInfo(number: number): DestinyInfo {
    return (
      this.numerologyData.destinyNumbers[number] || this.getDefaultDestinyInfo()
    );
  }

  getSoulUrgeInfo(number: number): SoulUrgeInfo {
    return (
      this.numerologyData.soulUrgeNumbers[number] ||
      this.getDefaultSoulUrgeInfo()
    );
  }

  getPersonalityInfo(number: number): PersonalityInfo {
    return (
      this.numerologyData.personalityNumbers[number] ||
      this.getDefaultPersonalityInfo()
    );
  }

  getBirthdayInfo(number: number): BirthdayInfo {
    return (
      this.numerologyData.birthdayNumbers[number] ||
      this.getDefaultBirthdayInfo()
    );
  }

  // Generate meaningful predictions based on numerology profile
  generatePredictions(profile: NumerologyProfile): any[] {
    const lifePathInfo = this.getLifePathInfo(profile.lifePathNumber);
    const destinyInfo = this.getDestinyInfo(profile.destinyNumber);
    const soulUrgeInfo = this.getSoulUrgeInfo(profile.soulUrgeNumber);
    
    return [
      {
        category: "Love & Relationships",
        icon: "heart",
        timeframe: "Next 3 months",
        predictions: [
          `Your Life Path ${profile.lifePathNumber} brings ${lifePathInfo.title.toLowerCase()} energy to your relationships.`,
          "Deep emotional connections are highlighted in your cosmic blueprint.",
          "Focus on authentic communication with your partner or future love.",
          "Your heart chakra is opening to receive and give unconditional love."
        ],
        strength: "high"
      },
      {
        category: "Career & Finance",
        icon: "briefcase",
        timeframe: "Next 6 months",
        predictions: [
          `Your Destiny Number ${profile.destinyNumber} (${destinyInfo.title}) reveals your true calling.`,
          "Professional opportunities aligned with your soul purpose are emerging.",
          "Financial abundance flows when you follow your authentic path.",
          "Trust your intuition in career decisions this season."
        ],
        strength: "medium"
      },
      {
        category: "Health & Wellness",
        icon: "fitness",
        timeframe: "Ongoing",
        predictions: [
          "Your body is your temple - honor it with mindful practices.",
          "Balance physical activity with spiritual wellness for optimal energy.",
          "Listen to your body's wisdom and trust its healing capabilities.",
          "Meditation and breathwork will enhance your vitality."
        ],
        strength: "medium"
      },
      {
        category: "Spiritual Growth",
        icon: "leaf",
        timeframe: "This year",
        predictions: [
          `Your Soul Urge ${profile.soulUrgeNumber} (${soulUrgeInfo.title}) guides your spiritual evolution.`,
          "A period of profound spiritual awakening is beginning.",
          "Trust your inner wisdom and embrace your psychic abilities.",
          "Ancient knowledge and mystical practices will call to you."
        ],
        strength: "high"
      }
    ];
  }
}

export default new NumerologyService();
