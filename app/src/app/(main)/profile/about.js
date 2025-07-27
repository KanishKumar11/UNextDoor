import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
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
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { TUTOR_NAME } from "./../../../shared/constants/tutorConstants";
import { BRAND_COLORS } from "../../../shared/constants/colors";

const { width } = Dimensions.get("window");

/**
 * About Screen
 * Displays information about the app, version, and legal information
 */
export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  // App version from app.json
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode ||
    "1";

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // Open URL
  const openUrl = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL:", err)
    );
  };

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Modern Header Section */}
            <Row
              justify="space-between"
              align="center"
              style={{
                padding: theme.spacing.md,
                backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
              }}
            >
              <Column>
                <Text variant="caption" weight="medium" color="neutral.600">
                  INFORMATION
                </Text>
                <Heading
                  level="h2"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  About App
                </Heading>
              </Column>
            </Row>

            <Spacer size="md" />
            {/* App Info Card */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                variant="outlined"
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    shadowColor: BRAND_COLORS.OCEAN_BLUE,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    borderRadius: 60,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <Image
                    source={require("../../../assets/app-logo.png")}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                    }}
                    resizeMode="contain"
                  />
                </View>

                <Heading
                  level="h2"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.bold,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  UNextDoor
                </Heading>

                <Text
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.regular,
                    textAlign: "center",
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Your AI language tutor for real-world conversations
                </Text>

                <View
                  style={{
                    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "15",
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: BRAND_COLORS.SHADOW_GREY,
                      fontFamily: theme.typography.fontFamily.medium,
                    }}
                  >
                    Version {appVersion} (Build {buildNumber})
                  </Text>
                </View>
              </ModernCard>
            </View>

            <Spacer size="md" />

            {/* About the app */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  elevation: 0,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  ABOUT THE APP
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  UNextDoor
                </Heading>
                <Text
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.regular,
                    lineHeight: 20,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  UNextDoor is an innovative language learning app that uses
                  artificial intelligence to help you practice real-world
                  conversations. Our AI tutor, {TUTOR_NAME}, adapts to your learning
                  style and provides personalized feedback to help you improve
                  your language skills.
                </Text>
                <Text
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.regular,
                    lineHeight: 20,
                  }}
                >
                  Whether you're a beginner or an advanced learner, UNextDoor
                  offers a variety of scenarios and topics to help you gain
                  confidence in speaking a new language.
                </Text>
              </ModernCard>
            </View>

            {/* Features */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  elevation: 0,

                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  KEY FEATURES
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  What Makes Us Special
                </Heading>

                {/* Feature Items */}
                <View style={{ marginBottom: 12 }}>
                  <Row align="center" style={{ marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name="chatbubbles"
                        size={16}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      />
                    </View>
                    <Text
                      weight="medium"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      Real-time AI Conversations
                    </Text>
                  </Row>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Row align="center" style={{ marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name="school"
                        size={16}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      />
                    </View>
                    <Text
                      weight="medium"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      Adaptive Learning System
                    </Text>
                  </Row>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Row align="center" style={{ marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name="trophy"
                        size={16}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      />
                    </View>
                    <Text
                      weight="medium"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      Achievement System
                    </Text>
                  </Row>
                </View>
              </ModernCard>
            </View>

            {/* Legal Information */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  elevation: 0,

                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  LEGAL
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Legal Information
                </Heading>

                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.neutral[100],
                  }}
                  onPress={() => openUrl("https://UNextDoor.app/terms")}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={16}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        Terms of Service
                      </Text>
                    </Row>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.neutral[100],
                  }}
                  onPress={() => openUrl("https://UNextDoor.app/privacy")}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={16}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        Privacy Policy
                      </Text>
                    </Row>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ paddingVertical: 12 }}
                  onPress={() => openUrl("https://UNextDoor.app/licenses")}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="code-slash-outline"
                          size={16}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        Open Source Licenses
                      </Text>
                    </Row>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>
              </ModernCard>
            </View>

            {/* Developer Information */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  elevation: 0,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  DEVELOPER
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Developed by
                </Heading>

                {/* Developer Profile */}
                <Row align="center" style={{ marginBottom: theme.spacing.md }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        color: BRAND_COLORS.WHISPER_WHITE,
                        fontSize: 24,
                        fontFamily: theme.typography.fontFamily.bold,
                      }}
                    >
                      K
                    </Text>
                  </View>
                  <Column style={{ marginLeft: -16, justifyContent: "center" }}>
                    <Text
                      weight="semibold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 18,
                        lineHeight: 14,
                        marginBottom: -10,
                      }}
                    >
                      Kanish Kumar
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.neutral[600],
                        fontSize: 14,
                        fontFamily: theme.typography.fontFamily.medium,
                        // marginBottom: 4,
                      }}
                    >
                      Freelance Full Stack Developer
                    </Text>
                    {/* <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Specialized in React Native & AI Integration
                    </Text> */}
                  </Column>
                </Row>

                {/* Contact Information */}
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.neutral[100],
                  }}
                  onPress={() => openUrl("mailto:hey@kanishkumar.in")}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={16}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        hey@kanishkumar.in
                      </Text>
                    </Row>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ paddingVertical: 12 }}
                  onPress={() => openUrl("https://kanishkumar.in")}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="globe-outline"
                          size={16}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        kanishkumar.in
                      </Text>
                    </Row>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>
              </ModernCard>
            </View>

            {/* Social Media */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 16,
                  elevation: 0,

                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  CONNECT
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Follow Us
                </Heading>

                <Row justify="space-around">
                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() =>
                      openUrl("https://x.com/UNextDoorapp")
                    }
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: BRAND_COLORS.SKY_AQUA,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      {/* <Ionicons
                        name="x-twitter"
                        size={24}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      /> */}
                      <FontAwesome6
                        name="x-twitter"
                        size={24}
                        color={BRAND_COLORS.WHISPER_WHITE} />
                    </View>
                    <Text
                      variant="caption"
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      X (Twitter)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() =>
                      openUrl("https://instagram.com/UNextDoorapp")
                    }
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: BRAND_COLORS.WARM_CORAL,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name="logo-instagram"
                        size={24}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      />
                    </View>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Instagram
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() =>
                      openUrl("https://facebook.com/UNextDoorapp")
                    }
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: BRAND_COLORS.OCEAN_BLUE,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name="logo-facebook"
                        size={24}
                        color={BRAND_COLORS.WHISPER_WHITE}
                      />
                    </View>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Facebook
                    </Text>
                  </TouchableOpacity>
                </Row>
              </ModernCard>
            </View>

            {/* Footer */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.regular,
                  textAlign: "center",
                  marginBottom: theme.spacing.md,
                }}
              >
                © {new Date().getFullYear()} UNextDoor. All rights reserved.
              </Text>
            </View>

            {/* Bottom Padding for Floating Tab Bar */}
            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
