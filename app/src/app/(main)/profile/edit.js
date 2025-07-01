import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { updateUserProfile } from "../../../shared/api/authApi";
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

const { width } = Dimensions.get("window");

/**
 * Edit Profile Screen
 * Allows users to edit their profile information
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  // State for form fields
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || null
  );
  const [isLoading, setIsLoading] = useState(false);

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

  // Convert image to base64
  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }

    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    try {
      setIsLoading(true);

      const profileData = {
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      };

      // Add profile picture if it's been changed
      if (profilePicture && profilePicture !== user?.profilePicture) {
        profileData.profilePicture = profilePicture;
      }

      const updatedUser = await updateUserProfile(profileData);

      // Update the user context with the new data
      if (updatedUser) {
        updateUser(updatedUser);
      }

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select profile picture
  const handleSelectProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Convert to base64
        const base64Image = await convertImageToBase64(imageUri);
        setProfilePicture(base64Image);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
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
                backgroundColor: theme.colors.brandWhite,
              }}
            >
              <Column>
                <Text variant="caption" weight="medium" color="neutral.600">
                  PROFILE
                </Text>
                <Heading
                  level="h2"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  Edit Profile
                </Heading>
              </Column>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: theme.colors.neutral[600],
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  CANCEL
                </Text>
              </TouchableOpacity>
            </Row>

            <Spacer size="md" />

            {/* Profile Picture Card */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  elevation: 0,

                  padding: theme.spacing.lg,
                  alignItems: "center",
                  marginBottom: theme.spacing.md,
                }}
              >
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      shadowColor: theme.colors.brandNavy,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      borderRadius: 60,
                      borderWidth: 3,
                      borderColor: theme.colors.brandWhite,
                    }}
                  >
                    {profilePicture ? (
                      <Image
                        source={{ uri: profilePicture }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                          backgroundColor: theme.colors.brandGreen,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 48,
                            color: theme.colors.brandWhite,
                            fontFamily: theme.typography.fontFamily.bold,
                          }}
                        >
                          {displayName.charAt(0) || username.charAt(0) || "U"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.colors.brandGreen,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: theme.colors.brandWhite,
                    }}
                    onPress={handleSelectProfilePicture}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={theme.colors.brandWhite}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSelectProfilePicture}
                  style={{ marginTop: theme.spacing.md }}
                >
                  <Text
                    style={{
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.medium,
                    }}
                  >
                    Change Profile Picture
                  </Text>
                </TouchableOpacity>
              </ModernCard>
            </View>

            {/* Form Fields */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                variant="outlined"
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
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
                  PERSONAL INFORMATION
                </Text>

                {/* Display Name */}
                <View style={{ marginBottom: theme.spacing.md }}>
                  <Text
                    weight="medium"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.medium,
                      marginBottom: 8,
                    }}
                  >
                    Display Name
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.neutral[200],
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      fontSize: 16,
                      fontFamily: theme.typography.fontFamily.regular,
                      color: theme.colors.brandNavy,
                      backgroundColor: theme.colors.neutral[50],
                    }}
                    placeholder="Enter your display name"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </View>

                {/* Username */}
                <View style={{ marginBottom: theme.spacing.md }}>
                  <Text
                    weight="medium"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.medium,
                      marginBottom: 8,
                    }}
                  >
                    Username
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.neutral[200],
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      fontSize: 16,
                      fontFamily: theme.typography.fontFamily.regular,
                      color: theme.colors.brandNavy,
                      backgroundColor: theme.colors.neutral[50],
                    }}
                    placeholder="Enter your username"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                {/* Bio */}
                <View>
                  <Text
                    weight="medium"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.medium,
                      marginBottom: 8,
                    }}
                  >
                    Bio
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.neutral[200],
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      fontSize: 16,
                      fontFamily: theme.typography.fontFamily.regular,
                      color: theme.colors.brandNavy,
                      backgroundColor: theme.colors.neutral[50],
                      height: 100,
                      textAlignVertical: "top",
                    }}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                  />
                </View>
              </ModernCard>
            </View>

            {/* Save Button */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.colors.brandGreen,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Row align="center">
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.brandWhite}
                    />
                  ) : (
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color={theme.colors.brandWhite}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandWhite,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Text>
                </Row>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View
                style={{
                  alignItems: "center",
                  paddingHorizontal: theme.spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.regular,
                  }}
                >
                  Updating your profile...
                </Text>
              </View>
            )}

            {/* Bottom Padding for Floating Tab Bar */}
            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
