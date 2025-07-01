import React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Box,
  Center,
  VStack,
  Image,
  Heading,
  Text,
  SafeAreaView,
} from "@gluestack-ui/themed";
import { IMAGES } from "../../assets/index";

/**
 * Layout component for authentication screens
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Screen title
 * @param {string} props.subtitle - Screen subtitle
 * @returns {React.ReactNode} AuthLayout component
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <SafeAreaView flex={1} bg="$white">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Center flex={1} p="$5" width="$full">
            <VStack space="xl" width="$full" maxWidth={400}>
              {/* Logo */}
              <Center>
                {IMAGES.APP_LOGO ? (
                  <Image
                    source={IMAGES.APP_LOGO}
                    alt="App Logo"
                    width={120}
                    height={120}
                    mb="$4"
                    resizeMode="contain"
                  />
                ) : (
                  <Box
                    width={80}
                    height={80}
                    borderRadius="$full"
                    bg="$primary100"
                    alignItems="center"
                    justifyContent="center"
                    mb="$4"
                  >
                    <Text fontSize="$4xl" color="$primary500">
                      TND
                    </Text>
                  </Box>
                )}
              </Center>

              {/* Title and subtitle */}
              <VStack space="xs" mb="$6">
                <Heading size="2xl" textAlign="center">
                  {title}
                </Heading>
                {subtitle && (
                  <Text size="md" textAlign="center" color="$neutral600">
                    {subtitle}
                  </Text>
                )}
              </VStack>

              {/* Form content */}
              {children}
            </VStack>
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default AuthLayout;
