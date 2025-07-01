import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import modernTheme from "../../styles/modernTheme";

const { width } = Dimensions.get("window");

/**
 * Grid component
 * A layout component for grid arrangements with responsive columns
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grid content
 * @param {number} props.columns - Number of columns
 * @param {string} props.spacing - Space between items ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {Object} props.style - Additional styles
 */
const Grid = ({ children, columns = 2, spacing = "md", style, ...props }) => {
  // Get spacing value from theme
  const spacingValue = modernTheme.spacing[spacing] || modernTheme.spacing.md;

  // Calculate item width based on columns and spacing
  const calculateItemWidth = () => {
    const totalSpacing = spacingValue * (columns - 1);
    return (width - 2 * modernTheme.spacing.lg - totalSpacing) / columns;
  };

  const itemWidth = calculateItemWidth();

  // Create rows and columns
  const renderGrid = () => {
    const childrenArray = React.Children.toArray(children).filter(Boolean);
    const rows = [];

    for (let i = 0; i < childrenArray.length; i += columns) {
      const rowItems = [];

      for (let j = 0; j < columns; j++) {
        const index = i + j;

        if (index < childrenArray.length) {
          const isLastInRow = j === columns - 1;

          rowItems.push(
            <View
              key={`item-${index}`}
              style={[
                styles.gridItem,
                {
                  width: itemWidth,
                  marginRight: isLastInRow ? 0 : spacingValue,
                },
              ]}
            >
              {childrenArray[index]}
            </View>
          );
        } else {
          // Add empty placeholder to maintain grid structure
          rowItems.push(
            <View
              key={`empty-${index}`}
              style={[
                styles.gridItem,
                {
                  width: itemWidth,
                  marginRight: 0,
                },
              ]}
            />
          );
        }
      }

      const isLastRow = i + columns >= childrenArray.length;

      rows.push(
        <View
          key={`row-${i}`}
          style={[
            styles.gridRow,
            { marginBottom: isLastRow ? 0 : spacingValue },
          ]}
        >
          {rowItems}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={[styles.grid, style]} {...props}>
      {renderGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  gridItem: {
    // Base styles for grid items
  },
});

export default Grid;
