// Profile Symbol Service for automatic symbol calculation
import { supabase } from '../lib/supabase-client';

export interface UserSymbols {
  lifePathSymbol: string;
  destinySymbol: string;
  personalitySymbol: string;
  element: string;
  color: string;
  planet: string;
  meaning: string;
}

export class ProfileSymbolService {
  
  // Simple symbol calculation based on numerology numbers
  private static calculateLifePathNumber(birthDate: string): number {
    const parts = birthDate.split('-').map(Number);
    if (parts.length !== 3) return 1;
    
    let sum = parts[0] + parts[1] + parts[2];
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }

  private static calculateDestinyNumber(name: string): number {
    const letterValues: { [key: string]: number } = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
      J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
      S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
    };

    let sum = name.toUpperCase().split('').reduce((acc, letter) => {
      return acc + (letterValues[letter] || 0);
    }, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }

  private static getSymbolsForNumber(number: number): { symbol: string; element: string; color: string; planet: string; meaning: string } {
    const symbolMap: { [key: number]: any } = {
      1: { symbol: '🌟', element: 'Fire', color: 'Red', planet: 'Sun', meaning: 'Leadership and independence' },
      2: { symbol: '🌙', element: 'Water', color: 'Silver', planet: 'Moon', meaning: 'Partnership and harmony' },
      3: { symbol: '⚡', element: 'Air', color: 'Yellow', planet: 'Jupiter', meaning: 'Creativity and expression' },
      4: { symbol: '🌍', element: 'Earth', color: 'Green', planet: 'Saturn', meaning: 'Stability and hard work' },
      5: { symbol: '🌪️', element: 'Air', color: 'Blue', planet: 'Mercury', meaning: 'Freedom and adventure' },
      6: { symbol: '💖', element: 'Earth', color: 'Pink', planet: 'Venus', meaning: 'Love and nurturing' },
      7: { symbol: '🔮', element: 'Water', color: 'Purple', planet: 'Neptune', meaning: 'Spirituality and wisdom' },
      8: { symbol: '💎', element: 'Earth', color: 'Gold', planet: 'Saturn', meaning: 'Material success' },
      9: { symbol: '🌈', element: 'Fire', color: 'White', planet: 'Mars', meaning: 'Universal love' }
    };
    return symbolMap[number] || symbolMap[1];
  }

  // Calculate and save user symbols when birthday/name changes
  static async calculateAndSaveSymbols(
    userId: string,
    birthDate: string,
    fullName: string
  ): Promise<UserSymbols | null> {
    
    if (!birthDate || !fullName) {
      console.log('ProfileSymbolService: Missing birth date or full name');
      return null;
    }

    try {
      console.log('🔮 Calculating numerology symbols for user:', userId);
      
      // Calculate numerology numbers
      const lifePathNumber = this.calculateLifePathNumber(birthDate);
      const destinyNumber = this.calculateDestinyNumber(fullName);
      const personalityNumber = this.calculateDestinyNumber(fullName.replace(/[aeiou]/gi, ''));

      // Get symbols for each number
      const lifePathSymbols = this.getSymbolsForNumber(lifePathNumber);
      const destinySymbols = this.getSymbolsForNumber(destinyNumber);
      const personalitySymbols = this.getSymbolsForNumber(personalityNumber);
      
      // Create user symbols object
      const userSymbols: UserSymbols = {
        lifePathSymbol: lifePathSymbols.symbol,
        destinySymbol: destinySymbols.symbol,
        personalitySymbol: personalitySymbols.symbol,
        element: lifePathSymbols.element,
        color: lifePathSymbols.color,
        planet: lifePathSymbols.planet,
        meaning: lifePathSymbols.meaning
      };

      // Save to Supabase profile (excluding destiny_symbol as it doesn't exist in DB)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          life_path_symbol: userSymbols.lifePathSymbol,
          personality_symbol: userSymbols.personalitySymbol,
          numerology_element: userSymbols.element,
          numerology_color: userSymbols.color,
          numerology_planet: userSymbols.planet,
          numerology_meaning: userSymbols.meaning,
          symbols_calculated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', userId);

      if (error) {
        console.error('Error saving symbols to database:', error);
      } else {
        console.log('✨ Symbols successfully calculated and saved for user:', userId);
      }

      return userSymbols;
      
    } catch (error) {
      console.error('Error calculating symbols:', error);
      return null;
    }
  }

  // Get saved symbols from database
  static async getUserSymbols(userId: string): Promise<UserSymbols | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          life_path_symbol,
          personality_symbol,
          numerology_element,
          numerology_color,
          numerology_planet,
          numerology_meaning,
          full_name
        `)
        .eq('clerk_user_id', userId)
        .single();

      if (error || !data) {
        console.log('No symbols found for user:', userId);
        return null;
      }

      // Calculate destiny symbol since it's not stored in DB
      const destinyNumber = data.full_name ? this.calculateDestinyNumber(data.full_name) : 1;
      const destinySymbols = this.getSymbolsForNumber(destinyNumber);

      return {
        lifePathSymbol: data.life_path_symbol,
        destinySymbol: destinySymbols.symbol,
        personalitySymbol: data.personality_symbol,
        element: data.numerology_element,
        color: data.numerology_color,
        planet: data.numerology_planet,
        meaning: data.numerology_meaning
      };

    } catch (error) {
      console.error('Error fetching user symbols:', error);
      return null;
    }
  }

  // Check if symbols need to be recalculated (when profile data changes)
  static async checkAndUpdateSymbols(
    userId: string,
    currentBirthDate: string,
    currentFullName: string
  ): Promise<UserSymbols | null> {
    
    try {
      // Get current profile data from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('birth_date, full_name, symbols_calculated_at')
        .eq('clerk_user_id', userId)
        .single();

      if (error) {
        console.log('Error fetching profile for symbol check:', error);
        return null;
      }

      // Check if symbols need recalculation
      const needsRecalculation = (
        !profile.symbols_calculated_at ||
        profile.birth_date !== currentBirthDate ||
        profile.full_name !== currentFullName
      );

      if (needsRecalculation) {
        console.log('🔄 Symbols need recalculation for user:', userId);
        return await this.calculateAndSaveSymbols(userId, currentBirthDate, currentFullName);
      } else {
        console.log('✅ Symbols are up to date for user:', userId);
        return await this.getUserSymbols(userId);
      }
      
    } catch (error) {
      console.error('Error in checkAndUpdateSymbols:', error);
      return null;
    }
  }

  // Format symbols for display
  static formatSymbolsForDisplay(symbols: UserSymbols): string {
    return `${symbols.lifePathSymbol} ${symbols.destinySymbol} ${symbols.personalitySymbol}`;
  }

  // Get symbol interpretation
  static getSymbolInterpretation(symbols: UserSymbols): string {
    return `Your cosmic signature combines ${symbols.element} energy (${symbols.lifePathSymbol}) guided by ${symbols.planet}, expressed through ${symbols.color.toLowerCase()} vibrations. ${symbols.meaning}`;
  }
}