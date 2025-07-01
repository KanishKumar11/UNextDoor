import React from "react";
import { View, StyleSheet } from "react-native";
import modernTheme from "../styles/modernTheme";
import { Text } from "./typography";

/**
 * ModernDivider component
 * A modern divider component with optional text
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Optional text to display in the middle of the divider
 * @param {string} props.orientation - Divider orientation ('horizontal', 'vertical')
 * @param {string} props.color - Divider color
 * @param {number} props.thickness - Divider thickness
 * @param {Object} props.style - Additional styles
 */
const ModernDivider = ({
  text,
  orientation = "horizontal",
  color = modernTheme.colors.neutral[300],
  thickness = 1,
  style,
  ...props
}) => {
  // If no text, render a simple divider
  if (!text) {
    return (
      <View
        style={[
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
          {
            backgroundColor: color,
            [orientation === "horizontal" ? "height" : "width"]: thickness,
          },
          style,
        ]}
        {...props}
      />
    );
  }

  // Render a divider with text
  return (
    <View
      style={[
        styles.container,
        orientation === "vertical" && styles.verticalContainer,
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.line,
          {
            backgroundColor: color,
            [orientation === "horizontal" ? "height" : "width"]: thickness,
          },
        ]}
      />

      <View style={styles.textContainer}>
        <Text
          variant="caption"
          color={modernTheme.colors.text.secondary}
          style={styles.text}
        >
          {text}
        </Text>
      </View>

      <View
        style={[
          styles.line,
          {
            backgroundColor: color,
            [orientation === "horizontal" ? "height" : "width"]: thickness,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
    marginVertical: modernTheme.spacing.md,
  },
  vertical: {
    height: "100%",
    marginHorizontal: modernTheme.spacing.md,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: modernTheme.spacing.md,
  },
  verticalContainer: {
    flexDirection: "column",
    height: "100%",
    width: "auto",
    marginHorizontal: modernTheme.spacing.md,
  },
  line: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: modernTheme.spacing.md,
  },
  text: {
    textAlign: "center",
  },
});

export default ModernDivider;
