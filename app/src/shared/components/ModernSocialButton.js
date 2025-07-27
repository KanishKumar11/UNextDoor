import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";
import { Text } from "./typography";
import { BRAND_COLORS } from "../constants/colors";

/**
 * ModernSocialButton component
 * A modern social login button component
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {string} props.provider - Social provider ('google', 'apple', 'facebook', 'twitter')
 * @param {Function} props.onPress - Button press handler
 * @param {boolean} props.isLoading - Is button loading
 * @param {boolean} props.isDisabled - Is button disabled
 * @param {Object} props.style - Additional styles
 */
const ModernSocialButton = ({
  text,
  provider,
  onPress,
  isLoading = false,
  isDisabled = false,
  style,
  ...props
}) => {
  // Define provider styles
  const providerStyles = {
    google: {
      backgroundColor: "#ffffff",
      textColor: "#757575",
      borderColor: "#DADCE0",
      icon: "logo-google",
      iconColor: "#4285F4",
    },
    apple: {
      backgroundColor: modernTheme.colors.shadowGrey,
      textColor: modernTheme.colors.whisperWhite,
      borderColor: modernTheme.colors.shadowGrey,
      icon: "logo-apple",
      iconColor: modernTheme.colors.whisperWhite,
    },
    facebook: {
      backgroundColor: "#1877F2",
      textColor: "#ffffff",
      borderColor: "#1877F2",
      icon: "logo-facebook",
      iconColor: "#ffffff",
    },
    twitter: {
      backgroundColor: "#1DA1F2",
      textColor: "#ffffff",
      borderColor: "#1DA1F2",
      icon: "logo-twitter",
      iconColor: "#ffffff",
    },
  };

  // Get current provider styles
  const currentProvider = providerStyles[provider] || providerStyles.google;

  // Determine disabled styles
  const disabledStyles = {
    backgroundColor: modernTheme.colors.neutral[100],
    textColor: modernTheme.colors.text.disabled,
    borderColor: modernTheme.colors.neutral[200],
  };

  // Apply styles based on state
  const buttonStyles = isDisabled ? disabledStyles : currentProvider;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonStyles.backgroundColor,
          borderColor: buttonStyles.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={buttonStyles.textColor}
            style={styles.loader}
          />
        ) : (
          <Ionicons
            name={currentProvider.icon}
            size={20}
            color={buttonStyles.iconColor}
            style={styles.icon}
          />
        )}

        <Text style={[styles.text, { color: buttonStyles.textColor }]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: modernTheme.borderRadius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: modernTheme.spacing.md,
    marginBottom: modernTheme.spacing.md,
    ...modernTheme.shadows.xs,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: modernTheme.spacing.sm,
  },
  loader: {
    marginRight: modernTheme.spacing.sm,
  },
  text: {
    fontSize: modernTheme.typography.fontSize.md,
    fontWeight: modernTheme.typography.fontWeight.medium,
  },
});

export default ModernSocialButton;
