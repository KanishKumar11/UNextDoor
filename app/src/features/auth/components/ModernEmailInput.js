import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";

// Import modern components
import ModernAuthLayout from "../../../shared/components/ModernAuthLayout";
import ModernInput from "../../../shared/components/ModernInput";
import ModernButton from "../../../shared/components/ModernButton";
import ModernDivider from "../../../shared/components/ModernDivider";
import ModernSocialButton from "../../../shared/components/ModernSocialButton";
import ModernErrorMessage from "../../../shared/components/ModernErrorMessage";

// Import utilities
import { emailSchema } from "../../../shared/utils/validationUtils";
import { handleApiError } from "../../../shared/utils/errorUtils";
import modernTheme from "../../../shared/styles/modernTheme";
import {
  initializeGoogleSignIn,
  signInWithGoogle
} from "../../../services/googleAuthService";
import appleAuthService from "../../../services/appleAuthService";

/**
 * ModernEmailInput component
 * A modern email input screen for authentication
 *
 * @param {Object} props - Component props
 * @param {Function} props.onContinue - Function to call when email is submitted
 */
const ModernEmailInput = ({ onContinue }) => {
  const { checkEmail, sendOTP, googleAuth, appleAuth, isLoading } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [backgroundError, setBackgroundError] = useState(null);
  const [hasTransitioned, setHasTransitioned] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await initializeGoogleSignIn();
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    };

    initGoogle();
  }, []);

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      setBackgroundError(null);
      setHasTransitioned(false);

      // Validate email format before proceeding
      if (
        !data.email ||
        !data.email.includes("@") ||
        !data.email.includes(".")
      ) {
        setServerError("Please enter a valid email address");
        return;
      }

      // Immediately transition to OTP screen first
      // This provides a better user experience by not making the user wait
      onContinue(data.email, false);
      setHasTransitioned(true);

      // Then check if email exists and send OTP in the background
      // We don't need to wait for these to complete before showing the OTP screen
      checkEmail(data.email)
        .then((checkResult) => {
          if (checkResult.error) {
            console.error("Email check error:", checkResult.error);
            setBackgroundError(checkResult.error);
            return;
          }

          // Send OTP with retry mechanism
          const sendOTPWithRetry = async (retryCount = 0, maxRetries = 2) => {
            try {
              const otpResult = await sendOTP(data.email);

              if (otpResult.error) {
                console.error("OTP send error:", otpResult.error);
                setBackgroundError(otpResult.error);
              }
            } catch (error) {
              console.error("Error sending OTP:", error);

              // Retry on network errors
              if (
                retryCount < maxRetries &&
                (error.message.includes("Network") ||
                  error.message.includes("timeout") ||
                  error.message.includes("connection"))
              ) {
                console.log(
                  `Retrying OTP send (${retryCount + 1}/${maxRetries})...`
                );

                // Wait before retrying
                setTimeout(() => {
                  sendOTPWithRetry(retryCount + 1, maxRetries);
                }, 2000);
              } else {
                setBackgroundError(
                  "Failed to send verification code. You may need to go back and try again."
                );
              }
            }
          };

          // Start the OTP sending process with retry capability
          sendOTPWithRetry();
        })
        .catch((error) => {
          console.error("Error checking email:", error);
          setBackgroundError(
            "Error checking email. You may need to go back and try again."
          );
        });
    } catch (error) {
      handleApiError(error, setServerError);
    }
  };

  return (
    <ModernAuthLayout title="Welcome" subtitle="Enter your email to continue">
      <View style={styles.container}>
        {/* Error message */}
        <ModernErrorMessage error={serverError} />

        {/* Email input */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <ModernInput
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your email"
              error={errors.email?.message}
              isRequired
              isDisabled={isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              iconName="mail-outline"
              style={styles.input}
            />
          )}
        />

        {/* Continue button */}
        <ModernButton
          text={
            isLoading ? "Sending verification code..." : "Continue with Email"
          }
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          iconName="arrow-forward"
          iconPosition="right"
          style={styles.button}
        />

        {/* Or divider */}
        <ModernDivider text="OR" />

        {/* Platform-specific social login buttons */}
        {Platform.OS === 'android' && (
          <ModernSocialButton
            text="Continue with Google"
            provider="google"
            onPress={async () => {
              try {
                setServerError(null);
                console.log('🔄 Starting Google Sign-In process...');

                // Sign in with Google
                const googleResult = await signInWithGoogle();
                console.log('📱 Google Sign-In result:', googleResult);

                if (googleResult && googleResult.idToken) {
                  console.log('🔑 Google ID token received, authenticating with backend...');

                  // Send the ID token to our backend for verification
                  const result = await googleAuth(googleResult.idToken);
                  console.log('🔐 Backend authentication result:', result);

                  if (result.error) {
                    console.error('❌ Backend authentication failed:', result.error);
                    setServerError(result.error);
                  } else if (result.success) {
                    console.log('✅ Google authentication successful!');
                    console.log('👤 User data:', result.user);

                    // Force a small delay to ensure Redux state is updated
                    setTimeout(() => {
                      console.log('🔄 Authentication flow should complete now');
                    }, 100);
                  } else {
                    console.error('❌ Unexpected authentication result:', result);
                    setServerError('Authentication failed - unexpected response');
                  }
                } else {
                  console.error('❌ No Google ID token received');
                  setServerError('Failed to get Google authentication token');
                }
              } catch (error) {
                console.error('Google Sign-In error:', error);

                // Handle specific Google Sign-In errors
                if (error.code === 'SIGN_IN_CANCELLED') {
                  // User cancelled the sign-in process
                  return;
                } else if (error.code === 'IN_PROGRESS') {
                  setServerError('Sign-in already in progress');
                } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
                  Alert.alert(
                    'Google Play Services Required',
                    'Please install or update Google Play Services to use Google Sign-In.',
                    [{ text: 'OK' }]
                  );
                } else {
                  handleApiError(error, setServerError);
                }
              }
            }}
            style={styles.socialButton}
            isDisabled={isLoading}
          />
        )}

        {/*
          TEMPORARY: Apple Sign-In disabled during Apple Developer Console configuration
          TODO: Re-enable once Apple Developer Console setup and backend token verification are resolved
          Original condition: Platform.OS === 'ios'
          To re-enable: Change 'false' back to "Platform.OS === 'ios'"
        */}
        {false && Platform.OS === 'ios' && (
          <ModernSocialButton
            text="Continue with Apple"
            provider="apple"
            onPress={async () => {
              try {
                setServerError(null);

                // Use real Apple authentication
                const appleResult = await appleAuthService.signIn();

                if (!appleResult.success) {
                  if (!appleResult.cancelled) {
                    setServerError(appleResult.error || 'Apple Sign-In failed');
                  }
                  return;
                }

                // Use the identity token for backend authentication
                const identityToken = appleResult.credential.identityToken;
                if (!identityToken) {
                  setServerError('Failed to get Apple identity token');
                  return;
                }

                const result = await appleAuth(identityToken);

                if (result.error) {
                  setServerError(result.error);
                } else {
                  console.log('✅ Apple authentication successful');
                  // Navigation will be handled by the auth state change
                }
              } catch (error) {
                console.error('Apple Sign-In error:', error);
                handleApiError(error, setServerError);
              }
            }}
            style={styles.socialButton}
            isDisabled={isLoading}
          />
        )}
      </View>
    </ModernAuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    marginBottom: modernTheme.spacing.md,
    elevation: 0,
  },
  button: {
    marginTop: modernTheme.spacing.sm,
    marginBottom: modernTheme.spacing.md,
  },
  socialButton: {
    marginBottom: modernTheme.spacing.md,
  },
});

export default ModernEmailInput;
