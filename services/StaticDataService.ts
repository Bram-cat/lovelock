// Static data service for instant loading while AI content loads in background
export class StaticDataService {
  
  // Static deadly sin warnings based on life path numbers
  static getStaticDeadlySinWarning(lifePathNumber: number, userName: string) {
    const warnings = {
      1: { sin: 'Pride', warning: `${userName}, your leadership nature may lead to pride. Stay humble and open to others' perspectives.`, consequences: 'Pride can isolate you and damage relationships.' },
      2: { sin: 'Envy', warning: `${userName}, your sensitive nature may lead to comparison with others. Focus on your own journey.`, consequences: 'Envy can poison your peace and relationships.' },
      3: { sin: 'Gluttony', warning: `${userName}, your love for life's pleasures may lead to excess. Practice moderation.`, consequences: 'Overindulgence can harm your health and relationships.' },
      4: { sin: 'Sloth', warning: `${userName}, your methodical nature may sometimes lead to procrastination. Take action when needed.`, consequences: 'Inaction can prevent you from achieving your goals.' },
      5: { sin: 'Wrath', warning: `${userName}, your passionate nature may lead to anger when restricted. Channel this energy positively.`, consequences: 'Anger can destroy relationships and opportunities.' },
      6: { sin: 'Greed', warning: `${userName}, your nurturing nature may become possessive. Allow others their freedom.`, consequences: 'Possessiveness can suffocate relationships.' },
      7: { sin: 'Lust', warning: `${userName}, your seeking nature may lead to spiritual or material obsessions. Find balance.`, consequences: 'Obsession can blind you to true fulfillment.' },
      8: { sin: 'Greed', warning: `${userName}, your ambitious nature may lead to material greed. Remember what truly matters.`, consequences: 'Greed can corrupt your values and relationships.' },
      9: { sin: 'Pride', warning: `${userName}, your wise nature may lead to spiritual pride. Stay humble in your wisdom.`, consequences: 'Spiritual pride can separate you from others.' },
      11: { sin: 'Pride', warning: `${userName}, your intuitive gifts may lead to spiritual superiority. Use your gifts to serve others.`, consequences: 'Spiritual pride can isolate you from humanity.' },
      22: { sin: 'Pride', warning: `${userName}, your master builder energy may lead to ego inflation. Stay grounded and humble.`, consequences: 'Ego can prevent you from achieving your highest purpose.' },
      33: { sin: 'Pride', warning: `${userName}, your master teacher energy may lead to spiritual arrogance. Teach with compassion.`, consequences: 'Arrogance can block your ability to truly help others.' }
    };
    
    return warnings[lifePathNumber as keyof typeof warnings] || warnings[1];
  }

  // Static love insights based on life path numbers
  static getStaticLoveInsights(lifePathNumber: number, userName: string) {
    const insights = {
      1: `${userName}, you're a natural leader in love. You attract partners who appreciate your confidence and drive. Look for someone who supports your ambitions while challenging you to grow. Your ideal match respects your independence but isn't afraid to stand their ground.`,
      
      2: `${userName}, you're the diplomatic lover. You excel at creating harmony and deep emotional connections. Seek a partner who values your sensitivity and intuition. Your gentle nature attracts those who need healing, but ensure the relationship is balanced.`,
      
      3: `${userName}, you bring joy and creativity to relationships. Your optimistic spirit and communication skills make you irresistible. Look for a partner who appreciates your expressiveness and can keep up with your social energy while providing emotional depth.`,
      
      4: `${userName}, you're the reliable, steady partner everyone dreams of. You build relationships on solid foundations of trust and commitment. Seek someone who values stability and shares your long-term vision. Your loyalty deserves to be matched.`,
      
      5: `${userName}, you're the adventurous lover who brings excitement and variety. Your free spirit attracts partners who crave adventure and growth. Find someone who gives you space to explore while being your home base for emotional security.`,
      
      6: `${userName}, you're the nurturing, caring partner who creates a loving home. Your protective nature and ability to heal others draws those seeking emotional security. Look for someone who appreciates your devotion and can reciprocate your deep care.`,
      
      7: `${userName}, you're the mysterious, spiritual lover who seeks deep soul connections. Your analytical mind and intuitive nature attract partners interested in personal growth. Find someone who respects your need for solitude and shares your quest for truth.`,
      
      8: `${userName}, you're the powerful, ambitious lover who attracts success-oriented partners. Your material and emotional generosity creates strong bonds. Seek someone who matches your drive and can handle your intensity while keeping you grounded.`,
      
      9: `${userName}, you're the compassionate, wise lover who attracts those seeking transformation. Your humanitarian heart and emotional depth inspire others. Look for a partner who shares your values and supports your mission to help others.`,
      
      11: `${userName}, you're the intuitive, inspiring lover with deep spiritual connection abilities. Your sensitivity and vision attract soulmate-level relationships. Seek someone who understands your spiritual nature and emotional intensity.`,
      
      22: `${userName}, you're the master builder in love, creating relationships that can change the world. Your practical spirituality attracts partners who share your vision for making a difference. Find someone who supports your big dreams.`,
      
      33: `${userName}, you're the master teacher in love, inspiring others through your relationships. Your compassionate wisdom attracts those seeking healing and growth. Look for a partner who appreciates your depth and joins your mission of service.`
    };
    
    return insights[lifePathNumber as keyof typeof insights] || insights[1];
  }

