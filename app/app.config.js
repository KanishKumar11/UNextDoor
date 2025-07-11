// Define the configuration directly
const config = {
  name: "UNextDoor",
  slug: "UNextDoor",
  version: "1.0.2", // bumped version for production
  orientation: "portrait",
  icon: "./src/assets/app-logo-square.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/app-logo-square.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
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
    },
  },
  runtimeVersion: "1.0.2", // keep in sync with version
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/app-logo-square.png",
      backgroundColor: "#ffffff",
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
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
  },
  web: {
    favicon: "./src/assets/app-logo-square.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
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
        iosClientId: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
        androidClientId: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
        webClientId: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
      },
    ],
  ],
  scheme: "UNextDoor",
  experiments: {
    tsconfigPaths: true,
  },
};

export default config;
