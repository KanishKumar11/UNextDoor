/**
 * Theme Usage Example
 * Demonstrates how to use all brand colors and Montserrat font weights
 * Based on UNextDoor brand guidelines
 */

import React from "react";
import { View, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Text from "../components/typography/Text";
import Heading from "../components/typography/Heading";
import ModernCard from "../components/ModernCard";
import { Spacer } from "../components";

const ThemeUsageExample = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.default }}
    >
      <View style={{ padding: theme.spacing.lg }}>
        {/* Brand Colors Section */}
        <Heading level="h2" gutterBottom>
          Brand Colors
        </Heading>

        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.sm }}>
            Primary Green (C59 M0 Y100 K0 / R111 G201 B53)
          </Text>
          <View
            style={{
              width: "100%",
              height: 60,
              backgroundColor: theme.colors.primary[500], // #6FC935
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.sm,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text weight="bold" color="white">
              Primary Green #6FC935
            </Text>
          </View>

          <Text weight="semibold" style={{ marginBottom: theme.spacing.sm }}>
            Secondary Navy Blue (C100 M80 Y0 K20 / R0 G51 B102)
          </Text>
          <View
            style={{
              width: "100%",
              height: 60,
              backgroundColor: theme.colors.secondary[500], // #003366
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.sm,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text weight="bold" color="white">
              Secondary Navy #003366
            </Text>
          </View>

          <Text weight="semibold" style={{ marginBottom: theme.spacing.sm }}>
            Tertiary Black (C0 M0 Y0 K100 / R0 G0 B0)
          </Text>
          <View
            style={{
              width: "100%",
              height: 60,
              backgroundColor: theme.colors.tertiary[500], // #000000
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.sm,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text weight="bold" color="white">
              Tertiary Black #000000
            </Text>
          </View>
        </ModernCard>

        {/* Montserrat Font Weights Section */}
        <Heading level="h2" gutterBottom>
          Montserrat Font Weights (Individual Files)
        </Heading>

        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text
            weight="light"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Light (300) - Should be lighter than regular
          </Text>
          <Text
            weight="regular"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Regular (400) - Default weight ✅
          </Text>
          <Text
            weight="medium"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Medium (500) - Slightly bolder than regular
          </Text>
          <Text
            weight="semibold"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            SemiBold (600) - Noticeably bolder
          </Text>
          <Text
            weight="bold"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Bold (700) - Strong emphasis
          </Text>
          <Text
            weight="extrabold"
            size="lg"
            style={{ marginBottom: theme.spacing.sm }}
          >
            ExtraBold (800) - Maximum emphasis
          </Text>

          <Text
            style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.primary[100],
              borderRadius: theme.borderRadius.sm,
              fontFamily: theme.typography.fontFamily.regular,
            }}
          >
            ✅ Individual Font Files: Using separate .ttf files for each weight
            (Light, Regular, Medium, SemiBold, Bold, ExtraBold)
          </Text>
        </ModernCard>

        {/* Typography Hierarchy */}
        <Heading level="h2" gutterBottom>
          Typography Hierarchy
        </Heading>

        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h1" gutterBottom>
            Heading 1 - Bold 30px
          </Heading>
          <Heading level="h2" gutterBottom>
            Heading 2 - Bold 24px
          </Heading>
          <Heading level="h3" gutterBottom>
            Heading 3 - SemiBold 20px
          </Heading>
          <Heading level="h4" gutterBottom>
            Heading 4 - SemiBold 18px
          </Heading>
          <Heading level="h5" gutterBottom>
            Heading 5 - SemiBold 16px
          </Heading>
          <Heading level="h6" gutterBottom>
            Heading 6 - SemiBold 14px
          </Heading>

          <Text variant="body" style={{ marginBottom: theme.spacing.sm }}>
            Body Text - Regular 16px
          </Text>
          <Text variant="caption" style={{ marginBottom: theme.spacing.sm }}>
            Caption Text - Regular 14px
          </Text>
          <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Label Text - Medium 14px
          </Text>
          <Text variant="hint">Hint Text - Regular 12px</Text>
        </ModernCard>

        {/* Color Usage Examples */}
        <Heading level="h2" gutterBottom>
          Color Usage Examples
        </Heading>

        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text
            color="primary.500"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Primary Green Text
          </Text>
          <Text
            color="secondary.500"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Secondary Navy Text
          </Text>
          <Text
            color="tertiary.500"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Tertiary Black Text
          </Text>
          <Text
            color="success.main"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Success Text
          </Text>
          <Text
            color="warning.main"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Warning Text
          </Text>
          <Text
            color="error.main"
            weight="semibold"
            style={{ marginBottom: theme.spacing.sm }}
          >
            Error Text
          </Text>
        </ModernCard>

        {/* Font Size Examples */}
        <Heading level="h2" gutterBottom>
          Font Size Scale
        </Heading>

        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Text size="xs" style={{ marginBottom: theme.spacing.xs }}>
            Extra Small - 12px
          </Text>
          <Text size="sm" style={{ marginBottom: theme.spacing.xs }}>
            Small - 14px
          </Text>
          <Text size="md" style={{ marginBottom: theme.spacing.xs }}>
            Medium - 16px (Default)
          </Text>
          <Text size="lg" style={{ marginBottom: theme.spacing.xs }}>
            Large - 18px
          </Text>
          <Text size="xl" style={{ marginBottom: theme.spacing.xs }}>
            Extra Large - 20px
          </Text>
          <Text size="2xl" style={{ marginBottom: theme.spacing.xs }}>
            2X Large - 24px
          </Text>
          <Text size="3xl" style={{ marginBottom: theme.spacing.xs }}>
            3X Large - 30px
          </Text>
          <Text size="4xl" style={{ marginBottom: theme.spacing.xs }}>
            4X Large - 36px
          </Text>
          <Text size="5xl" style={{ marginBottom: theme.spacing.xs }}>
            5X Large - 48px
          </Text>
        </ModernCard>

        {/* Brand Guidelines Summary */}
        <Heading level="h2" gutterBottom>
          Brand Guidelines Summary
        </Heading>

        <ModernCard>
          <Text weight="semibold" style={{ marginBottom: theme.spacing.sm }}>
            ✅ Correct Brand Implementation:
          </Text>
          <Text style={{ marginBottom: theme.spacing.xs }}>
            • Primary Green: #6FC935 (C59 M0 Y100 K0)
          </Text>
          <Text style={{ marginBottom: theme.spacing.xs }}>
            • Secondary Navy: #003366 (C100 M80 Y0 K20)
          </Text>
          <Text style={{ marginBottom: theme.spacing.xs }}>
            • Tertiary Black: #000000 (C0 M0 Y0 K100)
          </Text>
          <Text style={{ marginBottom: theme.spacing.xs }}>
            • Font Family: Montserrat (Light, Regular, Medium, SemiBold, Bold,
            ExtraBold)
          </Text>
          <Text style={{ marginBottom: theme.spacing.xs }}>
            • Consistent theme token usage throughout the app
          </Text>
          <Text>• Proper font weight mapping to font families</Text>
        </ModernCard>

        <Spacer size="xl" />
      </View>
    </ScrollView>
  );
};

export default ThemeUsageExample;
