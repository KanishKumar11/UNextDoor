import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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

        {/* Social login buttons */}
        <ModernSocialButton
          text="Continue with Google"
          provider="google"
          onPress={async () => {
            try {
              setServerError(null);
              // In a real app, you would get the Google token using Expo Google Auth
              const mockGoogleToken = "mock-google-token";
              const result = await googleAuth(mockGoogleToken);

              if (result.error) {
                setServerError(result.error);
              }
            } catch (error) {
              handleApiError(error, setServerError);
            }
          }}
          style={styles.socialButton}
          isDisabled={isLoading}
        />

        <ModernSocialButton
          text="Continue with Apple"
          provider="apple"
          onPress={async () => {
            try {
              setServerError(null);
              // In a real app, you would get the Apple token using Expo Apple Auth
              const mockAppleToken = "mock-apple-token";
              const result = await appleAuth(mockAppleToken);

              if (result.error) {
                setServerError(result.error);
              }
            } catch (error) {
              handleApiError(error, setServerError);
            }
          }}
          style={styles.socialButton}
          isDisabled={isLoading}
        />
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
