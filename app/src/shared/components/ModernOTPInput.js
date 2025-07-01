import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
  Vibration,
  AccessibilityInfo,
} from "react-native";
import modernTheme from "../styles/modernTheme";

/**
 * ModernOTPInput component
 * A modern OTP input component with auto-focus and accessibility features
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current OTP value
 * @param {Function} props.onChange - Function to call when OTP changes
 * @param {boolean} props.isDisabled - Whether the input is disabled
 * @param {boolean} props.autoFocus - Whether to auto-focus the first input
 * @param {number} props.length - Number of OTP digits (default: 6)
 * @param {Object} props.style - Additional container style
 */
const ModernOTPInput = ({
  value = "",
  onChange,
  isDisabled = false,
  autoFocus = true,
  length = 6,
  style,
  ...props
}) => {
  // Create an array of refs for each input
  const inputRefs = useRef([]);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  // Check if screen reader is enabled
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      setScreenReaderEnabled(enabled);
    });

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (enabled) => {
        setScreenReaderEnabled(enabled);
      }
    );

    return () => {
      // Clean up subscription
      subscription.remove();
    };
  }, []);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = Array(length)
      .fill(null)
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, [length]);

  // Split the value into an array of characters
  const valueArray = value.split("").slice(0, length);

  // Fill the array with empty strings if needed
  while (valueArray.length < length) {
    valueArray.push("");
  }

  // Handle input change
  const handleChange = (text, index) => {
    // Only allow digits
    if (!/^\d*$/.test(text)) {
      // Provide haptic feedback for invalid input on supported devices
      if (Platform.OS !== "web") {
        Vibration.vibrate(100); // Short vibration for error
      }
      return;
    }

    // Create a new array with the updated value
    const newValue = [...valueArray];

    // If pasting multiple digits
    if (text.length > 1) {
      // Split the pasted text into individual digits
      const pastedChars = text.split("").slice(0, length - index);

      // Update the values starting from the current index
      pastedChars.forEach((char, i) => {
        if (index + i < length) {
          newValue[index + i] = char;
        }
      });

      // Update the value
      onChange(newValue.join(""));

      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + pastedChars.length, length - 1);
      if (nextIndex < length) {
        inputRefs.current[nextIndex].focus();
      } else {
        Keyboard.dismiss();
      }
      return;
    }

    // Handle single digit input
    newValue[index] = text;
    onChange(newValue.join(""));

    // Auto-focus next input if a digit was entered
    if (text && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Dismiss keyboard if the last input was filled
    if (text && index === length - 1) {
      Keyboard.dismiss();

      // Provide haptic feedback when all digits are entered
      if (Platform.OS !== "web" && newValue.every((digit) => digit !== "")) {
        Vibration.vibrate(100); // Vibration for completion
      }
    }
  };

  // Handle key press (for backspace)
  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !valueArray[index] && index > 0) {
      // Focus previous input
      inputRefs.current[index - 1].focus();

      // Clear previous input
      const newValue = [...valueArray];
      newValue[index - 1] = "";
      onChange(newValue.join(""));
    }
  };

  // Handle input focus
  const handleFocus = (index) => {
    // On web, select the text when focused
    if (Platform.OS === "web") {
      inputRefs.current[index].select();
    }
  };

  // Render the OTP inputs
  return (
    <View style={[styles.container, style]} {...props}>
      {valueArray.map((digit, index) => (
        <View key={index} style={styles.inputWrapper}>
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              digit ? styles.inputFilled : {},
              isDisabled ? styles.inputDisabled : {},
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!isDisabled}
            autoFocus={autoFocus && index === 0}
            accessible={true}
            accessibilityLabel={`OTP digit ${index + 1} of ${length}${
              digit ? `, ${digit} entered` : ", empty"
            }`}
            accessibilityHint={`Enter digit ${
              index + 1
            } of your verification code`}
            accessibilityRole="keyboardKey"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: modernTheme.spacing.md,
  },
  inputWrapper: {
    width: "15%",
    aspectRatio: 1,
    maxWidth: 60,
    maxHeight: 60,
  },
  input: {
    flex: 1,
    backgroundColor: modernTheme.colors.background.card,
    borderRadius: modernTheme.borderRadius.md,
    fontSize: modernTheme.typography.fontSize.xl,
    fontWeight: modernTheme.typography.fontWeight.bold,
    color: modernTheme.colors.text.primary,
    textAlign: "center",
    paddingVertical: modernTheme.spacing.xs,
    borderWidth: 1,
    borderColor: modernTheme.colors.neutral[300],
    ...modernTheme.shadows.xs,
  },
  inputFilled: {
    backgroundColor: modernTheme.colors.primary[50],
    borderColor: modernTheme.colors.primary[500],
  },
  inputDisabled: {
    backgroundColor: modernTheme.colors.neutral[100],
    color: modernTheme.colors.text.disabled,
    borderColor: modernTheme.colors.neutral[200],
  },
});

export default ModernOTPInput;
