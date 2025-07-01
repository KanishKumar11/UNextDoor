// Define the configuration directly
const config = {
  name: "UNextDoor",
  slug: "UNextDoor",
  version: "1.0.0",
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
    },
  },
  runtimeVersion: "1.0.0",
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
  ],
  scheme: "UNextDoor",
  experiments: {
    tsconfigPaths: true,
  },
};

export default config;
