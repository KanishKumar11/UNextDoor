import React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { IMAGES } from "../../assets/index";
import modernTheme from "../styles/modernTheme";
import { Text, Heading } from "./typography";

/**
 * ModernAuthLayout component
 * A modern layout component for authentication screens
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Screen title
 * @param {string} props.subtitle - Screen subtitle
 * @param {boolean} props.showBackButton - Whether to show back button
 * @param {Function} props.onBackPress - Back button press handler
 * @param {boolean} props.showLogo - Whether to show the logo
 * @param {Object} props.style - Additional styles
 */
const ModernAuthLayout = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  showLogo = true,
  style,
  ...props
}) => {
  const router = useRouter();

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={modernTheme.colors.text.primary}
                onPress={handleBackPress}
              />
            </View>
          )}

          <View style={[styles.content, style]} {...props}>
            {/* Logo */}
            {showLogo && (
              <View style={styles.logoContainer}>
                {IMAGES.APP_LOGO ? (
                  <Image
                    source={IMAGES.APP_LOGO}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.fallbackLogo}>
                    <Text
                      size="2xl"
                      weight="bold"
                      color={modernTheme.colors.primary[700]}
                    >
                      TND
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Title and subtitle */}
            <View style={styles.headerContainer}>
              {title && (
                <Heading level="h2" align="center" gutterBottom>
                  {title}
                </Heading>
              )}

              {subtitle && (
                <Text
                  variant="caption"
                  align="center"
                  color={modernTheme.colors.text.secondary}
                  style={styles.subtitle}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Form content */}
            <View style={styles.formContainer}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: modernTheme.colors.background.default,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButtonContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: modernTheme.spacing.xl,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: modernTheme.spacing.xl,
    marginTop: modernTheme.spacing.xl,
  },
  logo: {
    width: 200,
    height: 150,
  },
  fallbackLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: modernTheme.colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    width: "100%",
    marginBottom: modernTheme.spacing.xl,
  },
  subtitle: {
    marginTop: modernTheme.spacing.xs,
  },
  formContainer: {
    width: "100%",
  },
});

export default ModernAuthLayout;
