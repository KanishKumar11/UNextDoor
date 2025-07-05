import React from "react";
import { View, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoadingIndicator from "./LoadingIndicator";
import ModernProgressBar from "./ModernProgressBar";
import { Text } from "./index";
import modernTheme from "../styles/modernTheme";

/**
 * ModernLoadingOverlay component
 * A comprehensive loading overlay with progress steps and modern design
 *
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the overlay is visible
 * @param {string} props.title - Main loading message
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {Array} props.steps - Array of step objects with { label, completed, icon }
 * @param {string} props.type - Loading indicator type ('pulse', 'spinner', 'dots')
 * @param {string} props.color - Primary color for the loading indicator
 * @param {Function} props.onRequestClose - Function called when overlay should close
 */
const ModernLoadingOverlay = ({
  visible = false,
  title = "Loading...",
  progress = 0,
  steps = [],
  type = "pulse",
  color = modernTheme.colors.primary[500],
  onRequestClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Loading Indicator */}
          <LoadingIndicator
            type={type}
            size="large"
            color={color}
            text={title}
          />

          {/* Progress Bar */}
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <ModernProgressBar
                progress={progress}
                height={6}
                backgroundColor="rgba(255, 255, 255, 0.2)"
                progressColor={color}
                animated={true}
              />
              <Text style={[styles.progressText, { color }]}>
                {Math.round(progress)}%
              </Text>
            </View>
          )}

          {/* Steps Indicator */}
          {steps.length > 0 && (
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepDot,
                      { borderColor: color },
                      step.completed && { backgroundColor: color },
                    ]}
                  >
                    <Ionicons
                      name={step.completed ? "checkmark" : step.icon || "ellipse-outline"}
                      size={12}
                      color={step.completed ? "#fff" : color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      step.completed && { color, fontFamily: modernTheme.typography.fontWeight.semibold },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: modernTheme.spacing.lg,
  },
  container: {
    backgroundColor: modernTheme.colors.background.paper,
    borderRadius: modernTheme.borderRadius.xl,
    padding: modernTheme.spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    minWidth: 300,
    maxWidth: 350,
  },
  progressContainer: {
    width: "100%",
    marginTop: modernTheme.spacing.lg,
    marginBottom: modernTheme.spacing.md,
  },
  progressText: {
    fontSize: modernTheme.typography.fontSize.sm,
    fontFamily: modernTheme.typography.fontWeight.semibold,
    textAlign: "center",
    marginTop: modernTheme.spacing.xs,
  },
  stepsContainer: {
    width: "100%",
    paddingTop: modernTheme.spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: modernTheme.spacing.sm,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(111, 201, 53, 0.1)",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: modernTheme.spacing.sm,
  },
  stepText: {
    fontSize: modernTheme.typography.fontSize.sm,
    fontFamily: modernTheme.typography.fontWeight.medium,
    color: modernTheme.colors.text.secondary,
    flex: 1,
  },
});

export default ModernLoadingOverlay;
