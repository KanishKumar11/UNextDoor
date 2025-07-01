import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import modernTheme from "../styles/modernTheme";

/**
 * ModernProgressBar component
 * A component for displaying progress bars with various styles
 *
 * @param {Object} props - Component props
 * @param {number} props.value - Current progress value (0-100)
 * @param {number} props.max - Maximum progress value
 * @param {string} props.color - Progress bar color
 * @param {string} props.backgroundColor - Background color
 * @param {number} props.height - Progress bar height
 * @param {boolean} props.animated - Whether to animate progress changes
 * @param {boolean} props.showStripes - Whether to show animated stripes
 * @param {boolean} props.rounded - Whether to use rounded corners
 * @param {Object} props.style - Additional styles
 */
class ModernProgressBar extends React.Component {
  constructor(props) {
    super(props);

    // Initialize animated value
    this.animatedWidth = new Animated.Value(0);
    this.animatedStripes = new Animated.Value(0);
  }

  componentDidMount() {
    const { value, max, animated, showStripes } = this.props;

    // Animate initial progress
    if (animated) {
      this.animateProgress(value, max);
    } else {
      this.animatedWidth.setValue(this.calculateWidth(value, max));
    }

    // Start stripes animation if needed
    if (showStripes) {
      this.animateStripes();
    }
  }

  componentDidUpdate(prevProps) {
    const { value, max, animated, showStripes } = this.props;

    // Animate progress changes
    if (prevProps.value !== value || prevProps.max !== max) {
      if (animated) {
        this.animateProgress(value, max);
      } else {
        this.animatedWidth.setValue(this.calculateWidth(value, max));
      }
    }

    // Handle stripes animation
    if (prevProps.showStripes !== showStripes) {
      if (showStripes) {
        this.animateStripes();
      }
    }
  }

  // Calculate width percentage
  calculateWidth(value, max) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return percentage;
  }

  // Animate progress changes
  animateProgress(value, max) {
    Animated.timing(this.animatedWidth, {
      toValue: this.calculateWidth(value, max),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  // Animate stripes
  animateStripes() {
    Animated.loop(
      Animated.timing(this.animatedStripes, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();
  }

  render() {
    const {
      value = 0,
      max = 100,
      color = modernTheme.colors.primary[500],
      backgroundColor = modernTheme.colors.neutral[200],
      height = 8,
      animated = true,
      showStripes = false,
      rounded = true,
      style,
      ...props
    } = this.props;

    // Calculate width for non-animated version
    const percentage = this.calculateWidth(value, max);

    // Interpolate width for animation
    const width = animated
      ? this.animatedWidth.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        })
      : `${percentage}%`;

    // Interpolate stripes position for animation
    const stripesPosition = this.animatedStripes.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    // Border radius based on height and rounded prop
    const borderRadius = rounded ? height / 2 : 0;

    return (
      <View
        style={[
          styles.container,
          {
            height,
            backgroundColor,
            borderRadius,
          },
          style,
        ]}
        {...props}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              width,
              backgroundColor: color,
              borderRadius,
            },
          ]}
        >
          {showStripes && (
            <Animated.View
              style={[
                styles.stripes,
                {
                  transform: [{ translateX: stripesPosition }],
                },
              ]}
            />
          )}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  stripes: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "200%",
    height: "100%",
    backgroundImage:
      "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
    backgroundSize: "20px 20px",
  },
});

export default ModernProgressBar;
