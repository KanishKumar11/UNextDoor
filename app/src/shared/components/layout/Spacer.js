import React from "react";
import { View } from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Spacer component
 * A utility component for adding consistent spacing between elements
 *
 * @param {Object} props - Component props
 * @param {string|number} props.size - Spacing size ('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl') or custom number
 * @param {boolean} props.horizontal - Whether the spacer is horizontal
 * @param {boolean} props.flex - Whether the spacer should use flex: 1
 * @param {Object} props.style - Additional styles
 */
const Spacer = ({
  size = "md",
  horizontal = false,
  flex = false,
  style,
  ...props
}) => {
  // Get spacing value from theme or use custom number
  const spacingValue =
    typeof size === "string"
      ? modernTheme.spacing[size] || modernTheme.spacing.md
      : size;

  // Calculate dimensions
  const width = horizontal ? spacingValue : undefined;
  const height = !horizontal ? spacingValue : undefined;

  // Apply styles
  const spacerStyle = {
    width,
    height,
    ...(flex && { flex: 1 }),
    ...style,
  };

  return <View style={spacerStyle} {...props} />;
};

export default Spacer;
