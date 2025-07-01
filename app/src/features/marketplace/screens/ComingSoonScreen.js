import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
  Text,
  Heading,
  ModernCard,
  Spacer,
  Column,
  Row,
} from "../../../shared/components";

/**
 * ComingSoonScreen component
 * A placeholder screen for the marketplace feature that is coming soon
 */
const ComingSoonScreen = () => {
  const { theme } = useTheme();

  return (
    <Container withPadding>
      <Column align="center" justify="center" style={{ flex: 1 }}>
        <ModernCard style={{ width: "100%", padding: 24 }}>
          <Column align="center">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary[100],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="construct-outline"
                size={40}
                color={theme.colors.primary[500]}
              />
            </View>

            <Heading level="h2" align="center" gutterBottom>
              Coming Soon
            </Heading>

            <Text align="center" style={{ marginBottom: 16 }}>
              We're working hard to bring you an amazing marketplace experience.
              This feature will be available in the next update.
            </Text>

            <Row justify="center" align="center">
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.neutral[500]}
                style={{ marginRight: 8 }}
              />
              <Text variant="caption" color="neutral.500">
                Under Development
              </Text>
            </Row>
          </Column>
        </ModernCard>

        <Spacer size="xl" />

        <Text variant="caption" color="neutral.400" align="center">
          Check back soon for updates!
        </Text>
      </Column>
    </Container>
  );
};

export default ComingSoonScreen;
