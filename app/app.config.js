// Import color constants
import { BRAND_COLORS } from "./src/shared/constants/colors";

// Define the configuration directly
const config = {
  name: "UNextDoor",
  slug: "UNextDoor",
  version: "1.0.7", // bumped version for production
  orientation: "portrait",
  icon: "./src/assets/app-logo-square.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/app-logo-square.png",
    resizeMode: "contain",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant
  },
  extra: {
    eas: {
      projectId: "5333d054-4ac2-4e59-af0f-b72abfe0ea6e"
    }
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    simulator: true,
    supportsTablet: true,
    bundleIdentifier: "com.UNextDoor.app",
    bitcode: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription: "This app needs access to your photo library to allow you to upload and select photos for your profile and other features.",
      NSCameraUsageDescription: "Allow UNextDoor to access your camera for video conversations",
      NSMicrophoneUsageDescription: "Allow UNextDoor to access your microphone for voice conversations",
      NSLocationWhenInUseUsageDescription: "Allow UNextDoor to access your location for location-based features",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSExceptionMinimumTLSVersion: "1.0",
            NSExceptionRequiresForwardSecrecy: false,
          },
        },
      },
    },
  },
  runtimeVersion: "1.0.7", // keep in sync with version
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/app-logo-square.png",
      backgroundColor: "#FAFAFA", // Whisper White
    },
    package: "com.UNextDoor.app",
    allowBackup: true,
    softwareKeyboardLayoutMode: "pan",
    compileSdkVersion: 34,
    targetSdkVersion: 34,
    buildToolsVersion: "34.0.0",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.CHANGE_NETWORK_STATE",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.INTERNET",
      "android.permission.BLUETOOTH",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      // Removed READ/WRITE external storage permissions because Android 13+
      // uses scoped media permissions (READ_MEDIA_*) and the app should
      // request media access at runtime or use the Android Photo Picker.
      // See https://developer.android.com/about/versions/13/behavior-changes-13
    ],
  },
  web: {
    favicon: "./src/assets/app-logo-square.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication",
    "./plugins/withAppleSignIn",
    [
      "@config-plugins/react-native-webrtc",
      {
        cameraPermission:
          "Allow UNextDoor to access your camera for video conversations",
        microphonePermission:
          "Allow UNextDoor to access your microphone for voice conversations",
      },
    ],
    [
      "./plugins/withGoogleSignIn",
      {
        iosClientId: "670102459133-vr2l1a5hfq84k817lmuj6sprkhkrdotc.apps.googleusercontent.com",
        androidClientId: "670102459133-7bq03aetjs4q5cp5ljl610cbjstnbmeg.apps.googleusercontent.com",
        webClientId: "670102459133-rde3n2655fu9r5sonqfilg1hl635fa3h.apps.googleusercontent.com",
      },
    ],
  ],
  scheme: "UNextDoor",
  experiments: {
    tsconfigPaths: true,
  },
};

export default config;
