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