  // Static relationship advice based on numbers
  static getStaticRelationshipAdvice(lifePathNumber: number) {
    const advice = {
      1: "Take the lead but remember to listen. Your partner needs to feel heard and valued, not dominated.",
      2: "Trust your intuition about people. Your sensitivity is your superpower in choosing the right partner.",
      3: "Keep communication fun and light. Your positivity can heal relationship wounds and create lasting joy.",
      4: "Build slowly and steadily. Your patient approach to love creates the strongest, most lasting relationships.",
      5: "Embrace change together. Grow as individuals while maintaining your connection and shared adventures.",
      6: "Balance giving with receiving. Your generous heart deserves a partner who gives back equally.",
      7: "Share your inner world. Opening up emotionally will deepen your connections beyond the surface.",
      8: "Balance work and love. Success means nothing without someone special to share it with.",
      9: "Lead with your heart. Your compassion and wisdom can transform any relationship into something beautiful."
    };
    
    return advice[lifePathNumber as keyof typeof advice] || advice[1];
  }

  // Get complete static love profile
  static getStaticLoveProfile(lifePathNumber: number, userName: string) {
    return {
      deadlySinWarning: this.getStaticDeadlySinWarning(lifePathNumber, userName),
      aiLoveInsights: this.getStaticLoveInsights(lifePathNumber, userName),
      relationshipAdvice: this.getStaticRelationshipAdvice(lifePathNumber)
    };
  }

  // Static numerology insights
  static getStaticNumerologyInsights(lifePathNumber: number, userName: string) {
    const insights = {
      1: `${userName}, you are a natural-born leader with pioneering spirit. Your independence and determination drive you to achieve great things. Focus on balancing your strong will with compassion for others.`,
      2: `${userName}, you are the diplomatic peacemaker with incredible intuition. Your sensitivity and cooperation skills make you an excellent partner and friend. Trust your inner wisdom and emotional intelligence.`,
      3: `${userName}, you are the creative communicator who brings joy wherever you go. Your optimism and artistic talents inspire others. Use your gift of expression to uplift and motivate those around you.`,
      4: `${userName}, you are the reliable foundation builder with incredible work ethic. Your practical approach and attention to detail create lasting success. Remember to balance work with play and relationships.`,
      5: `${userName}, you are the free-spirited adventurer who craves variety and experience. Your curiosity and adaptability open many doors. Channel your energy into meaningful pursuits that benefit others.`,
      6: `${userName}, you are the nurturing caregiver with a heart full of love. Your responsibility and healing abilities make you a natural protector. Remember to care for yourself while caring for others.`,
      7: `${userName}, you are the spiritual seeker with deep analytical abilities. Your quest for truth and inner wisdom guides your path. Share your insights to help others on their spiritual journey.`,
      8: `${userName}, you are the material master with incredible business acumen. Your ambition and organizational skills lead to worldly success. Use your power to create positive change in the world.`,
      9: `${userName}, you are the humanitarian visionary with a global perspective. Your compassion and wisdom inspire transformation. Your mission is to serve humanity and create a better world for all.`
    };
    
    return insights[lifePathNumber as keyof typeof insights] || insights[1];
  }
}