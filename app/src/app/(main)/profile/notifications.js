import React, { useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../shared/context/ThemeContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernButton,
} from "../../../shared/components";
import { Ionicons } from "@expo/vector-icons";

/**
 * Notifications Settings Screen
 * Allows users to configure notification preferences
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // State for notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [conversationAlerts, setConversationAlerts] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [marketplaceAlerts, setMarketplaceAlerts] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would call an API to update the user's notification settings
    console.log("Saving notification settings:", {
      pushEnabled,
      conversationAlerts,
      achievementAlerts,
      marketplaceAlerts,
      emailDigest,
      soundEnabled,
    });

    // Navigate back to profile
    router.back();
  };

  // Render a toggle setting
  const renderToggleSetting = (title, description, value, onValueChange) => (
    <Row
      justify="space-between"
      align="center"
      style={{ marginBottom: theme.spacing.md }}
    >
      <Column style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text weight="semibold">{title}</Text>
        <Text variant="caption" color="neutral.600">
          {description}
        </Text>
      </Column>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.neutral[300],
          true: theme.colors.primary[500],
        }}
        thumbColor="white"
      />
    </Row>
  );

  return (
    <SafeAreaWrapper>
      <Container withPadding>
        <Column>
          <Row
            justify="space-between"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            <Heading level="h1">Notifications</Heading>

            <ModernButton
              variant="text"
              text="Cancel"
              onPress={() => router.back()}
            />
          </Row>

          {/* Push notifications */}
          <ModernCard style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h3" gutterBottom>
              Push Notifications
            </Heading>

            {renderToggleSetting(
              "Enable Push Notifications",
              "Receive notifications on your device",
              pushEnabled,
              setPushEnabled
            )}

            {pushEnabled && (
              <>
                <Divider style={{ marginVertical: theme.spacing.sm }} />

                {renderToggleSetting(
                  "Conversation Updates",
                  "Get notified about new messages and conversation updates",
                  conversationAlerts,
                  setConversationAlerts
                )}

                {renderToggleSetting(
                  "Achievements",
                  "Get notified when you earn new achievements",
                  achievementAlerts,
                  setAchievementAlerts
                )}

                {renderToggleSetting(
                  "Marketplace",
                  "Get notified about marketplace activity",
                  marketplaceAlerts,
                  setMarketplaceAlerts
                )}

                {renderToggleSetting(
                  "Sound",
                  "Play sounds for notifications",
                  soundEnabled,
                  setSoundEnabled
                )}
              </>
            )}
          </ModernCard>

          {/* Email notifications */}
          <ModernCard style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h3" gutterBottom>
              Email Notifications
            </Heading>

            {renderToggleSetting(
              "Weekly Digest",
              "Receive a weekly summary of your activity",
              emailDigest,
              setEmailDigest
            )}
          </ModernCard>

          <Spacer size="lg" />

          {/* Save button */}
          <ModernButton
            text="Save Settings"
            variant="solid"
            iconName="save-outline"
            onPress={handleSaveSettings}
          />
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}
