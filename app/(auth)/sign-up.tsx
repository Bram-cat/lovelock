import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSignUp, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type SignUpStep = 'create' | 'verification';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // Production-safe debug function
  const debugSignUpState = () => {
    // Debug logging disabled for production
  };

  // Production-safe logging function
  const debugLog = (message: string, ...args: any[]) => {
    // Logging disabled for production
  };

  // Form state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>('create');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showAccountIssue, setShowAccountIssue] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if user is already signed in
  useEffect(() => {
    if (isSignedIn && user) {
      debugLog('✅ User already signed in, redirecting to app');
      router.replace('/(tabs)');
    }
  }, [isSignedIn, user, router]);

  // Create account and prepare email verification
  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) {
      debugLog('⚠️ Clerk not loaded yet');
      return;
    }

    if (!emailAddress || !password || !firstName) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    debugLog('🔄 Starting sign-up process...');

    try {
      // Create the sign-up - using minimal required fields first
      debugLog('🔄 Creating sign-up with email:', emailAddress);
      // Generate a unique username from email (remove special characters)
      const baseUsername = emailAddress.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const username = baseUsername + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      const result = await signUp.create({
        emailAddress,
        password,
        username, // Add unique username
      });

      debugLog('✅ Sign-up created:', result.status);
      debugLog('📋 Missing fields after creation:', result.missingFields);
      debugLog('📋 Unverified fields after creation:', result.unverifiedFields);
      
      debugSignUpState();

      // Update user profile with name information if provided
      if (firstName || lastName) {
        try {
          debugLog('🔄 Updating user profile with name...');
          await signUp.update({
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          });
          debugLog('✅ User profile updated with name');
        } catch (updateError) {
          debugLog('⚠️ Could not update name, continuing without it:', updateError);
        }
      }

      // Prepare email address verification with retry logic
      debugLog('🔄 Preparing email verification...');
      try {
        await signUp.prepareEmailAddressVerification({ 
          strategy: 'email_code'
        });
      } catch (emailError) {
        debugLog('🔄 Retrying email verification...');
        // Retry once more with shorter delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      
      debugLog('✅ Email verification prepared');
      debugLog('📧 Check your email for the verification code');
      setCurrentStep('verification');
      
    } catch (err: any) {
      console.error('🔴 Sign-up error:', err);
      console.error('🔴 Error details:', JSON.stringify(err, null, 2));
      
      // Handle username conflicts specifically
      if (err.errors?.[0]?.code === 'form_username_exists') {
        // Try again with a different username
        try {
          const newUsername = emailAddress.split('@')[0] + Date.now().toString().slice(-4);
          debugLog('🔄 Retrying with new username:', newUsername);
          
          const retryResult = await signUp.create({
            emailAddress,
            password,
            username: newUsername,
          });
          
          debugLog('✅ Retry sign-up created:', retryResult.status);
          debugSignUpState();
          
          // Continue with name update if needed
          if (firstName || lastName) {
            try {
              await signUp.update({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
              });
            } catch (updateError) {
              debugLog('⚠️ Name update failed on retry, continuing...');
            }
          }
          
          // Prepare email verification
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setCurrentStep('verification');
          return;
        } catch (retryError) {
          console.error('🔴 Retry failed:', retryError);
          setErrorMessage('Username conflict - please try a different email or contact support');
          return;
        }
      }
      
      const errorMsg = err.errors?.[0]?.message || err.message || 'Sign up failed';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, emailAddress, password, firstName, lastName, debugSignUpState]);

  // Resend verification code
  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setCodeError('');

    try {
      debugLog('🔄 Resending verification code...');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      debugLog('✅ Verification code resent');
      
      // Set cooldown to prevent spam
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert(
        'Code Sent', 
        'A new verification code has been sent to your email. Please check your inbox and spam folder.\n\n💡 For testing: Use email+clerk_test@domain.com with code 424242'
      );
    } catch (err: any) {
      console.error('🔴 Resend error:', err);
      const errorMsg = err.errors?.[0]?.message || 'Failed to resend code. Please try again.';
      setCodeError(errorMsg);
    } finally {
      setResendLoading(false);
    }
  }, [isLoaded, signUp, resendCooldown]);

  // Verify email code
  const handleVerifyEmail = useCallback(async () => {
    if (!isLoaded || !signUp) {
      debugLog('⚠️ Clerk not loaded yet');
      return;
    }

    if (!code || code.length !== 6) {
      setCodeError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setCodeError('');
    debugLog('🔄 Verifying email with code:', code);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      debugLog('✅ Email verification result:', result.status);
      
      debugSignUpState();

      if (result.status === 'complete') {
        debugLog('🔄 Setting active session...');
        await setActive({ session: result.createdSessionId });
        
        debugLog('✅ Session set, navigating to app');
        router.replace('/(tabs)');
      } else {
        debugLog('⚠️ Verification incomplete:', result.status);
        debugLog('📋 Missing fields after verification:', signUp.missingFields);
        debugLog('📋 Unverified fields:', signUp.unverifiedFields);
        
        // Check if we can provide missing fields
        if (signUp.missingFields && signUp.missingFields.length > 0) {
          debugLog('🔄 Attempting to provide missing fields...');
          try {
            const updateData: any = {};
            
            // Handle common missing fields
            if (signUp.missingFields.includes('first_name')) {
              updateData.firstName = firstName || 'User';
            }
            if (signUp.missingFields.includes('last_name')) {
              updateData.lastName = lastName || '';
            }
            
            debugLog('🔄 Updating with missing data:', updateData);
            
            const updatedResult = await signUp.update(updateData);
            debugLog('✅ Updated result status:', updatedResult.status);
            
            if (updatedResult.status === 'complete') {
              if (updatedResult.createdSessionId) {
                await setActive({ session: updatedResult.createdSessionId });
                debugLog('✅ Session set after providing missing fields');
                router.replace('/(tabs)');
                return;
              }
            } else {
              debugLog('📋 Still missing fields after update:', updatedResult.missingFields);
              setCodeError(`Account setup incomplete. Missing: ${updatedResult.missingFields?.join(', ') || 'unknown fields'}`);
            }
          } catch (updateError) {
            console.error('🔴 Error providing missing fields:', updateError);
            setCodeError('Account setup failed. Please try again or contact support.');
          }
        } else {
          setCodeError('Verification failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('🔴 Verification error:', err);
      console.error('🔴 Error details:', JSON.stringify(err, null, 2));
      
      // Handle already verified error specifically
      if (err.errors?.[0]?.code === 'verification_already_verified') {
        debugLog('✅ Email already verified, attempting to set session');
        try {
          // Try to complete the sign-up and set session
          if (signUp.createdSessionId) {
            await setActive({ session: signUp.createdSessionId });
            debugLog('✅ Session set, navigating to app');
            // Small delay to ensure session is set
            setTimeout(() => router.replace('/(tabs)'), 100);
          } else {
            // Check if signUp is complete and create session
            debugLog('⚠️ No session found, checking sign-up status:', signUp.status);
            debugLog('📋 Current missing fields:', signUp.missingFields);
            debugLog('📋 Current unverified fields:', signUp.unverifiedFields);
            if (signUp.status === 'complete') {
              debugLog('✅ Sign-up complete, navigating to app');
              setTimeout(() => router.replace('/(tabs)'), 100);
            } else if (signUp.status === 'missing_requirements') {
              debugLog('⚠️ Sign-up has missing requirements, attempting to complete...');
              try {
                // Determine what fields we need to update
                const updateData: any = {};
                
                if (signUp.missingFields?.includes('first_name') || !signUp.firstName) {
                  updateData.firstName = firstName || 'User';
                }
                if (signUp.missingFields?.includes('last_name') || !signUp.lastName) {
                  updateData.lastName = lastName || '';
                }
                
                // Add any other common missing fields
                if (signUp.missingFields?.includes('username') && !signUp.username) {
                  // Try username from email prefix, with fallback for uniqueness
                  const baseUsername = emailAddress.split('@')[0];
                  updateData.username = baseUsername + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                }
                
                debugLog('🔄 Updating sign-up with fields:', Object.keys(updateData));
                debugLog('🔄 Update data:', updateData);
                
                // Try to update sign-up with any missing info
                const updatedSignUp = await signUp.update(updateData);
                debugLog('✅ Updated sign-up, new status:', updatedSignUp.status);
                debugLog('📋 Remaining missing fields:', updatedSignUp.missingFields);
                
                // If still missing requirements, try to complete the sign-up
                if (updatedSignUp.status === 'complete') {
                  if (updatedSignUp.createdSessionId) {
                    await setActive({ session: updatedSignUp.createdSessionId });
                    debugLog('✅ Session set after update, navigating to app');
                    setTimeout(() => router.replace('/(tabs)'), 100);
                  } else {
                    debugLog('✅ Sign-up complete but no session, navigating to app anyway');
                    setTimeout(() => router.replace('/(tabs)'), 100);
                  }
                } else {
                  debugLog('⚠️ Sign-up still incomplete after update, showing account issue...');
                  setCodeError('Account setup incomplete. Your email is verified but there was an issue completing your account.');
                  setShowAccountIssue(true);
                }
              } catch (updateError) {
                console.error('🔴 Update error:', updateError);
                setCodeError('Account setup failed. Your email is verified but we couldn\'t complete the setup.');
                setShowAccountIssue(true);
              }
            } else {
              // Force reload the page to check authentication state
              debugLog('⚠️ Reloading to check auth state...');
              setTimeout(() => router.replace('/'), 100);
            }
          }
        } catch (sessionError) {
          console.error('🔴 Session error:', sessionError);
          setTimeout(() => router.replace('/'), 100);
        }
        return;
      }

      const errorMsg = err.errors?.[0]?.message || err.message || 'Verification failed';

      // Handle invalid verification strategy - user likely doesn't exist
      if (errorMsg.includes('Invalid verification strategy') ||
          err.errors?.[0]?.code === 'verification_failed') {
        setCodeError('Account doesn\'t exist');
      } else {
        setCodeError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, setActive, code, router, debugSignUpState, emailAddress, firstName, lastName]);


  // Email verification step
  if (currentStep === 'verification') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentStep('create')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="mail-outline" size={64} color="#E91E63" />
              </View>
              <Text style={styles.appName}>Verify your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to {emailAddress}
              </Text>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryText}>
                  📧 Check your inbox and spam folder{'\n'}
                  ⏱️ Emails may take 2-5 minutes to arrive{'\n'}
                  🔄 Use the resend button if needed
                </Text>
              </View>
              {emailAddress.includes('+clerk_test') && (
                <View style={styles.testHelper}>
                  <Text style={styles.testHelperText}>
                    🧪 Test Mode: Use code 424242
                  </Text>
                </View>
              )}
            </View>

            {/* Verification Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#8E8E93"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    if (codeError) setCodeError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyEmail}
                  autoFocus
                />
              </View>

              {/* Error Message */}
              {codeError && (
                <View style={[styles.errorContainer, codeError.startsWith('✅') && styles.successContainer]}>
                  <Text style={[styles.errorText, codeError.startsWith('✅') && styles.successText]}>
                    {codeError}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.signUpButton, (isLoading || code.length !== 6) && styles.buttonDisabled]}
                onPress={handleVerifyEmail}
                disabled={isLoading || code.length !== 6}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Account Issue Help */}
            {showAccountIssue && (
              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <TouchableOpacity 
                  style={styles.helpButton}
                  onPress={() => {
                    setCurrentStep('create');
                    setCode('');
                    setCodeError('');
                    setShowAccountIssue(false);
                  }}
                >
                  <Text style={styles.helpButtonText}>Start Over</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.helpButton, styles.secondaryHelpButton]}
                  onPress={() => router.replace('/(auth)/sign-in')}
                >
                  <Text style={[styles.helpButtonText, styles.secondaryHelpButtonText]}>Try Sign In Instead</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resend Code */}
            {!showAccountIssue && (
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn&apos;t receive a code? Check your spam folder first.
                </Text>
                <TouchableOpacity 
                  onPress={handleResendCode}
                  disabled={resendLoading || resendCooldown > 0}
                  style={[
                    styles.resendButton,
                    (resendLoading || resendCooldown > 0) && styles.buttonDisabled
                  ]}
                >
                  <Text style={[
                    styles.resendLink,
                    (resendLoading || resendCooldown > 0) && styles.disabledText
                  ]}>
                    {resendLoading 
                      ? 'Sending...' 
                      : resendCooldown > 0 
                        ? `Resend code (${resendCooldown}s)` 
                        : 'Resend code'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign-up form step
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
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#8E8E93"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="words"
                autoComplete="given-name"
                returnKeyType="next"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="#8E8E93"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="words"
                autoComplete="family-name"
                returnKeyType="next"
              />
            </View>

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
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
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
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, (isLoading || !emailAddress || !password || !firstName) && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading || !emailAddress || !password || !firstName}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Text>
            </TouchableOpacity>
          </View>


          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Log in</Text>
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
  backButton: {
    position: 'absolute',
    top: 48,
    left: 32,
    zIndex: 1,
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
  signUpButton: {
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
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  signInLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
  },
  resendLink: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledText: {
    color: '#666666',
  },
  testHelper: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  testHelperText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  deliveryInfo: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  deliveryText: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: '#34C759',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  successText: {
    color: '#FFFFFF',
  },
  helpContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  helpTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secondaryHelpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryHelpButtonText: {
    color: '#8E8E93',
  },
});