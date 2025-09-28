import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasSeenNumerologyIntro: boolean;
  hasSeenLoveMatchIntro: boolean;
  hasSeenTrustAssessmentIntro: boolean;
  lastShownDate: string;
}

export class OnboardingService {
  private static readonly STORAGE_KEY = 'lovelock_onboarding_state';

  // Get current onboarding state
  static async getOnboardingState(userId: string): Promise<OnboardingState> {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        return JSON.parse(data);
      }

      // Default state for new users
      return {
        hasSeenWelcome: false,
        hasSeenNumerologyIntro: false,
        hasSeenLoveMatchIntro: false,
        hasSeenTrustAssessmentIntro: false,
        lastShownDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting onboarding state:', error);
      return {
        hasSeenWelcome: false,
        hasSeenNumerologyIntro: false,
        hasSeenLoveMatchIntro: false,
        hasSeenTrustAssessmentIntro: false,
        lastShownDate: new Date().toISOString(),
      };
    }
  }

  // Update onboarding state
  static async updateOnboardingState(userId: string, updates: Partial<OnboardingState>): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const currentState = await this.getOnboardingState(userId);

      const newState = {
        ...currentState,
        ...updates,
        lastShownDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.error('Error updating onboarding state:', error);
    }
  }

  // Check if user should see welcome message
  static async shouldShowWelcome(userId: string): Promise<boolean> {
    const state = await this.getOnboardingState(userId);
    return !state.hasSeenWelcome;
  }

  // Show welcome message for new users - returns config for CustomAlert
  static async getWelcomeMessage(userId: string): Promise<{
    shouldShow: boolean;
    alertConfig?: {
      type: 'info';
      title: string;
      message: string;
      icon: 'star';
      iconColor: string;
      buttons: Array<{
        text: string;
        style: 'primary';
        onPress: () => Promise<void>;
      }>;
    };
  }> {
    const shouldShow = await this.shouldShowWelcome(userId);

    if (shouldShow) {
      return {
        shouldShow: true,
        alertConfig: {
          type: 'info' as const,
          title: "🌟 Welcome to Lovelock!",
          message: `Discover your mystical connection through ancient wisdom and modern insights.

✨ Numerology Reading - Unlock your life path and destiny numbers
💕 Love Match - Find your soulmate compatibility
🛡️ Trust Assessment - Analyze relationship trust through numerology
📱 Daily Vibe - Get personalized daily insights

Tap any tab below to begin your spiritual journey!`,
          icon: 'star' as const,
          iconColor: '#FFD700',
          buttons: [
            {
              text: "Let's Explore!",
              style: 'primary' as const,
              onPress: async () => {
                await this.updateOnboardingState(userId, { hasSeenWelcome: true });
              },
            },
          ],
        },
      };
    }

    return { shouldShow: false };
  }

  // Show feature-specific introductions - returns config for CustomAlert
  static async getFeatureIntro(userId: string, feature: 'numerology' | 'loveMatch' | 'trustAssessment'): Promise<{
    shouldShow: boolean;
    alertConfig?: {
      type: 'info';
      title: string;
      message: string;
      icon: 'star-outline' | 'heart-outline' | 'shield-outline' | 'information-circle-outline';
      iconColor: string;
      buttons: Array<{
        text: string;
        style: 'primary';
        onPress: () => Promise<void>;
      }>;
    };
  }> {
    const state = await this.getOnboardingState(userId);

    let shouldShow = false;
    let title = '';
    let message = '';
    let icon = 'information-circle-outline';
    let iconColor = '#9333EA';
    let updateKey: keyof OnboardingState = 'hasSeenWelcome';

    switch (feature) {
      case 'numerology':
        shouldShow = !state.hasSeenNumerologyIntro;
        updateKey = 'hasSeenNumerologyIntro';
        title = '🔮 Numerology Reading';
        icon = 'star-outline';
        iconColor = '#9333EA';
        message = `Discover the hidden meanings in your name and birth date!

✨ Your Life Path Number reveals your life's purpose
🎯 Destiny Number shows your ultimate goal
💫 Soul Urge Number uncovers your inner desires

Simply enter your full name and birth date to receive your personalized numerology profile with AI-powered insights.`;
        break;

      case 'loveMatch':
        shouldShow = !state.hasSeenLoveMatchIntro;
        updateKey = 'hasSeenLoveMatchIntro';
        title = '💕 Love Match Analysis';
        icon = 'heart-outline';
        iconColor = '#FF6B9D';
        message = `Find your perfect romantic compatibility!

💖 Compatibility Score based on numerological harmony
🌟 Personality Matching through life path numbers
🔥 Relationship Insights powered by ancient wisdom
⚡ Celebrity Matches to see who shares your vibe

Enter your details to discover your ideal love connections and relationship potential.`;
        break;

      case 'trustAssessment':
        shouldShow = !state.hasSeenTrustAssessmentIntro;
        updateKey = 'hasSeenTrustAssessmentIntro';
        title = '🛡️ Trust Assessment';
        icon = 'shield-outline';
        iconColor = '#667eea';
        message = `Analyze relationship trust through numerology!

📊 4-Step Process:
1. Enter your information
2. Select relationship type (romantic, friend, family, business)
3. Add your partner's details
4. Get detailed trust compatibility analysis

Discover trust scores, relationship strengths, and potential challenges based on numerological compatibility.`;
        break;
    }

    if (shouldShow) {
      return {
        shouldShow: true,
        alertConfig: {
          type: 'info' as const,
          title,
          message,
          icon,
          iconColor,
          buttons: [
            {
              text: "Got it!",
              style: 'primary' as const,
              onPress: async () => {
                await this.updateOnboardingState(userId, { [updateKey]: true });
              },
            },
          ],
        },
      };
    }

    return { shouldShow: false };
  }

  // Reset onboarding for testing (development only)
  static async resetOnboarding(userId: string): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }

  // Check if user is new (hasn't seen any introductions)
  static async isNewUser(userId: string): Promise<boolean> {
    const state = await this.getOnboardingState(userId);
    return !state.hasSeenWelcome && !state.hasSeenNumerologyIntro &&
           !state.hasSeenLoveMatchIntro && !state.hasSeenTrustAssessmentIntro;
  }
}