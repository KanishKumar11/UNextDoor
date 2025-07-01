import React from "react";
import { View, StyleSheet } from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Column component
 * A layout component for vertical arrangement with flexible alignment options
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Column content
 * @param {string} props.justify - Justify content ('start', 'center', 'end', 'space-between', 'space-around', 'space-evenly')
 * @param {string} props.align - Align items ('start', 'center', 'end', 'stretch', 'baseline')
 * @param {string} props.spacing - Space between items ('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl')
 * @param {Object} props.style - Additional styles
 */
const Column = ({
  children,
  justify = "start",
  align = "stretch",
  spacing = "md",
  style,
  ...props
}) => {
  // Map justify content values
  const justifyMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    "space-between": "space-between",
    "space-around": "space-around",
    "space-evenly": "space-evenly",
  };

  // Map align items values
  const alignMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };

  // Get spacing value from theme
  const spacingValue = modernTheme.spacing[spacing] || modernTheme.spacing.md;

  // Apply styles
  const columnStyles = [
    styles.column,
    {
      justifyContent: justifyMap[justify] || "flex-start",
      alignItems: alignMap[align] || "stretch",
    },
    style,
  ];

  // If spacing is needed, wrap children with appropriate margins
  if (spacingValue > 0 && React.Children.count(children) > 0) {
    const spacedChildren = React.Children.map(children, (child, index) => {
      if (!child) return null;

      // Skip margin for the last child
      const isLastChild = index === React.Children.count(children) - 1;

      return (
        <View style={[!isLastChild && { marginBottom: spacingValue }]}>
          {child}
        </View>
      );
    });

    return (
      <View style={columnStyles} {...props}>
        {spacedChildren}
      </View>
    );
  }

  // Render without spacing
  return (
    <View style={columnStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
  },
});

export default Column;
