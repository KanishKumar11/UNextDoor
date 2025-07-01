import React from "react";
import { View, StyleSheet } from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Row component
 * A layout component for horizontal arrangement with flexible alignment options
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Row content
 * @param {string} props.justify - Justify content ('start', 'center', 'end', 'space-between', 'space-around', 'space-evenly')
 * @param {string} props.align - Align items ('start', 'center', 'end', 'stretch', 'baseline')
 * @param {string} props.spacing - Space between items ('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl')
 * @param {boolean} props.wrap - Whether to wrap items
 * @param {Object} props.style - Additional styles
 */
const Row = ({
  children,
  justify = "start",
  align = "center",
  spacing = "md",
  wrap = false,
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
  const rowStyles = [
    styles.row,
    {
      justifyContent: justifyMap[justify] || "flex-start",
      alignItems: alignMap[align] || "center",
      flexWrap: wrap ? "wrap" : "nowrap",
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
        <View style={[!isLastChild && { marginRight: spacingValue }]}>
          {child}
        </View>
      );
    });

    return (
      <View style={rowStyles} {...props}>
        {spacedChildren}
      </View>
    );
  }

  // Render without spacing
  return (
    <View style={rowStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});

export default Row;
