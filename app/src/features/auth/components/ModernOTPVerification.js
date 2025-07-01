import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import ModernAuthLayout from "../../../shared/components/ModernAuthLayout";
import ModernButton from "../../../shared/components/ModernButton";
import ModernOTPInput from "../../../shared/components/ModernOTPInput";
import ModernErrorMessage from "../../../shared/components/ModernErrorMessage";
import { Text } from "../../../shared/components/typography";

// Import utilities
import { handleApiError } from "../../../shared/utils/errorUtils";
import modernTheme from "../../../shared/styles/modernTheme";

// OTP validation schema
const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

/**
 * ModernOTPVerification component
 * A modern OTP verification screen for authentication
 *
 * @param {Object} props - Component props
 * @param {string} props.email - User email
 * @param {Function} props.onVerified - Function to call when OTP is verified
 * @param {Function} props.onChangeEmail - Function to go back to email input
 * @param {Function} props.onResendOTP - Function to resend OTP
 */
const ModernOTPVerification = ({
  email,
  onVerified,
  onChangeEmail,
  onResendOTP,
}) => {
  // Get auth hooks
  const { verifyOTP, sendOTP } = useAuth();

  // Local state
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  // Handle OTP submission
  const onSubmit = async (data) => {
    try {
      // Reset error and set loading state
      setServerError(null);
      setIsVerifying(true);

      // Ensure OTP is a string and has exactly 6 digits
      const cleanOTP = data.otp.toString().trim().slice(0, 6);

      if (!/^\d{6}$/.test(cleanOTP)) {
        setServerError("OTP must be 6 digits");
        setIsVerifying(false);
        return;
      }

      // Verify OTP
      const result = await verifyOTP(email, cleanOTP);

      // Handle error
      if (result.error) {
        if (
          result.error.includes("invalid") ||
          result.error.includes("incorrect") ||
          result.error.includes("wrong") ||
          result.error.includes("expired")
        ) {
          setServerError(
            "Invalid or expired verification code. Please try again."
          );
        } else {
          setServerError(result.error);
        }
        setIsVerifying(false);
        return;
      }

      // Handle success
      if (result.user) {
        // User exists and is authenticated
        setTimeout(() => {
          onVerified(false, result.user);
        }, 300);
      } else {
        // Check if registration is required
        const requiresRegistration = result.requiresRegistration === true;
        onVerified(requiresRegistration, null);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error verifying OTP:", error);
      handleApiError(error, setServerError);
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      setServerError(null);
      setResendDisabled(true);
      setResendCountdown(30); // 30 seconds cooldown

      if (onResendOTP) {
        await onResendOTP();
      } else {
        await sendOTP(email);
      }
    } catch (error) {
      handleApiError(error, setServerError);
      setResendDisabled(false);
    }
  };

  return (
    <ModernAuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}`}
      showBackButton
      onBackPress={onChangeEmail}
    >
      <View style={styles.container}>
        {/* Error message */}
        <ModernErrorMessage error={serverError} />

        {/* OTP input */}
        <View style={styles.otpSection}>
          <Text variant="label" style={styles.otpLabel}>
            Verification Code
          </Text>

          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <ModernOTPInput
                value={value}
                onChange={onChange}
                isDisabled={isVerifying}
                autoFocus={true}
                length={6}
              />
            )}
          />

          {errors.otp && (
            <Text variant="hint" color={"white"} style={styles.errorText}>
              {errors.otp.message}
            </Text>
          )}
        </View>

        {/* Verify button */}
        <ModernButton
          text={isVerifying ? "Verifying..." : "Verify"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isVerifying}
          isDisabled={isVerifying}
          iconName="checkmark-circle-outline"
          iconPosition="right"
          style={styles.button}
        />

        {/* Resend link */}
        <View style={styles.resendContainer}>
          <Text variant="caption">Didn't receive the code?</Text>
          {resendCountdown > 0 ? (
            <Text variant="caption" color={modernTheme.colors.text.secondary}>
              Resend in {resendCountdown}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={isVerifying || resendDisabled}
            >
              <Text
                variant="caption"
                color={
                  isVerifying || resendDisabled
                    ? modernTheme.colors.text.disabled
                    : modernTheme.colors.primary[500]
                }
                style={styles.resendLink}
              >
                Resend
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Change email link */}
        <TouchableOpacity
          onPress={onChangeEmail}
          disabled={isVerifying}
          style={styles.changeEmailContainer}
        >
          <Text
            variant="caption"
            color={
              isVerifying
                ? modernTheme.colors.text.disabled
                : modernTheme.colors.primary[500]
            }
          >
            Change email address
          </Text>
        </TouchableOpacity>
      </View>
    </ModernAuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  otpSection: {
    marginBottom: modernTheme.spacing.md,
  },
  otpLabel: {
    marginBottom: modernTheme.spacing.xs,
  },
  errorText: {
    marginTop: modernTheme.spacing.xs,
  },
  button: {
    marginBottom: modernTheme.spacing.md,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: modernTheme.spacing.md,
  },
  resendLink: {
    marginLeft: modernTheme.spacing.xs,
    fontWeight: modernTheme.typography.fontWeight.medium,
  },
  changeEmailContainer: {
    alignItems: "center",
  },
});

export default ModernOTPVerification;
