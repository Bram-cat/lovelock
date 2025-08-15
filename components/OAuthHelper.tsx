import { useOAuth } from '@clerk/clerk-expo';
import { Alert } from 'react-native';

export const useGoogleOAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleAuth = async (
    setActive: any,
    router: any,
    setLoading: (loading: boolean) => void,
    isSignUp: boolean = false
  ) => {
    setLoading(true);
    
    try {
      console.log(`🚀 Starting Google OAuth ${isSignUp ? 'sign-up' : 'sign-in'} flow...`);
      
      // Check if Clerk is properly configured
      const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (!clerkKey || clerkKey.includes('your_clerk_publishable_key_here')) {
        Alert.alert(
          'Configuration Error',
          'Clerk is not properly configured. Please set up your EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the .env file.'
        );
        return;
      }

      const result = await startOAuthFlow();
      
      console.log('📋 Google OAuth result:', {
        createdSessionId: result.createdSessionId ? 'YES' : 'NO',
        signIn: result.signIn ? 'YES' : 'NO',
        signUp: result.signUp ? 'YES' : 'NO',
        setActive: result.setActive ? 'YES' : 'NO'
      });

      // Case 1: OAuth completed successfully with a session
      if (result.createdSessionId) {
        console.log('✅ OAuth completed successfully, setting active session');
        await setActive({ session: result.createdSessionId });
        console.log('✅ Session activated, redirecting to home');
        router.replace('/(tabs)');
        return true;
      }

      // Case 2: Need to complete sign up for new user
      if (result.signUp) {
        console.log('🔄 Completing sign up for new user...');
        try {
          // First, try to create the sign up without additional info
          let completedSignUp = await result.signUp.create({});
          
          console.log('Initial sign up result:', completedSignUp.status);
          
          // If missing requirements, try to update with minimal info
          if (completedSignUp.status === 'missing_requirements') {
            console.log('📝 Adding required profile information...');
            
            // Try to update with first name from email or set a default
            const emailPrefix = result.signUp.emailAddress?.split('@')[0] || 'User';
            
            try {
              await result.signUp.update({
                firstName: emailPrefix,
              });
              
              // Try to create again after update
              completedSignUp = await result.signUp.create({});
              console.log('Sign up after update:', completedSignUp.status);
            } catch (updateError: any) {
              console.warn('Failed to update profile, continuing anyway:', updateError);
            }
          }
          
          if (completedSignUp.status === 'complete') {
            await setActive({ session: completedSignUp.createdSessionId });
            console.log('✅ Google sign up completed successfully');
            router.replace('/(tabs)');
            return true;
          } else {
            console.log('❌ Sign up still incomplete:', completedSignUp.status);
            // Try to proceed anyway - sometimes Clerk completes in background
            if (completedSignUp.createdSessionId) {
              await setActive({ session: completedSignUp.createdSessionId });
              console.log('✅ Using session despite incomplete status');
              router.replace('/(tabs)');
              return true;
            }
            Alert.alert('Error', 'Unable to complete Google sign up. Please try manual sign up.');
            return false;
          }
        } catch (signUpError: any) {
          console.error('❌ Sign up completion error:', signUpError);
          Alert.alert('Error', 'Failed to complete Google sign up. Please try manual sign up.');
          return false;
        }
      }

      // Case 3: Need to complete sign in for existing user
      if (result.signIn) {
        console.log('🔄 Completing sign in for existing user...');
        try {
          // Try to create the sign in directly first
          let completedSignIn = await result.signIn.create({});
          
          console.log('Initial sign in result:', completedSignIn.status);
          
          // If that doesn't work, try with the first available strategy
          if (completedSignIn.status !== 'complete') {
            const firstFactor = result.signIn.supportedFirstFactors?.[0];
            if (firstFactor && 'strategy' in firstFactor) {
              completedSignIn = await result.signIn.create({
                strategy: firstFactor.strategy as any,
              });
              console.log('Sign in with strategy result:', completedSignIn.status);
            }
          }
          
          if (completedSignIn.status === 'complete') {
            await setActive({ session: completedSignIn.createdSessionId });
            console.log('✅ Google sign in completed successfully');
            router.replace('/(tabs)');
            return true;
          } else {
            console.log('❌ Sign in still incomplete:', completedSignIn.status);
            // Try to proceed anyway if we have a session
            if (completedSignIn.createdSessionId) {
              await setActive({ session: completedSignIn.createdSessionId });
              console.log('✅ Using session despite incomplete status');
              router.replace('/(tabs)');
              return true;
            }
            Alert.alert('Error', 'Unable to complete Google sign in. Please try manual sign in.');
            return false;
          }
        } catch (signInError: any) {
          console.error('❌ Sign in completion error:', signInError);
          Alert.alert('Error', 'Failed to complete Google sign in. Please try manual sign in.');
          return false;
        }
      }

      // Case 4: Handle redirects between sign up and sign in
      if (isSignUp && result.signIn) {
        console.log('👤 Existing user detected during sign up, redirecting to sign in');
        Alert.alert('Account Exists', 'This Google account is already registered. Redirecting to sign in.');
        router.push('/auth/sign-in');
        return false;
      }

      if (!isSignUp && result.signUp) {
        console.log('🆕 New user detected during sign in, redirecting to sign up');
        Alert.alert('New User', 'This Google account is not registered. Redirecting to sign up.');
        router.push('/auth/sign-up');
        return false;
      }

      // Case 5: OAuth was cancelled or failed
      console.log('❌ OAuth flow cancelled or failed');
      Alert.alert('Cancelled', 'Google authentication was cancelled.');
      return false;

    } catch (error: any) {
      console.error('❌ Google OAuth error:', error);
      
      // Handle specific error cases
      if (error.code === 'oauth_access_denied') {
        Alert.alert('Access Denied', 'Google authentication was denied. Please grant permission to continue.');
      } else if (error.code === 'oauth_cancelled') {
        Alert.alert('Cancelled', 'Google authentication was cancelled.');
      } else if (error.message?.includes('network')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else if (error.message?.includes('configuration')) {
        Alert.alert('Configuration Error', 'Google OAuth is not properly configured. Please contact support.');
      } else {
        const errorMessage = error.errors?.[0]?.message || error.message || 'Google authentication failed. Please try again.';
        Alert.alert('Authentication Error', errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleAuth };
};
