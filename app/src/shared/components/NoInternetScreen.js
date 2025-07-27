import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ModernButton } from "./ModernButton";
import { useTheme } from "../context/ThemeContext";

const { height } = Dimensions.get("window");

/**
 * No Internet Connection Screen
 * Shows when the app detects no network connectivity
 */
export const NoInternetScreen = ({ onRetry, isRetrying = false }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
    },
    circle: {
      position: "absolute",
      borderRadius: 999,
      backgroundColor: theme.colors.explorerTeal + "08",
    },
    circle1: {
      width: 200,
      height: 200,
      top: -100,
      right: -100,
    },
    circle2: {
      width: 150,
      height: 150,
      bottom: -75,
      left: -75,
    },
    circle3: {
      width: 100,
      height: 100,
      top: height * 0.3,
      left: -50,
    },
    content: {
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      maxWidth: 400,
      width: "100%",
    },
    iconContainer: {
      position: "relative",
      marginBottom: theme.spacing.xl,
    },
    disconnectedIndicator: {
      position: "absolute",
      bottom: -5,
      right: -5,
      backgroundColor: "#fff",
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.oceanBlue,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.neutral[600],
      textAlign: "center",
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    tipsContainer: {
      alignSelf: "stretch",
      backgroundColor: theme.colors.neutral[50],
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    tipsTitle: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semibold,
      color: theme.colors.oceanBlue,
      marginBottom: theme.spacing.sm,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    tipText: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.neutral[600],
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    retryButton: {
      width: "100%",
      maxWidth: 200,
    },
  });

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="wifi-outline"
            size={80}
            color={theme.colors.neutral[400]}
          />
          <View style={styles.disconnectedIndicator}>
            <Ionicons name="close" size={24} color="#ff4444" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Description */}
        <Text style={styles.description}>
          Please check your internet connection and try again. Make sure you're
          connected to Wi-Fi or mobile data.
        </Text>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <View style={styles.tipItem}>
            <Ionicons
              name="checkmark"
              size={16}
              color={theme.colors.explorerTeal}
            />
            <Text style={styles.tipText}>Check your Wi-Fi connection</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons
              name="checkmark"
              size={16}
              color={theme.colors.explorerTeal}
            />
            <Text style={styles.tipText}>Turn mobile data on/off</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons
              name="checkmark"
              size={16}
              color={theme.colors.explorerTeal}
            />
            <Text style={styles.tipText}>Restart your router</Text>
          </View>
        </View>

        {/* Retry Button */}
        <ModernButton
          text={isRetrying ? "Checking..." : "Try Again"}
          onPress={onRetry}
          disabled={isRetrying}
          style={styles.retryButton}
          icon={isRetrying ? "refresh" : "refresh-outline"}
        />
      </View>
    </View>
  );
};

export default NoInternetScreen;
