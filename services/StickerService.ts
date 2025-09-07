// Sticker Service for Web-Based Stickers and Local Assets
export interface StickerInfo {
  id: string;
  type: 'web' | 'local' | 'lottie';
  url?: string;
  localPath?: string;
  fallbackEmoji: string;
  category: string;
}

export class StickerService {
  
  // Curated web stickers for different categories
  private static readonly WEB_STICKERS: { [key: string]: StickerInfo } = {
    // Mystical & Magic
    crystal_ball: {
      id: 'crystal_ball',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2021/02/03/13/37/crystal-ball-5979152_960_720.png',
      fallbackEmoji: '🔮',
      category: 'mystical'
    },
    magic_sparkles: {
      id: 'magic_sparkles',
      type: 'web', 
      url: 'https://cdn.pixabay.com/photo/2017/06/14/16/20/stars-2402047_960_720.png',
      fallbackEmoji: '✨',
      category: 'mystical'
    },
    fortune_wheel: {
      id: 'fortune_wheel',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/12/03/18/57/wheel-of-fortune-1880234_960_720.png',
      fallbackEmoji: '🎯',
      category: 'mystical'
    },

    // Success & Money
    gold_coins: {
      id: 'gold_coins',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png',
      fallbackEmoji: '💰',
      category: 'money'
    },
    diamond: {
      id: 'diamond',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/04/15/18/05/diamond-1331558_960_720.png',
      fallbackEmoji: '💎',
      category: 'luxury'
    },
    crown: {
      id: 'crown',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/50/crown-1295689_960_720.png',
      fallbackEmoji: '👑',
      category: 'success'
    },

    // Love & Relationships
    heart_magic: {
      id: 'heart_magic',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/heart-1295821_960_720.png',
      fallbackEmoji: '💕',
      category: 'love'
    },
    cupid_arrow: {
      id: 'cupid_arrow',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/arrow-1295822_960_720.png',
      fallbackEmoji: '💘',
      category: 'love'
    },

    // Energy & Power
    lightning_bolt: {
      id: 'lightning_bolt',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/lightning-1295833_960_720.png',
      fallbackEmoji: '⚡',
      category: 'energy'
    },
    fire_flame: {
      id: 'fire_flame',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/fire-1295834_960_720.png',
      fallbackEmoji: '🔥',
      category: 'energy'
    },

    // Cosmic & Astrology
    moon_phases: {
      id: 'moon_phases',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/moon-1295835_960_720.png',
      fallbackEmoji: '🌙',
      category: 'cosmic'
    },
    star_constellation: {
      id: 'star_constellation',
      type: 'web',
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/star-1295836_960_720.png',
      fallbackEmoji: '⭐',
      category: 'cosmic'
    }
  };

  // High-quality Lottie animation URLs (for premium feel)
  private static readonly LOTTIE_ANIMATIONS: { [key: string]: StickerInfo } = {
    magic_portal: {
      id: 'magic_portal',
      type: 'lottie',
      url: 'https://assets3.lottiefiles.com/packages/lf20_DMgKk1.json',
      fallbackEmoji: '🌀',
      category: 'mystical'
    },
    success_confetti: {
      id: 'success_confetti',
      type: 'lottie', 
      url: 'https://assets2.lottiefiles.com/packages/lf20_obhph3sh.json',
      fallbackEmoji: '🎉',
      category: 'success'
    },
    floating_hearts: {
      id: 'floating_hearts',
      type: 'lottie',
      url: 'https://assets1.lottiefiles.com/packages/lf20_xxbrrxcv.json',
      fallbackEmoji: '💖',
      category: 'love'
    }
  };

  // Get sticker by category and context
  static getSticker(category: string, context?: string): StickerInfo {
    const stickers = { ...this.WEB_STICKERS, ...this.LOTTIE_ANIMATIONS };
    
    // Find stickers matching category
    const categoryStickers = Object.values(stickers).filter(s => s.category === category);
    
    if (categoryStickers.length > 0) {
      // Return random sticker from category
      return categoryStickers[Math.floor(Math.random() * categoryStickers.length)];
    }

    // Fallback to first available sticker
    return Object.values(stickers)[0];
  }

  // Get sticker for specific contexts
  static getContextSticker(context: 'daily_insight' | 'level_up' | 'achievement' | 'love_match' | 'money_prediction'): StickerInfo {
    const contextMap = {
      daily_insight: this.getSticker('mystical'),
      level_up: this.getSticker('success'),
      achievement: this.getSticker('success'),
      love_match: this.getSticker('love'),
      money_prediction: this.getSticker('money')
    };

    return contextMap[context] || this.getSticker('mystical');
  }

  // Alternative: Local asset paths for downloaded stickers
  static getLocalStickerPath(stickerId: string): string | null {
    // This will be populated after you download and add stickers to your assets
    // For now, return null to use web stickers or fallback emojis
    const localPaths: { [key: string]: string } = {
      // Uncomment these lines after downloading stickers to assets/stickers/
      // crystal_ball: require('../assets/stickers/crystal-ball.png'),
      // magic_sparkles: require('../assets/stickers/magic-sparkles.png'),
      // gold_coins: require('../assets/stickers/gold-coins.png'),
      // heart_magic: require('../assets/stickers/heart-magic.png'),
      // lightning_bolt: require('../assets/stickers/lightning-bolt.png'),
    };

    return localPaths[stickerId] || null;
  }

  // Generate sticker download script for your assets folder
  static generateDownloadScript(): string {
    return `
# Sticker Download Script
# Create assets/stickers folder first: mkdir -p assets/stickers

# Mystical stickers
curl -o assets/stickers/crystal-ball.png "https://cdn.pixabay.com/photo/2021/02/03/13/37/crystal-ball-5979152_960_720.png"
curl -o assets/stickers/magic-sparkles.png "https://cdn.pixabay.com/photo/2017/06/14/16/20/stars-2402047_960_720.png"

# Money stickers  
curl -o assets/stickers/gold-coins.png "https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png"
curl -o assets/stickers/diamond.png "https://cdn.pixabay.com/photo/2016/04/15/18/05/diamond-1331558_960_720.png"

# Love stickers
curl -o assets/stickers/heart-magic.png "https://cdn.pixabay.com/photo/2016/03/31/19/25/heart-1295821_960_720.png"

# Energy stickers
curl -o assets/stickers/lightning-bolt.png "https://cdn.pixabay.com/photo/2016/03/31/19/25/lightning-1295833_960_720.png"
curl -o assets/stickers/fire-flame.png "https://cdn.pixabay.com/photo/2016/03/31/19/25/fire-1295834_960_720.png"

echo "Stickers downloaded to assets/stickers/"
    `;
  }

  // Premium sticker sources for paid options
  static getPremiumSources(): { name: string; url: string; description: string }[] {
    return [
      {
        name: "LottieFiles",
        url: "https://lottiefiles.com",
        description: "Animated JSON stickers - many free, premium for $9/month"
      },
      {
        name: "Flaticon",
        url: "https://flaticon.com", 
        description: "3M+ stickers, $9.99/month for premium"
      },
      {
        name: "Freepik",
        url: "https://freepik.com",
        description: "High-quality sticker packs, $9.99/month"
      },
      {
        name: "Icons8",
        url: "https://icons8.com",
        description: "Animated stickers and illustrations, $19/month"
      },
      {
        name: "Giphy Stickers",
        url: "https://developers.giphy.com",
        description: "Free API with thousands of animated stickers"
      }
    ];
  }
}