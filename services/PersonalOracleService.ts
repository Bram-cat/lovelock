// Personal Oracle Service - Advanced Daily Predictions & Life Insights
export interface DailyOracle {
  id: string;
  date: string;
  timeGenerated: string;
  validUntil: string;
  mainPrediction: string;
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
  energyLevel: number; // 1-100
  confidenceScore: number; // 80-99
  aspects: {
    love: OracleAspect;
    money: OracleAspect;
    career: OracleAspect;
    health: OracleAspect;
    spiritual: OracleAspect;
  };
  warnings: string[];
  opportunities: string[];
  personalGuidance: string;
  cosmicInfluence: string;
}

export interface OracleAspect {
  category: string;
  prediction: string;
  advice: string;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  timeframe: string;
  actionItems: string[];
}

export class PersonalOracleService {
  
  // Generate comprehensive daily oracle reading
  static generateDailyOracle(birthDate?: Date, name?: string): DailyOracle {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);

    return {
      id: `oracle_${now.getTime()}`,
      date: now.toDateString(),
      timeGenerated: now.toLocaleTimeString(),
      validUntil: tomorrow.toLocaleTimeString(),
      mainPrediction: this.generateMainPrediction(),
      luckyNumber: Math.floor(Math.random() * 99) + 1,
      luckyColor: this.getLuckyColor(),
      luckyTime: this.getLuckyTime(),
      energyLevel: Math.floor(Math.random() * 20) + 80, // 80-99
      confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-99
      aspects: {
        love: this.generateLoveAspect(),
        money: this.generateMoneyAspect(),
        career: this.generateCareerAspect(),
        health: this.generateHealthAspect(),
        spiritual: this.generateSpiritualAspect()
      },
      warnings: this.generateWarnings(),
      opportunities: this.generateOpportunities(),
      personalGuidance: this.generatePersonalGuidance(name),
      cosmicInfluence: this.generateCosmicInfluence()
    };
  }

  // Main prediction generators
  private static generateMainPrediction(): string {
    const predictions = [
      "A powerful cosmic shift brings unexpected opportunities your way today. Trust your intuition when making important decisions.",
      "The universe aligns in your favor - someone from your past may reappear with important news that changes everything.",
      "Your magnetic energy is at its peak today. People will be drawn to your wisdom and seek your guidance.",
      "A financial breakthrough approaches rapidly. Keep your eyes open for opportunities disguised as challenges.",
      "Love energy surrounds you like a protective shield. Someone special notices your unique qualities today.",
      "Your spiritual awakening accelerates - pay attention to signs, synchronicities, and recurring number patterns.",
      "A major life decision becomes crystal clear by evening. The answer you've been seeking finally reveals itself.",
      "Hidden talents surface unexpectedly. Something you've always been naturally good at becomes profitable.",
      "Communication from the universe comes through an unexpected messenger. Listen carefully to casual conversations.",
      "Your emotional healing reaches a turning point. Past wounds transform into sources of strength and wisdom."
    ];
    
    return predictions[Math.floor(Math.random() * predictions.length)];
  }

  private static generateLoveAspect(): OracleAspect {
    const predictions = [
      "A meaningful conversation deepens an existing relationship beyond your expectations.",
      "Someone from a different background enters your life with romantic potential.", 
      "Past relationship patterns finally make sense, freeing you to love more openly.",
      "Your soulmate sends subtle signs - pay attention to repeated encounters and coincidences.",
      "A friend reveals deeper feelings, transforming your dynamic in beautiful ways.",
      "Self-love reaches new heights, making you irresistibly attractive to others.",
      "Family relationships heal through honest communication and mutual understanding.",
      "A romantic gesture from an unexpected source touches your heart profoundly."
    ];

    const advice = [
      "Be vulnerable and authentic in your communications today.",
      "Trust your heart's wisdom over your mind's doubts.",
      "Show appreciation for those who support you unconditionally.",
      "Release past hurt to make room for new love.",
      "Listen with your heart, not just your ears.",
      "Express your feelings before the moment passes."
    ];

    return {
      category: "Love & Relationships",
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      advice: advice[Math.floor(Math.random() * advice.length)],
      intensity: this.getRandomIntensity(),
      timeframe: "Today",
      actionItems: ["Have an honest conversation", "Express gratitude", "Show affection"]
    };
  }

  private static generateMoneyAspect(): OracleAspect {
    const predictions = [
      "An unexpected income source appears through your network of connections.",
      "Investment or savings advice from a trusted friend proves incredibly valuable.",
      "Your creative skills become a profitable venture sooner than expected.",
      "A business opportunity disguised as a favor leads to financial growth.",
      "Past investments or forgotten assets resurface with surprising value.",
      "Your expertise in a specific area attracts lucrative consulting offers.",
      "A financial partnership or collaboration brings mutual prosperity.",
      "Abundance flows when you align your work with your true passion."
    ];

    const advice = [
      "Network authentically - your next opportunity comes through relationships.",
      "Trust your business instincts, especially regarding partnerships.",
      "Invest in your skills and education for long-term wealth building.",
      "Be generous with others - abundance multiplies when shared.",
      "Track your expenses carefully to identify money-saving opportunities.",
      "Consider multiple income streams for financial security."
    ];

    return {
      category: "Money & Wealth",
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      advice: advice[Math.floor(Math.random() * advice.length)],
      intensity: this.getRandomIntensity(),
      timeframe: "Within 3 days",
      actionItems: ["Review finances", "Network with peers", "Explore new income sources"]
    };
  }

  private static generateCareerAspect(): OracleAspect {
    const predictions = [
      "Your unique perspective on a project catches the attention of decision-makers.",
      "A mentor figure appears to guide your next career move with wisdom.",
      "Skills you developed in the past become surprisingly relevant to new opportunities.",
      "Your reputation for reliability opens doors to advancement and recognition.",
      "A creative solution to a workplace challenge showcases your problem-solving abilities.",
      "Networking events or professional connections lead to unexpected career paths.",
      "Your leadership qualities emerge naturally during team collaborations.",
      "Industry changes create perfect timing for your career transition or promotion."
    ];

    const advice = [
      "Speak up about your ideas and contributions during meetings.",
      "Seek feedback from supervisors to understand growth opportunities.",
      "Update your professional profiles and showcase recent achievements.",
      "Volunteer for challenging projects that stretch your capabilities.",
      "Build relationships with colleagues across different departments.",
      "Stay informed about industry trends that affect your field."
    ];

    return {
      category: "Career & Success",
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      advice: advice[Math.floor(Math.random() * advice.length)],
      intensity: this.getRandomIntensity(),
      timeframe: "This week",
      actionItems: ["Update resume", "Network professionally", "Showcase skills"]
    };
  }

  private static generateHealthAspect(): OracleAspect {
    const predictions = [
      "Your body responds exceptionally well to new wellness routines you implement.",
      "Energy levels surge when you align your lifestyle with natural rhythms.",
      "A health concern resolves itself through simple dietary or lifestyle changes.",
      "Stress melts away when you discover a perfect relaxation technique for you.",
      "Your intuition guides you toward exactly what your body needs for healing.",
      "Physical activity becomes a source of joy rather than obligation.",
      "Sleep quality improves dramatically through better evening routines.",
      "Mental clarity increases when you reduce information overload and digital noise."
    ];

    const advice = [
      "Listen to your body's signals about rest, nutrition, and movement.",
      "Spend time in nature to restore your energy and mental clarity.",
      "Practice mindfulness to reduce stress and improve emotional well-being.",
      "Stay hydrated and nourish your body with whole, natural foods.",
      "Establish consistent sleep and wake times for better rest quality.",
      "Find physical activities that bring you joy, not just fitness."
    ];

    return {
      category: "Health & Wellness",
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      advice: advice[Math.floor(Math.random() * advice.length)],
      intensity: this.getRandomIntensity(),
      timeframe: "Today",
      actionItems: ["Exercise mindfully", "Eat nutritiously", "Rest adequately"]
    };
  }

  private static generateSpiritualAspect(): OracleAspect {
    const predictions = [
      "A profound spiritual insight emerges during quiet moments of reflection.",
      "Synchronicities multiply, confirming you're aligned with your highest path.",
      "Your psychic abilities strengthen, allowing deeper intuitive understanding.",
      "A spiritual teacher or guide appears in human form to share wisdom.",
      "Meditation or prayer practice unlocks new levels of inner peace.",
      "Past life memories or soul knowledge surfaces to heal current situations.",
      "Your connection to the divine/universe intensifies through daily practices.",
      "A spiritual breakthrough dissolves old limiting beliefs permanently."
    ];

    const advice = [
      "Trust your intuition completely, especially regarding people and situations.",
      "Spend time in meditation, prayer, or quiet contemplation.",
      "Pay attention to repeated signs, symbols, and number sequences.",
      "Journal your dreams and intuitive insights for pattern recognition.",
      "Practice gratitude to raise your vibration and attract abundance.",
      "Connect with like-minded souls who support your spiritual growth."
    ];

    return {
      category: "Spiritual Growth",
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      advice: advice[Math.floor(Math.random() * advice.length)],
      intensity: this.getRandomIntensity(),
      timeframe: "Today",
      actionItems: ["Meditate", "Journal insights", "Practice gratitude"]
    };
  }

  // Helper methods
  private static generateWarnings(): string[] {
    const warnings = [
      "Avoid making major financial decisions between 2-4 PM when mental clarity is reduced.",
      "Someone close to you may test your boundaries - stay firm but compassionate.",
      "Emotional reactions could be heightened this evening - practice patience.",
      "Technology issues may arise around midday - back up important files.",
      "Miscommunication possible in text messages - prefer phone calls for important matters.",
      "Your empathy may attract energy vampires - protect your emotional space."
    ];
    
    return [warnings[Math.floor(Math.random() * warnings.length)]];
  }

  private static generateOpportunities(): string[] {
    const opportunities = [
      "A chance encounter before noon could lead to lasting friendship or partnership.",
      "Creative inspiration strikes strongest between 6-8 PM - capture your ideas.",
      "Someone seeks your advice on a topic you're passionate about - share generously.",
      "A small investment or purchase today yields unexpected returns within weeks.",
      "Your kindness to a stranger creates ripple effects that benefit you later.",
      "A learning opportunity presents itself - say yes even if timing seems inconvenient."
    ];
    
    return [opportunities[Math.floor(Math.random() * opportunities.length)]];
  }

  private static generatePersonalGuidance(name?: string): string {
    const guidanceTemplates = [
      `${name || 'Dear soul'}, today your inner wisdom speaks louder than external noise. Trust what you know to be true.`,
      `The universe recognizes your efforts, ${name || 'beautiful being'}. Your persistence is about to pay off in unexpected ways.`,
      `${name || 'Beloved'}, your authentic self is your greatest asset today. Don't dim your light to fit others' expectations.`,
      `Today brings confirmation that you're exactly where you need to be, ${name || 'wonderful soul'}. Trust the process.`,
      `${name || 'Dear one'}, your compassion and wisdom help others more than you realize. Your presence is a gift.`,
      `The path ahead becomes clearer with each step, ${name || 'cherished being'}. Keep moving forward with confidence.`
    ];
    
    return guidanceTemplates[Math.floor(Math.random() * guidanceTemplates.length)];
  }

  private static generateCosmicInfluence(): string {
    const influences = [
      "Mercury's favorable position enhances communication and mental clarity throughout the day.",
      "Venus energy amplifies love, creativity, and artistic inspiration until sunset.", 
      "Mars provides extra courage and determination for tackling challenging projects.",
      "The moon's phase supports emotional healing and releasing what no longer serves you.",
      "Jupiter's expansive energy opens doors to growth, learning, and abundance.",
      "Saturn's stabilizing influence helps you build solid foundations for the future.",
      "Uranus brings unexpected but positive changes that align with your highest good.",
      "Neptune heightens intuition and spiritual connection, especially during meditation."
    ];
    
    return influences[Math.floor(Math.random() * influences.length)];
  }

  private static getRandomIntensity(): 'low' | 'medium' | 'high' | 'extreme' {
    const intensities: ('low' | 'medium' | 'high' | 'extreme')[] = ['medium', 'high', 'medium', 'high', 'extreme'];
    return intensities[Math.floor(Math.random() * intensities.length)];
  }

  private static getLuckyColor(): string {
    const colors = ['Golden Yellow', 'Royal Blue', 'Emerald Green', 'Rose Pink', 'Purple Amethyst', 'Silver', 'Coral Orange', 'Turquoise'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private static getLuckyTime(): string {
    const hours = ['8:30 AM', '11:15 AM', '2:45 PM', '5:20 PM', '7:30 PM', '9:45 PM'];
    return hours[Math.floor(Math.random() * hours.length)];
  }

  // Get quick insight for home page display
  static getQuickOracleInsight(): string {
    const oracle = this.generateDailyOracle();
    return oracle.mainPrediction;
  }

  // Get formatted oracle summary for display
  static getOracleSummary(): {
    mainInsight: string;
    luckyNumber: number;
    luckyColor: string;
    energyLevel: number;
    confidenceScore: number;
    validUntil: string;
  } {
    const oracle = this.generateDailyOracle();
    return {
      mainInsight: oracle.mainPrediction,
      luckyNumber: oracle.luckyNumber,
      luckyColor: oracle.luckyColor,
      energyLevel: oracle.energyLevel,
      confidenceScore: oracle.confidenceScore,
      validUntil: oracle.validUntil
    };
  }
}