// Profile Symbol Service for automatic symbol calculation
import { NumerologyCompatibilityDatabase } from './NumerologyCompatibilityDatabase';
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
      
      // Calculate personal symbols using the comprehensive database
      const personalSymbols = NumerologyCompatibilityDatabase.calculatePersonalSymbols(birthDate, fullName);
      
      // Create user symbols object
      const userSymbols: UserSymbols = {
        lifePathSymbol: personalSymbols.lifePathSymbol.symbol,
        destinySymbol: personalSymbols.destinySymbol.symbol,
        personalitySymbol: personalSymbols.personalitySymbol.symbol,
        element: personalSymbols.lifePathSymbol.element,
        color: personalSymbols.lifePathSymbol.color,
        planet: personalSymbols.lifePathSymbol.planet,
        meaning: personalSymbols.lifePathSymbol.meaning
      };

      // Save to Supabase profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          life_path_symbol: userSymbols.lifePathSymbol,
          destiny_symbol: userSymbols.destinySymbol,
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
          destiny_symbol,
          personality_symbol,
          numerology_element,
          numerology_color,
          numerology_planet,
          numerology_meaning
        `)
        .eq('clerk_user_id', userId)
        .single();

      if (error || !data) {
        console.log('No symbols found for user:', userId);
        return null;
      }

      return {
        lifePathSymbol: data.life_path_symbol,
        destinySymbol: data.destiny_symbol,
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