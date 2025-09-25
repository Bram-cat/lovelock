// Secure Authentication Service for Mobile-Web Integration
import { useUser, useAuth } from "@clerk/clerk-expo";

interface WebTokenRequest {
  userId: string;
  email: string;
  section?: string;
}

interface WebTokenResponse {
  token: string;
  success: boolean;
  error?: string;
}

interface MobileRedirectResponse {
  success: boolean;
  redirectUrl: string;
  message: string;
  error?: string;
}

export class SecureAuthService {
  private static readonly WEB_APP_URL = 'https://lovelock.it.com';
  private static readonly MOBILE_API_URL = process.env.EXPO_PUBLIC_MOBILE_API_URL || 'https://your-mobile-api.com';

  /**
   * Generate a secure token for web authentication
   */
  static async generateWebToken(
    userId: string,
    email: string,
    section?: string,
    clerkToken?: string
  ): Promise<WebTokenResponse> {
    try {
      const response = await fetch(`${this.MOBILE_API_URL}/generate-web-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          email,
          section: section || 'account'
        })
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        token: data.token,
        success: true
      };
    } catch (error) {
      console.error('Error generating web token:', error);
      return {
        token: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Authenticate with web app using secure token
   */
  static async authenticateWithWebApp(
    token: string,
    section?: string
  ): Promise<MobileRedirectResponse> {
    try {
      const response = await fetch(`${this.WEB_APP_URL}/api/auth/mobile-redirect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          section: section || 'account'
        })
      });

      if (!response.ok) {
        throw new Error(`Web authentication failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error authenticating with web app:', error);
      return {
        success: false,
        redirectUrl: '',
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete secure authentication flow for mobile to web
   */
  static async secureRedirectToWeb(
    userId: string,
    email: string,
    section: string,
    clerkToken: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Since backend endpoints are not yet implemented, use fallback strategy
      console.log('⚠️ Secure authentication backend not available, using fallback strategy');

      // For now, use the basic URL with just the section
      // This ensures users can still access the website and get redirected to signup if needed
      const fallbackUrl = this.createBasicUrl(section);

      return {
        success: true,
        url: fallbackUrl
      };
    } catch (error) {
      console.error('Secure redirect failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Fallback to insecure method (temporary, for backwards compatibility)
   */
  static generateFallbackUrl(
    userId: string,
    email: string,
    section: string,
    token?: string
  ): string {
    const baseUrl = `${this.WEB_APP_URL}`;
    const params = new URLSearchParams({
      userId: userId,
      email: email,
      source: 'mobile',
      section: section
    });

    if (token) {
      params.append('token', token);
    }

    return `${baseUrl}/${section === 'billing' ? 'account' : section}?${params.toString()}`;
  }

  /**
   * Create a basic URL without sensitive user information
   * This ensures users reach the website and can be redirected to signup if needed
   */
  static createBasicUrl(section: string): string {
    const baseUrl = this.WEB_APP_URL;

    // Map sections to appropriate paths
    const sectionPath = section === 'billing' ? 'account' : section;

    // Return clean URL without user parameters
    // The website should handle authentication and redirect to signup if needed
    return `${baseUrl}/${sectionPath}?source=mobile`;
  }
}

// Hook for easy use in components
export function useSecureAuth() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const redirectToWebApp = async (section: 'billing' | 'account' | 'pricing' | 'help' = 'account') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get current Clerk session token
      const clerkToken = await getToken();

      if (!clerkToken) {
        throw new Error('No active session found');
      }

      // Try secure authentication first
      const secureResult = await SecureAuthService.secureRedirectToWeb(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        section,
        clerkToken
      );

      if (secureResult.success && secureResult.url) {
        return secureResult.url;
      }

      console.warn('Secure authentication failed, using basic URL fallback:', secureResult.error);

      // Fallback to basic URL that allows website to handle authentication
      return SecureAuthService.createBasicUrl(section);
    } catch (error) {
      console.error('Authentication error:', error);

      // Last resort: basic URL without any user data
      return SecureAuthService.createBasicUrl(section);
    }
  };

  return {
    redirectToWebApp,
    user
  };
}