/**
 * Font Weight Test Component
 * Tests all Montserrat font weights on mobile devices
 */

import React from "react";
import { View, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Text from "../components/typography/Text";
import ModernCard from "../components/ModernCard";

const FontWeightTest = () => {
  const { theme } = useTheme();

  // Test different font weights with direct style application
  const testWeights = [
    { weight: "light", numeric: "300", description: "Light" },
    { weight: "regular", numeric: "400", description: "Regular (Default)" },
    { weight: "medium", numeric: "500", description: "Medium" },
    { weight: "semibold", numeric: "600", description: "SemiBold" },
    { weight: "bold", numeric: "700", description: "Bold" },
    { weight: "extrabold", numeric: "800", description: "ExtraBold" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.default }}
    >
      <View style={{ padding: theme.spacing.lg }}>
        <Text
          weight="bold"
          size="2xl"
          style={{ marginBottom: theme.spacing.lg, textAlign: "center" }}
        >
          Font Weight Test (Individual .ttf Files)
        </Text>

        {/* Test using Text component weight prop */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.md }}>
            Using Text Component Weight Prop:
          </Text>

          {testWeights.map((test) => (
            <View key={test.weight} style={{ marginBottom: theme.spacing.sm }}>
              <Text weight={test.weight} size="lg">
                {test.description} ({test.numeric}) - "The quick brown fox
                jumps"
              </Text>
            </View>
          ))}
        </ModernCard>

        {/* Test using direct style fontWeight */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.md }}>
            Using Direct Style fontWeight:
          </Text>

          {testWeights.map((test) => (
            <View
              key={`direct-${test.weight}`}
              style={{ marginBottom: theme.spacing.sm }}
            >
              <Text
                style={{
                  fontFamily: theme.typography.fontFamily.regular,
                  fontWeight: test.numeric,
                  fontSize: theme.typography.fontSize.lg,
                }}
              >
                {test.description} ({test.numeric}) - "The quick brown fox
                jumps"
              </Text>
            </View>
          ))}
        </ModernCard>

        {/* Font family test */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.md }}>
            Font Family Test:
          </Text>

          <Text style={{ marginBottom: theme.spacing.sm }}>
            Current font family: {theme.typography.fontFamily.regular}
          </Text>

          <Text
            style={{
              fontFamily: "System",
              fontSize: theme.typography.fontSize.md,
              marginBottom: theme.spacing.sm,
            }}
          >
            System Font: "The quick brown fox jumps over the lazy dog"
          </Text>

          <Text
            style={{
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: theme.typography.fontSize.md,
              fontWeight: "400",
            }}
          >
            Montserrat: "The quick brown fox jumps over the lazy dog"
          </Text>
        </ModernCard>

        {/* Debug info */}
        <ModernCard>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.md }}>
            Debug Information:
          </Text>

          <Text
            style={{
              marginBottom: theme.spacing.xs,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            Platform: {require("react-native").Platform.OS}
          </Text>

          <Text
            style={{
              marginBottom: theme.spacing.xs,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            Font Family Regular: {theme.typography.fontFamily.regular}
          </Text>

          <Text
            style={{
              marginBottom: theme.spacing.xs,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            Font Family Italic: {theme.typography.fontFamily.italic}
          </Text>

          <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
            ✅ Individual .ttf files loaded for each weight
          </Text>

          <Text style={{ fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
            Files: Light.ttf, Regular.ttf, Medium.ttf, SemiBold.ttf, Bold.ttf,
            ExtraBold.ttf
          </Text>

          <Text style={{ fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
            Expected: Each weight should now be perfectly distinct
          </Text>
        </ModernCard>
      </View>
    </ScrollView>
  );
};

export default FontWeightTest;
