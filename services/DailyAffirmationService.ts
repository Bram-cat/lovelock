// Daily Affirmation Service for user engagement
export interface DailyAffirmation {
  id: string;
  date: string;
  affirmation: string;
  category: 'love' | 'success' | 'spiritual' | 'confidence' | 'abundance';
  icon: string;
}

export class DailyAffirmationService {
  private static affirmations: DailyAffirmation[] = [
    // Love Affirmations
    {
      id: 'love1',
      date: new Date().toDateString(),
      affirmation: "Love flows to me effortlessly, and I am worthy of deep, meaningful connections.",
      category: 'love',
      icon: 'heart'
    },
    {
      id: 'love2',
      date: new Date().toDateString(),
      affirmation: "My heart is open to giving and receiving love in its purest form.",
      category: 'love',
      icon: 'heart'
    },
    {
      id: 'love3',
      date: new Date().toDateString(),
      affirmation: "I attract relationships that honor my authentic self and support my growth.",
      category: 'love',
      icon: 'heart'
    },
    
    // Success Affirmations
    {
      id: 'success1',
      date: new Date().toDateString(),
      affirmation: "I am aligned with my purpose, and success flows naturally through my actions.",
      category: 'success',
      icon: 'star'
    },
    {
      id: 'success2',
      date: new Date().toDateString(),
      affirmation: "Every challenge I face is an opportunity for tremendous growth and victory.",
      category: 'success',
      icon: 'trophy'
    },
    {
      id: 'success3',
      date: new Date().toDateString(),
      affirmation: "My unique talents and gifts create value that the world recognizes and rewards.",
      category: 'success',
      icon: 'diamond'
    },
    
    // Spiritual Affirmations
    {
      id: 'spiritual1',
      date: new Date().toDateString(),
      affirmation: "I am connected to the infinite wisdom of the universe, and guidance comes to me clearly.",
      category: 'spiritual',
      icon: 'moon'
    },
    {
      id: 'spiritual2',
      date: new Date().toDateString(),
      affirmation: "My intuition is powerful and trustworthy, leading me to my highest good.",
      category: 'spiritual',
      icon: 'eye'
    },
    {
      id: 'spiritual3',
      date: new Date().toDateString(),
      affirmation: "I am divinely protected and guided on my soul's sacred journey.",
      category: 'spiritual',
      icon: 'sparkles'
    },
    
    // Confidence Affirmations
    {
      id: 'confidence1',
      date: new Date().toDateString(),
      affirmation: "I radiate confidence and self-assurance in everything I do.",
      category: 'confidence',
      icon: 'flame'
    },
    {
      id: 'confidence2',
      date: new Date().toDateString(),
      affirmation: "My inner strength is unshakeable, and I face life with courage and grace.",
      category: 'confidence',
      icon: 'shield'
    },
    {
      id: 'confidence3',
      date: new Date().toDateString(),
      affirmation: "I trust myself completely and make decisions from a place of inner wisdom.",
      category: 'confidence',
      icon: 'checkmark-circle'
    },
    
    // Abundance Affirmations
    {
      id: 'abundance1',
      date: new Date().toDateString(),
      affirmation: "Abundance flows to me from expected and unexpected sources.",
      category: 'abundance',
      icon: 'leaf'
    },
    {
      id: 'abundance2',
      date: new Date().toDateString(),
      affirmation: "I am a magnet for prosperity, opportunities, and all forms of abundance.",
      category: 'abundance',
      icon: 'infinite'
    },
    {
      id: 'abundance3',
      date: new Date().toDateString(),
      affirmation: "My grateful heart attracts more blessings and miracles into my life.",
      category: 'abundance',
      icon: 'gift'
    }
  ];

  static getTodaysAffirmation(): DailyAffirmation {
    const today = new Date();
    // Use day of year to consistently get the same affirmation for the same day
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const affirmationIndex = dayOfYear % this.affirmations.length;
    
    return {
      ...this.affirmations[affirmationIndex],
      date: today.toDateString()
    };
  }

  static getAffirmationsByCategory(category: DailyAffirmation['category']): DailyAffirmation[] {
    return this.affirmations.filter(affirmation => affirmation.category === category);
  }

  static getRandomAffirmation(): DailyAffirmation {
    const randomIndex = Math.floor(Math.random() * this.affirmations.length);
    return {
      ...this.affirmations[randomIndex],
      date: new Date().toDateString()
    };
  }

  // Get affirmation based on numerology numbers
  static getPersonalizedAffirmation(lifePathNumber: number): DailyAffirmation {
    const categories: DailyAffirmation['category'][] = ['love', 'success', 'spiritual', 'confidence', 'abundance'];
    const category = categories[(lifePathNumber - 1) % categories.length];
    
    const categoryAffirmations = this.getAffirmationsByCategory(category);
    const randomAffirmation = categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
    
    return {
      ...randomAffirmation,
      date: new Date().toDateString()
    };
  }
}