import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useSignIn, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSecureAuth } from '../../services/SecureAuthService';

type SignInStep = 'identifier' | 'verification';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, user } = useUser();
  const { redirectToWebApp } = useSecureAuth();
  const router = useRouter();
  
  // Form state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignInStep>('identifier');
  const [errorMessage, setErrorMessage] = useState('');
  const [codeError, setCodeError] = useState('');

  // Redirect if user is already signed in
  useEffect(() => {
    if (isSignedIn && user) {
      console.log('✅ User already signed in, redirecting to app');
      router.replace('/(tabs)');
    }
  }, [isSignedIn, user, router]);

  // Sign in with email and password
  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) {
      console.log('⚠️ Clerk not loaded yet');
      return;
    }

    if (!emailAddress || !password) {
      setErrorMessage('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    console.log('🔄 Starting sign-in process...');

    try {
      console.log('🔄 Attempting sign-in with email:', emailAddress);
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      console.log('✅ Sign-in result:', result.status);

      if (result.status === 'complete') {
        console.log('🔄 Setting active session...');
        await setActive({ session: result.createdSessionId });
        
        console.log('✅ Session set, navigating to app');
        router.replace('/(tabs)');
      } else if (result.status === 'needs_first_factor') {
        // Check if email verification is needed
        console.log('🔄 First factor needed:', result.supportedFirstFactors);
        
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          console.log('🔄 Preparing email verification...');
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setCurrentStep('verification');
        } else {
          setErrorMessage('Email verification not supported');
        }
      } else {
        console.log('⚠️ Unexpected sign-in status:', result.status);
        setErrorMessage('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error('🔴 Sign-in error:', err);
      console.error('🔴 Error details:', JSON.stringify(err, null, 2));

      const errorMsg = err.errors?.[0]?.message || err.message || 'Sign in failed';

      // Handle invalid verification strategy - user likely doesn't exist
      if (errorMsg.includes('Invalid verification strategy') ||
          err.errors?.[0]?.code === 'verification_failed') {
        setErrorMessage('Account doesn\'t exist');
      }
      // Handle account not found - might be incomplete sign-up
      else if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        setErrorMessage('Account doesn\'t exist');
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, emailAddress, password, router]);

  // Verify email code for sign-in
  const handleVerifySignIn = useCallback(async () => {
    if (!isLoaded || !signIn) {
      console.log('⚠️ Clerk not loaded yet');
      return;
    }

    if (!code || code.length !== 6) {
      setCodeError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setCodeError('');
    console.log('🔄 Verifying sign-in with code:', code);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      console.log('✅ Sign-in verification result:', result.status);

      if (result.status === 'complete') {
        console.log('🔄 Setting active session...');
        await setActive({ session: result.createdSessionId });
        
        console.log('✅ Session set, navigating to app');
        router.replace('/(tabs)');
      } else {
        console.log('⚠️ Verification incomplete:', result.status);
        setCodeError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('🔴 Verification error:', err);
      console.error('🔴 Error details:', JSON.stringify(err, null, 2));

      // Handle invalid verification strategy - user likely doesn't exist
      if (err.errors?.[0]?.message?.includes('Invalid verification strategy') ||
          err.errors?.[0]?.code === 'verification_failed' ||
          err.message?.includes('Invalid verification strategy')) {
        setCodeError('Account doesn\'t exist');
        return;
      }

      // Handle already verified error specifically
      if (err.errors?.[0]?.code === 'verification_already_verified') {
        console.log('✅ Already verified, attempting to set session');
        try {
          // Try to set session if available
          if (signIn.createdSessionId) {
            await setActive({ session: signIn.createdSessionId });
            console.log('✅ Session set, navigating to app');
            // Small delay to ensure session is set
            setTimeout(() => router.replace('/(tabs)'), 100);
          } else {
            // If no session, try to reload user state
            console.log('⚠️ No session found, reloading...');
            setTimeout(() => router.replace('/'), 100);
          }
        } catch (sessionError) {
          console.error('🔴 Session error:', sessionError);
          setTimeout(() => router.replace('/'), 100);
        }
        return;
      }
      
      const errorMsg = err.errors?.[0]?.message || err.message || 'Verification failed';
      setCodeError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, code, router]);

  // Handle forgot password redirect
  const handleForgotPassword = useCallback(async () => {
    try {
      // Redirect to website's forgot password page
      const forgotPasswordUrl = await redirectToWebApp('forgot-password');

      const canOpen = await Linking.canOpenURL(forgotPasswordUrl);
      if (canOpen) {
        await Linking.openURL(forgotPasswordUrl);
      } else {
        // Fallback to main website
        await Linking.openURL('https://lovelock.it.com');
      }
    } catch (error) {
      console.error('Error opening forgot password page:', error);
      // Fallback to main website
      try {
        await Linking.openURL('https://lovelock.it.com');
      } catch (fallbackError) {
        console.error('Error opening fallback URL:', fallbackError);
      }
    }
  }, [redirectToWebApp]);



  // Email verification step
  if (currentStep === 'verification') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="mail-outline" size={64} color="#E91E63" />
              </View>
              <Text style={styles.appName}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to {emailAddress}
              </Text>
            </View>

            {/* Verification Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter verification code"
                  placeholderTextColor="#8E8E93"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    if (codeError) setCodeError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifySignIn}
                  autoFocus
                />
              </View>

              {/* Error Message */}
              {codeError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{codeError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.signInButton, (isLoading || code.length !== 6) && styles.buttonDisabled]}
                onPress={handleVerifySignIn}
                disabled={isLoading || code.length !== 6}
              >
                <Text style={styles.signInButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to Sign In */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentStep('identifier')}
            >
              <Text style={styles.backButtonText}>Back to sign in</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign-in form step
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header with Heart Icon */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={64} color="#E91E63" />
            </View>
            <Text style={styles.appName}>Lovelock</Text>
            <Text style={styles.subtitle}>Welcome back</Text>
          </View>

          {/* Sign In Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                value={emailAddress}
                onChangeText={(text) => {
                  setEmailAddress(text);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, (isLoading || !emailAddress || !password) && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading || !emailAddress || !password}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>


          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  dividerText: {
    color: '#8E8E93',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  signUpLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  // Shadcn-style error container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});