import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";

/**
 * ModernInput component
 * A text input component with modern styling
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Text change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.isRequired - Is input required
 * @param {boolean} props.isDisabled - Is input disabled
 * @param {boolean} props.isReadOnly - Is input read-only
 * @param {string} props.keyboardType - Keyboard type
 * @param {boolean} props.isPassword - Is password input
 * @param {string} props.autoCapitalize - Auto capitalize
 * @param {boolean} props.autoCorrect - Auto correct
 * @param {string} props.iconName - Ionicons icon name
 * @param {string} props.iconPosition - Icon position (left, right)
 * @param {Function} props.onIconPress - Icon press handler
 * @param {Object} props.style - Additional styles
 */
const ModernInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  keyboardType = "default",
  isPassword = false,
  autoCapitalize = "none",
  autoCorrect = false,
  iconName,
  iconPosition = "left",
  onIconPress,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle focus
  const handleFocus = () => setIsFocused(true);

  // Handle blur
  const handleBlur = () => setIsFocused(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Get border color based on state
  const getBorderColor = () => {
    if (error) return modernTheme.colors.error.main;
    if (isFocused) return modernTheme.colors.primary[500];
    return modernTheme.colors.neutral[300];
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {isRequired && <Text style={styles.requiredIndicator}>*</Text>}
        </View>
      )}

      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: isDisabled
              ? modernTheme.colors.neutral[100]
              : modernTheme.colors.background.paper,
          },
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {/* Left icon */}
        {iconName && iconPosition === "left" && (
          <TouchableOpacity
            onPress={onIconPress}
            disabled={!onIconPress}
            style={styles.iconContainer}
          >
            <Ionicons
              name={iconName}
              size={20}
              color={
                isFocused
                  ? modernTheme.colors.primary[500]
                  : modernTheme.colors.neutral[500]
              }
            />
          </TouchableOpacity>
        )}

        {/* TextInput */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={modernTheme.colors.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!isDisabled && !isReadOnly}
          {...props}
        />

        {/* Right icon or password toggle */}
        {isPassword ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={modernTheme.colors.neutral[500]}
            />
          </TouchableOpacity>
        ) : (
          iconName &&
          iconPosition === "right" && (
            <TouchableOpacity
              onPress={onIconPress}
              disabled={!onIconPress}
              style={styles.iconContainer}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={
                  isFocused
                    ? modernTheme.colors.primary[500]
                    : modernTheme.colors.neutral[500]
                }
              />
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Error message or helper text */}
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: modernTheme.spacing.md,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: modernTheme.spacing.xs,
  },
  label: {
    fontSize: modernTheme.typography.fontSize.sm,
    fontWeight: modernTheme.typography.fontWeight.medium,
    color: modernTheme.colors.text.primary,
  },
  requiredIndicator: {
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.error.main,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: modernTheme.borderRadius.md,
    paddingHorizontal: modernTheme.spacing.sm,
    height: 48,
  },
  inputContainerFocused: {
    ...modernTheme.shadows.xs,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.primary,
  },
  iconContainer: {
    padding: modernTheme.spacing.xs,
  },
  helperText: {
    fontSize: modernTheme.typography.fontSize.xs,
    color: modernTheme.colors.text.secondary,
    marginTop: modernTheme.spacing.xs,
  },
  errorText: {
    color: modernTheme.colors.error.dark, // Dark red text for better readability
  },
});

export default ModernInput;
