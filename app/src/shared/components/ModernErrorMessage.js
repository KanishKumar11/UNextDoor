import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";
import { Text } from "./typography";

/**
 * ModernErrorMessage component
 * A modern error message component with animation
 *
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {string} props.type - Error type ('error', 'warning', 'info')
 * @param {Object} props.style - Additional styles
 */
class ModernErrorMessage extends React.Component {
  constructor(props) {
    super(props);

    this.fadeAnim = new Animated.Value(0);
    this.slideAnim = new Animated.Value(-20);
  }

  componentDidMount() {
    if (this.props.error) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.error && this.props.error) {
      // New error appeared
      this.animateIn();
    } else if (prevProps.error && !this.props.error) {
      // Error cleared
      this.animateOut();
    } else if (prevProps.error !== this.props.error && this.props.error) {
      // Error changed
      this.animateChange();
    }
  }

  animateIn() {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(this.slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  animateOut() {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }

  animateChange() {
    Animated.sequence([
      // Fade out
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      // Fade in
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  render() {
    const { error, type = "error", style } = this.props;

    if (!error) return null;

    // Define styles based on type with proper contrast
    const typeStyles = {
      error: {
        backgroundColor: "#FFEBEE", // Very light red background
        borderColor: modernTheme.colors.error.main,
        iconColor: modernTheme.colors.error.dark,
        textColor: modernTheme.colors.error.dark, // Dark red text for contrast
        icon: "alert-circle",
      },
      warning: {
        backgroundColor: "#FFF8E1", // Very light orange background
        borderColor: modernTheme.colors.warning.main,
        iconColor: modernTheme.colors.warning.dark,
        textColor: modernTheme.colors.warning.dark, // Dark orange text for contrast
        icon: "warning",
      },
      info: {
        backgroundColor: "#E3F2FD", // Very light blue background
        borderColor: modernTheme.colors.info.main,
        iconColor: modernTheme.colors.info.dark,
        textColor: modernTheme.colors.info.dark, // Dark blue text for contrast
        icon: "information-circle",
      },
    };

    const currentType = typeStyles[type] || typeStyles.error;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: currentType.backgroundColor,
            borderColor: currentType.borderColor,
            opacity: this.fadeAnim,
            transform: [{ translateY: this.slideAnim }],
          },
          style,
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${error}`}
      >
        <Ionicons
          name={currentType.icon}
          size={20}
          color={currentType.iconColor}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: currentType.textColor }]}>
          {error}
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: modernTheme.spacing.md,
    borderRadius: modernTheme.borderRadius.md,
    borderWidth: 1,
    marginBottom: modernTheme.spacing.md,
  },
  icon: {
    marginRight: modernTheme.spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: modernTheme.typography.fontSize.sm,
  },
});

export default ModernErrorMessage;
