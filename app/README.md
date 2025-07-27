# UNextDoor App

A React Native mobile application built with Expo.

## Features

- **AI Tutor**: Practice conversations with an AI language tutor
- **Real-time Voice Conversations**: Using Vapi SDK for natural voice interactions
- **Modern UI**: Clean, aesthetic design with smooth animations
- **Authentication**: Secure login with email, Google, and Apple

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd app
npm install
```

3. Start the development server:

```bash
npm start
```

## Project Structure

```
app/
├── src/
│   ├── app/                 # Expo Router app directory
│   │   ├── (auth)/          # Authentication routes
│   │   ├── (main)/          # Main app routes
│   │   └── _layout.js       # Root layout
│   ├── assets/              # Static assets
│   ├── features/            # Feature modules
│   │   ├── auth/            # Authentication feature
│   │   ├── tutor/           # AI Tutor feature
│   │   └── profile/         # User profile feature
│   └── shared/              # Shared code
│       ├── components/      # Reusable components
│       ├── context/         # React context providers
│       ├── hooks/           # Custom hooks
│       ├── services/        # API services
│       ├── styles/          # Shared styles
│       └── utils/           # Utility functions
├── app.json                 # Expo configuration
└── package.json             # Dependencies
```

## Key Components

### MicrophonePermission

The `MicrophonePermission` component handles microphone permission requests with a user-friendly UI. It's used to wrap components that require microphone access.

Usage:

```jsx
<MicrophonePermission
  onPermissionGranted={() => console.log("Permission granted")}
  onPermissionDenied={(error) => console.error("Permission denied:", error)}
>
  {/* Content that requires microphone access */}
  <YourComponent />
</MicrophonePermission>
```

### VapiClientComponent

The `VapiClientComponent` provides a real-time voice conversation experience using the Vapi SDK. It handles:

- Initializing the Vapi client
- Starting and ending calls
- Processing transcripts
- Displaying voice wave animations

### Audio Utilities

The `audioUtils.js` file provides a compatibility layer for audio functionality, making it easy to migrate from expo-av to expo-audio.

## Authentication Setup

### Apple Sign-In Configuration

Apple Sign-In is automatically configured for iOS devices. To complete the setup:

#### 1. Apple Developer Account Configuration

1. **Enable Sign In with Apple capability**:
   - Go to [Apple Developer Console](https://developer.apple.com/account/)
   - Navigate to Certificates, Identifiers & Profiles
   - Select your App ID and edit it
   - Enable "Sign In with Apple" capability

2. **Create a Service ID** (for web authentication):
   - Create a new Services ID
   - Configure it with your domain and return URLs

3. **Create a Private Key**:
   - Go to Keys section
   - Create a new key with "Sign In with Apple" enabled
   - Download the private key file (.p8)

#### 2. Server Configuration

Add these environment variables to your server `.env` file:

```bash
# Apple Sign-In Configuration
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=your-private-key-content
APPLE_BUNDLE_ID=com.UNextDoor.app
```

#### 3. App Configuration

The app is already configured with:
- `expo-apple-authentication` package
- Apple Sign-In plugin in `app.config.js`
- Proper entitlements and Info.plist configuration

#### 4. Testing

- Apple Sign-In only works on physical iOS devices or iOS Simulator with iOS 13+
- The feature is automatically available when running on iOS
- Users will see the "Continue with Apple" button on the login screen

### Google Sign-In Configuration

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google+ API
3. Create OAuth 2.0 credentials for your app
4. Update the client IDs in `app.config.js`:
   ```javascript
   plugins: [
     [
       "./plugins/withGoogleSignIn",
       {
         iosClientId: "your-ios-client-id.apps.googleusercontent.com",
         androidClientId: "your-android-client-id.apps.googleusercontent.com",
         webClientId: "your-web-client-id.apps.googleusercontent.com",
       },
     ],
   ]
   ```

## Permissions

The app requires the following permissions:

- **Microphone**: For voice conversations with the AI tutor
- **Internet**: For API communication

See [MICROPHONE_PERMISSIONS.md](./src/docs/MICROPHONE_PERMISSIONS.md) for details on how microphone permissions are handled.

## Styling

The app uses a modern design system with:

- Consistent spacing and typography
- A cohesive color palette
- Smooth animations
- Responsive layouts

## Development Guidelines

- Follow the existing folder structure
- Use functional components with hooks
- Follow SOLID and DRY principles
- Write meaningful comments
- Use TypeScript for new components when possible

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**: See [MICROPHONE_PERMISSIONS.md](./src/docs/MICROPHONE_PERMISSIONS.md)
2. **Expo Router Navigation Issues**: Make sure file names match the expected route names
3. **Vapi SDK Connection Issues**: Check your internet connection and API keys

## License

This project is proprietary and confidential.

## Contact

For questions or support, contact [support@UNextDoor.com](mailto:support@UNextDoor.com).
