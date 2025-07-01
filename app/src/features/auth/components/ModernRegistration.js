import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

// Import modern components
import ModernAuthLayout from "../../../shared/components/ModernAuthLayout";
import ModernInput from "../../../shared/components/ModernInput";
import ModernButton from "../../../shared/components/ModernButton";
import ModernErrorMessage from "../../../shared/components/ModernErrorMessage";
import { Text } from "../../../shared/components/typography";

// Import utilities
import { handleApiError } from "../../../shared/utils/errorUtils";
import modernTheme from "../../../shared/styles/modernTheme";

// Registration validation schema
const registrationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
});

/**
 * ModernRegistration component
 * A modern registration screen for authentication
 *
 * @param {Object} props - Component props
 * @param {string} props.email - User email
 * @param {Function} props.onRegistered - Function to call when registration is complete
 * @param {Function} props.onBack - Function to go back to previous screen
 */
const ModernRegistration = ({ email, onRegistered, onBack }) => {
  const { register, isLoading } = useAuth();
  const [serverError, setServerError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      console.log("Registration form submitted with data:", data);
      console.log("Email from props:", email);

      // Create registration data
      const registrationData = {
        email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      console.log(
        "Sending registration data:",
        JSON.stringify(registrationData)
      );

      // Register the user
      const result = await register(registrationData);
      console.log("Registration result:", result);

      if (result.error) {
        console.error("Registration error:", result.error);
        setServerError(result.error);
        return;
      }

      // Registration successful
      if (result.user) {
        console.log("Registration successful, user:", result.user);
        onRegistered(result.user);
      } else {
        console.error(
          "Registration successful but no user data returned:",
          result
        );
        setServerError(
          "Registration successful but no user data received. Please try logging in."
        );
      }
    } catch (error) {
      console.error("Registration error caught:", error);
      handleApiError(error, setServerError);
    }
  };

  return (
    <ModernAuthLayout
      title="Complete Your Profile"
      subtitle="Please provide the following information to complete your registration"
      onBackPress={onBack}
    >
      <View style={styles.container}>
        {/* Error message */}
        <ModernErrorMessage error={serverError} />

        {/* Email display (non-editable) */}
        <ModernInput
          label="Email"
          value={email}
          isReadOnly
          iconName="mail-outline"
          style={styles.input}
        />

        {/* Username input */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <ModernInput
              label="Username"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Choose a username"
              error={errors.username?.message}
              isRequired
              isDisabled={isLoading}
              autoCapitalize="none"
              iconName="person-outline"
              style={styles.input}
            />
          )}
        />

        {/* First name input */}
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <ModernInput
              label="First Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your first name"
              error={errors.firstName?.message}
              isRequired
              isDisabled={isLoading}
              autoCapitalize="words"
              iconName="person-outline"
              style={styles.input}
            />
          )}
        />

        {/* Last name input */}
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <ModernInput
              label="Last Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your last name"
              error={errors.lastName?.message}
              isRequired
              isDisabled={isLoading}
              autoCapitalize="words"
              iconName="person-outline"
              style={styles.input}
            />
          )}
        />

        {/* Register button */}
        <ModernButton
          text={isLoading ? "Creating Account..." : "Create Account"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          iconName="checkmark-circle-outline"
          iconPosition="right"
          style={styles.button}
        />

        {/* Terms and conditions */}
        <Text variant="caption" align="center" style={styles.termsText}>
          By creating an account, you agree to our{" "}
          <Text
            variant="caption"
            color={modernTheme.colors.primary[500]}
            weight="medium"
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            variant="caption"
            color={modernTheme.colors.primary[500]}
            weight="medium"
          >
            Privacy Policy
          </Text>
        </Text>
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
  termsText: {
    marginTop: modernTheme.spacing.md,
  },
});

export default ModernRegistration;
