import * as React from "react";
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  StatusBar,
  ScrollView
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const { height } = Dimensions.get("window");

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  if (!error || !error.errors || error.errors.length === 0) {
    return "An unexpected error occurred. Please try again.";
  }

  const clerkError = error.errors[0];
  
  switch (clerkError.code) {
    case "form_identifier_exists":
      return "An account with this email already exists. Please sign in instead.";
    case "form_username_invalid_length":
      return "Username must be between 3 and 20 characters.";
    case "form_username_invalid_character":
      return "Username can only contain letters, numbers, and underscores.";
    case "form_param_format_invalid":
      if (clerkError.meta?.paramName === "email_address") {
        return "Please enter a valid email address.";
      }
      return "Please check your input format.";
    case "form_password_length_too_short":
      return "Password must be at least 8 characters long.";
    case "form_password_pwned":
      return "This password has been found in a data breach. Please choose a different password.";
    case "form_password_validation_failed":
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
    case "verification_failed":
      return "Invalid verification code. Please check your email and try again.";
    case "verification_expired":
      return "Verification code has expired. Please request a new one.";
    case "too_many_requests":
      return "Too many attempts. Please wait a moment before trying again.";
    case "email_address_not_verified":
      return "Please verify your email address to complete sign up.";
    default:
      return clerkError.longMessage || clerkError.message || "An error occurred. Please try again.";
  }
};

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Clear error when user starts typing
  const handleEmailChange = (text) => {
    setEmailAddress(text);
    if (error) setError("");
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (error) setError("");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) setError("");
  };

  const handleCodeChange = (text) => {
    setCode(text);
    if (error) setError("");
  };

  // Validate form inputs
  const validateForm = () => {
    if (!emailAddress.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    
    if (!emailAddress.includes('@')) {
      setError("Please enter a valid email address.");
      return false;
    }
    
    if (!username.trim()) {
      setError("Please enter a username.");
      return false;
    }
    
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    
    if (!password.trim()) {
      setError("Please enter a password.");
      return false;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    
    return true;
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        username: username.trim(),
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display verification form
      setPendingVerification(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Sign-up error:", JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Verification incomplete. Please try again.");
        console.log("Sign-up incomplete:", JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Verification error:", JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const onResendPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Success", "Verification code sent to your email.");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail" size={60} color={Colors.text.white} />
                </View>
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                  We've sent a verification code to{"\n"}
                  <Text style={styles.emailText}>{emailAddress}</Text>
                </Text>
              </View>

              {/* Verification Form */}
              <View style={styles.form}>
                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ff4757" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Verification Code Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Enter verification code"
                    placeholderTextColor={Colors.text.secondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={handleCodeChange}
                    editable={!isLoading}
                  />
                </View>

                {/* Verify Button */}
                <TouchableOpacity 
                  style={[styles.signUpButton, isLoading && styles.disabledButton]} 
                  onPress={onVerifyPress}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#ccc', '#999'] : [Colors.text.white, '#f0f0f0']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend Code */}
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={onResendPress}
                  disabled={isLoading}
                >
                  <Text style={styles.resendText}>Didn&apos;t receive the code? Resend</Text>
                </TouchableOpacity>
              </View>

              {/* Back to Sign Up */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setPendingVerification(false)}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.text.white} />
                <Text style={styles.backText}>Back to Sign Up</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="heart" size={60} color={Colors.text.white} />
                </View>
                <Text style={styles.title}>Join Lovelock</Text>
                <Text style={styles.subtitle}>Create your account to start your love journey</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ff4757" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={emailAddress}
                    placeholder="Email address"
                    placeholderTextColor={Colors.text.secondary}
                    onChangeText={handleEmailChange}
                    editable={!isLoading}
                  />
                </View>

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={username}
                    placeholder="Username"
                    placeholderTextColor={Colors.text.secondary}
                    onChangeText={handleUsernameChange}
                    editable={!isLoading}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor={Colors.text.secondary}
                    secureTextEntry={!showPassword}
                    onChangeText={handlePasswordChange}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={Colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Requirements */}
                <Text style={styles.passwordHint}>
                  Password must be at least 8 characters long
                </Text>

                {/* Sign Up Button */}
                <TouchableOpacity 
                  style={[styles.signUpButton, isLoading && styles.disabledButton]} 
                  onPress={onSignUpPress}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#ccc', '#999'] : [Colors.text.white, '#f0f0f0']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/sign-in" style={styles.link}>
                  <Text style={styles.linkText}>Sign In</Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: height - 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.text.white,
  },
  form: {
    marginBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4757',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4757',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  passwordHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 20,
    marginTop: -8,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backText: {
    color: Colors.text.white,
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  link: {
    marginLeft: 8,
  },
  linkText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
