# UNextDoor Project

## Project Overview

UNextDoor is a dual-purpose platform consisting of:

1. **Marketplace App**: A peer-to-peer marketplace for buying and selling products
2. **AI-Powered Korean Language Tutor**: An interactive language learning system teaching Korean in English

This document outlines the development roadmap for the mobile applications (Android and iOS) as the initial phase of the project.

## Current Status

The project is currently in Phase 3 of development, focusing on enhancing the AI tutor with advanced features and gamification elements. The authentication system is fully implemented, and the core real-time conversation functionality using WebRTC and OpenAI's Realtime API is working. The Match the Word game has been completed with vocabulary mastery tracking and spaced repetition learning.

### Backend Infrastructure

- ✅ Enhanced configuration system with environment validation
- ✅ Improved database connection with retry mechanism
- ✅ Robust error handling and logging
- ✅ API versioning and health check endpoints
- ✅ Enhanced security with proper validation

### Authentication System

- ✅ Complete authentication flow with email, OTP/magic link
- ✅ User registration with validation
- ✅ JWT-based authentication with access and refresh tokens
- ✅ Token refresh mechanism
- ✅ Social authentication (Google, Apple)
- ✅ Role-based authorization
- ✅ User profile management

### AI Tutor Module

- ✅ Basic project structure and configuration
- ✅ Backend API foundation
- ✅ Conversation interface with AI tutor
- ✅ Realtime conversation with WebRTC and OpenAI
- ✅ Speech recognition and pronunciation feedback with accent improvement
- ✅ Grammar and vocabulary analysis with personalized feedback
- 🔄 Progress tracking system
- ✅ Achievement and gamification system with XP and level progression
- ✅ Memory card games for vocabulary learning with mastery tracking

### Marketplace Module

- ✅ User profiles and authentication
- ⏳ Product listings and search (not started)
- ⏳ Messaging system (not started)
- ⏳ Transaction processing (not started)
- ⏳ Reviews and ratings (not started)

### Current Development Focus

1. ✅ Enhanced authentication system with refresh tokens
2. ✅ Implement AI tutor conversation interface
3. ✅ Develop WebRTC integration with OpenAI's Realtime API
4. ✅ Ensure backend-first architecture for all features
5. ✅ Implement memory card games for vocabulary learning with mastery tracking
6. 🔄 Enhance gamification elements with achievements and progress tracking
7. 🔄 Improve audio device management for better user experience

Legend:

- ✅ Completed
- 🔄 In progress
- ⏳ Planned

## Project Scope

- **Project Name**: UNextDoor
- **Platforms**: Mobile (Android & iOS)
- **Development Budget**: ₹45,000 (for mobile app)
- **Total Project Budget**: ₹1,17,000
- **Project Structure**: Expo app located in `/app/` folder

## Technical Stack

### Frontend (Mobile)

- **Framework**: React Native
  - **UI Library**: Gluestack
  - **Navigation**: Expo Router
  - **State Management**: Redux Toolkit
  - **Forms**: React hook form with Zod validation

### UI Design System

- **Design Principles**:

  - Modern, clean aesthetic with minimal elevation
  - Consistent spacing and typography
  - Accessible color contrast ratios
  - Responsive layouts for different screen sizes

- **Color System**:
  - Primary colors defined as variables
  - Secondary and accent colors
  - Neutral color palette for backgrounds and text
  - Semantic colors for success, warning, error states
  - Dark mode support with alternate color variables

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **API Architecture**: RESTful with JWT authentication
- **Containerization**: Docker for easy deployment and scaling

### Database

- **Primary Database**: PostgreSQL
- **Storage**: Self-hosted storage solution for images and media
- **Authentication**: Custom JWT-based authentication system
- **API Access**: RESTful API with realtime features for communication

### AI & Voice Integration

- **NLP**: OpenAI API (GPT-4o, GPT-4o-mini)
- **Speech Recognition**: OpenAI Whisper via Realtime API
- **Text-to-Speech**: OpenAI TTS via Realtime API
- **Real-time Communication**: WebRTC with OpenAI's Realtime API

### Payment Processing

- **Gateway**: Stripe

### DevOps

- **CI/CD**: GitHub Actions
- **Hosting**: Self-hosted on VPS
- **Containerization**: Docker Compose for multi-container applications

## System Architecture

### Backend-First Approach

The application follows a strict backend-first architecture where nearly all business logic and data processing is handled by the backend server. This approach is critical for future web compatibility and offers several key advantages:

1. **Cross-Platform Compatibility**: By keeping maximum functionality in the backend, we can easily support multiple client platforms (mobile, web) with minimal code duplication. The frontend acts primarily as a presentation layer.

2. **Enhanced Security**: All sensitive operations and API keys are kept on the server, away from client-side code that could be reverse-engineered. No sensitive API calls are made directly from the mobile client.

3. **Centralized Business Logic**: Core application logic is maintained in one place, making it easier to update and maintain. This includes authentication, data processing, and integration with third-party services.

4. **Improved Performance**: Heavy processing tasks are offloaded to the server, keeping the mobile client lightweight and responsive. This is especially important for AI and speech recognition features.

5. **Seamless Web Version Development**: The same backend can serve both mobile and future web clients with minimal changes. By keeping logic in the backend, the web version can be developed rapidly by creating only the necessary frontend components.

6. **Simplified API Integration**: All third-party API integrations (OpenAI, Vapi) are handled exclusively by the backend, avoiding mobile-specific implementation challenges and bundling issues with Node.js dependencies.

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Mobile Client  │◄───►│  Backend API    │◄───►│   PostgreSQL    │
│  (React Native) │     │  (Node/Express) │     │    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                      │
         │                       │                      │
         ▼                       ▼                      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   WebRTC        │     │    OpenAI       │     │    Payment      │
│   Connection    │◄───►│    Realtime API │     │    Gateway      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Module Design

### 1. User Authentication Module

- **Components**:

  - Authentication Screen (Email input)
  - OTP Verification / Magic Link
  - Registration Flow (for new users)
  - Profile Setup with Username
  - Modern UI with aesthetic design

- **Services**:

  - AuthService (Custom JWT Authentication)
  - UserProfileService

- **Data Models**:
  - User
  - UserProfile
  - UserPreferences

### 2. Marketplace Module

- **Components**:

  - Product Listing Screen
  - Product Detail Screen
  - Search & Filter Component
  - Category Browser
  - Product Creation Form
  - Chat Interface
  - Rating & Review System
  - Payment Processing Screen

- **Services**:

  - ProductService
  - SearchService
  - ChatService
  - RatingService
  - PaymentService

- **Data Models**:
  - Product
  - Category
  - Chat
  - Message
  - Rating
  - Transaction

### 3. AI Korean Language Tutor Module

- **Components**:

  - **Conversation Interface**

    - Voice Input Component (with recording indicators)
    - AI Response Display (with typing animation)
    - Conversation History Viewer
    - Quick Response Suggestions
    - Emotion/Context Indicators
    - Voice Playback Controls

  - **Pronunciation Feedback Display**

    - Waveform Visualization
    - Phoneme Comparison Charts
    - Mispronunciation Highlighter
    - Pronunciation Score Card
    - Audio Example Player
    - Practice Mode Interface

  - **Grammar Correction Interface**

    - Real-time Error Detection
    - Correction Suggestions Panel
    - Grammar Rule Explanations
    - Alternative Phrasing Options
    - Common Mistakes Tracker
    - Difficulty Level Indicator

  - **Scenario Selection Screen**

    - Category-based Scenario Browser
    - Difficulty Level Filters
    - Scenario Preview Cards
    - Progress Indicators per Scenario
    - Recommended Scenarios Section
    - Custom Scenario Creator

  - **Progress Dashboard**

    - Overall Proficiency Score
    - Skill Breakdown Charts
    - Historical Progress Graphs
    - Weekly/Monthly Performance Reports
    - Learning Time Statistics
    - Weak Areas Identifier

  - **Achievement/Gamification UI**

    - Badge Collection Display
    - Level Progression System
    - Daily Streak Counter
    - Challenge Completion Tracker
    - Leaderboard Integration
    - Reward Notification System

  - **Learning Path Customization**
    - Learning Goals Selector
    - Proficiency Assessment Tool
    - Custom Schedule Creator
    - Focus Area Prioritization
    - Learning Style Preferences
    - Pace Adjustment Controls

- **Services**:

  - **SpeechRecognitionService**

    - Audio Capture & Processing
    - Vapi Integration for Speech Recognition
    - Real-time Transcription
    - Accent Detection

  - **TextToSpeechService**

    - Vapi Integration
    - Voice Style Selection
    - Speech Rate Control
    - Pronunciation Emphasis

  - **GrammarAnalysisService**

    - Error Detection Algorithms
    - Contextual Correction
    - Rule-based Suggestions
    - Learning Level Adaptation

  - **PronunciationAnalysisService**

    - Phoneme-level Comparison
    - Accent Evaluation
    - Rhythm & Intonation Analysis
    - Improvement Suggestions

  - **LearningPathService**

    - Personalized Curriculum Generation
    - Adaptive Difficulty Adjustment
    - Progress-based Recommendations
    - Learning Goal Tracking

  - **ProgressTrackingService**
    - Performance Metrics Collection
    - Statistical Analysis
    - Improvement Trend Detection
    - Personalized Reporting

- **Data Models**:

  - **Conversation**

    - userId, scenarioId, messages[], timestamp, duration, feedbackSummary

  - **LearningPath**

    - userId, currentLevel, goals[], focusAreas[], customizations, schedule

  - **Scenario**

    - scenarioId, title, description, difficulty, category, objectives[], dialogueExamples[]

  - **UserProgress**

    - userId, fluencyScore, grammarScore, pronunciationScore, vocabularyScore, historicalData[], weakAreas[]

  - **Achievement**

    - achievementId, userId, title, description, criteria, earnedDate, iconUrl

  - **FeedbackRecord**
    - feedbackId, userId, conversationId, grammarCorrections[], pronunciationFeedback[], vocabularySuggestions[], overallScore

## Database Design

### Supabase Tables

> **Note**: Tables are organized with AI Tutor tables first, followed by Marketplace tables, reflecting the development priority.

#### AI Tutor Tables

1. **users**

   - userId (document ID)
   - email
   - username (required, unique)
   - displayName
   - phoneNumber
   - createdAt
   - lastLogin
   - userType (learner/tutor/admin)
   - preferredLanguage
   - notificationSettings

2. **profiles**

   - userId (document ID)
   - bio
   - location
   - profilePicture
   - learningGoals
   - preferences
   - timezone

3. **learningPaths**

   - pathId (document ID)
   - userId
   - currentLevel (beginner/intermediate/advanced)
   - goals (array of learning objectives)
   - focusAreas (grammar/vocabulary/pronunciation/fluency)
   - customizations (learning style preferences)
   - schedule (preferred learning times)
   - createdAt
   - updatedAt

4. **scenarios**

   - scenarioId (document ID)
   - title
   - description
   - category (daily conversation/business/travel/etc)
   - difficulty (1-5 scale)
   - objectives (array of learning goals)
   - dialogueExamples (array of example conversations)
   - vocabularyList (key terms for the scenario)
   - createdAt

5. **conversations**

   - conversationId (document ID)
   - userId
   - scenarioId
   - messages (array of message objects with text/audio URLs)
   - audioRecordings (array of recording URLs)
   - duration (in seconds)
   - feedbackSummary (overall assessment)
   - timestamp
   - completionStatus

6. **userProgress**

   - progressId (document ID)
   - userId
   - fluencyScore
   - grammarScore
   - pronunciationScore
   - vocabularyScore
   - streakDays
   - xpPoints
   - levelProgress (percentage to next level)
   - historicalData (array of weekly progress snapshots)
   - weakAreas (identified improvement areas)
   - lastActiveDate

7. **achievements**

   - achievementId (document ID)
   - userId
   - title
   - description
   - category (streak/skill/completion)
   - criteria (requirements to earn)
   - iconUrl
   - earnedDate
   - displayOrder

8. **feedbackRecords**

   - feedbackId (document ID)
   - userId
   - conversationId
   - grammarCorrections (array of correction objects)
   - pronunciationFeedback (array of pronunciation issues)
   - vocabularySuggestions (array of vocabulary improvements)
   - overallScore
   - detailedMetrics (object with specific skill scores)
   - createdAt

9. **dailyChallenges**

   - challengeId (document ID)
   - title
   - description
   - difficulty
   - xpReward
   - type (speaking/listening/grammar/vocabulary)
   - content (challenge-specific data)
   - availableDate
   - expiryDate

#### Marketplace Collections

10. **products**

- productId (document ID)
- sellerId
- title
- description
- price
- category
- condition
- images (array of URLs)
- location
- status (available/sold/reserved)
- createdAt
- updatedAt

11. **chats**

- chatId (document ID)
- participants (array of userIds)
- productId (if related to a product)
- createdAt
- lastMessageAt

12. **messages**

- messageId (document ID)
- chatId
- senderId
- content
- timestamp
- readStatus

13. **transactions**

- transactionId (document ID)
- buyerId
- sellerId
- productId
- amount
- status
- paymentId
- createdAt

## API Design

### Authentication APIs

- `POST /api/auth/check-email` - Check if email exists and initiate authentication
- `POST /api/auth/send-otp` - Send OTP code and magic link to email
- `POST /api/auth/verify-otp` - Verify OTP code entered by user
- `POST /api/auth/verify-magic-link` - Verify magic link token
- `POST /api/auth/register` - Register new user with username and profile details
- `POST /api/auth/google-auth` - Authenticate with Google
- `GET /api/auth/profile` - Get user profile information
- `PUT /api/auth/profile` - Update user profile information
- `POST /api/auth/logout` - Logout user and invalidate tokens

### Marketplace APIs

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`
- `GET /api/search?q=query&filters=json`
- `GET /api/chats`
- `GET /api/chats/:id/messages`
- `POST /api/chats/:id/messages`
- `POST /api/ratings`
- `GET /api/users/:id/ratings`
- `POST /api/payments/initiate`
- `POST /api/payments/verify`

### AI Tutor APIs

- `POST /api/tutor/conversation` - Start or continue a conversation session
- `POST /api/tutor/analyze-speech` - Submit audio for pronunciation analysis
- `POST /api/tutor/analyze-grammar` - Analyze text for grammar corrections
- `GET /api/tutor/scenarios` - Get available conversation scenarios
- `GET /api/tutor/scenarios/:id` - Get specific scenario details
- `GET /api/tutor/progress` - Get user's overall learning progress
- `GET /api/tutor/progress/detailed` - Get detailed progress metrics
- `GET /api/tutor/achievements` - Get user's earned achievements
- `POST /api/tutor/complete-lesson` - Mark a lesson as completed
- `PUT /api/tutor/learning-path` - Update user's learning preferences
- `GET /api/tutor/daily-challenge` - Get today's learning challenge
- `POST /api/tutor/feedback` - Submit user feedback on lessons
- `GET /api/tutor/vocabulary/:level` - Get vocabulary words by proficiency level
- `POST /api/tutor/practice-session` - Record practice session statistics

## Mobile App Screens

### Common Screens

1. **Splash Screen**

   - Components:
     - Logo Animation
     - Loading Indicator
     - Version Display

2. **Onboarding Screens**

   - Components:
     - Onboarding Carousel
     - Page Indicator
     - Skip Button
     - Next/Previous Navigation
     - Get Started Button

3. **Authentication Flow**

   - Components:
     - Email Input Screen (first page)
       - Clean, minimal design with just email input field
       - "Continue with Email" Button
       - "Continue with Google" Button
     - Verification Screen
       - OTP Verification input
       - Magic Link option (sent simultaneously with OTP)
     - New User Registration Flow
       - Only shown if account not found
       - Username field (required)
       - Additional profile details
     - Modern Color Scheme with Variables
       - Consistent color palette defined as variables
       - Aesthetic UI with Minimal Elevation
       - Reduced shadows and subtle depth cues

4. **Main Tab Navigation**

   - Components:
     - Tab Bar with Five Primary Icons:
       1. AI Tutor - Direct language practice with adaptive AI (active)
       2. Dashboard - Learning hub with progress tracking (disabled with "Coming Soon" alert)
       3. Marketplace - Browse and list products for sale (active)
       4. Chats - Communication center for both tutoring and marketplace (disabled with "Coming Soon" alert)
       5. Profile - User settings and achievements (active)
     - Badge Notifications for new activities and achievements
     - Active Tab Indicator with subtle animation
     - Quick Action Floating Button for common tasks
     - Modern, minimal design with consistent color variables

5. **User Profile**

   - Components:
     - Profile Header
     - Avatar Upload
     - User Information Form
     - Achievement Badges
     - Activity History
     - Edit Profile Button

6. **Settings**

   - Components:
     - Settings List
     - Toggle Switches
     - Language Selector
     - Notification Preferences
     - Privacy Controls
     - Logout Button
     - App Version Info

7. **Notifications**
   - Components:
     - Notification List
     - Notification Card
     - Read/Unread Indicators
     - Timestamp
     - Clear All Button
     - Filter Options

### Marketplace Screens

1. **Home Feed**

   - Components:
     - Featured Products Carousel
     - Category Quick Access
     - Product Card Grid
     - Search Bar
     - Filter Button
     - Pull-to-Refresh
     - Infinite Scroll Loader

2. **Category Browser**

   - Components:
     - Category List/Grid
     - Category Card
     - Subcategory Navigation
     - Category Icon
     - Product Count Badge

3. **Search Results**

   - Components:
     - Search Input with Voice Search
     - Filter Panel
     - Sort Options
     - Results Count
     - Product List/Grid Toggle
     - No Results View

4. **Product Detail**

   - Components:
     - Image Gallery/Carousel
     - Price Display
     - Seller Information
     - Product Description
     - Condition Badge
     - Location Map
     - Contact Seller Button
     - Share Button
     - Similar Products

5. **Seller Profile**

   - Components:
     - Seller Rating
     - Verification Badge
     - Active Listings
     - Reviews List
     - Contact Options
     - Report User Button

6. **Chat List**

   - Components:
     - Chat Preview Card
     - Unread Message Indicator
     - Last Message Preview
     - Timestamp
     - Product Thumbnail
     - Search Chats Input

7. **Chat Detail**

   - Components:
     - Message Bubbles
     - Message Status Indicators
     - Text Input
     - Attachment Options
     - Product Reference Card
     - Offer Button
     - Typing Indicator

8. **Create Listing**

   - Components:
     - Photo Upload
     - Category Selector
     - Price Input with Currency
     - Condition Selector
     - Description Editor
     - Location Picker
     - Preview Button
     - Submit Button

9. **Edit Listing**

   - Components:
     - Current Photos with Delete Option
     - Form Pre-filled with Listing Data
     - Save Changes Button
     - Delete Listing Button
     - Status Toggle (Active/Inactive)

10. **Payment Process**

    - Components:
      - Order Summary
      - Payment Method Selector
      - Address Input
      - Secure Payment Badge
      - Terms Acceptance
      - Confirm Payment Button
      - Payment Status Indicator

11. **Transaction History**
    - Components:
      - Transaction List
      - Transaction Card
      - Status Badge
      - Receipt Download
      - Filter by Date/Status

### AI Tutor Screens

1. **Tutor Home**

   - Components:
     - Daily Progress Card
     - Recommended Scenarios
     - Continue Learning Button
     - Streak Calendar
     - Quick Practice Options
     - Recent Activity

2. **Conversation Interface**

   - Components:
     - Voice Input Button
     - Recording Indicator
     - Message Thread
     - AI Response Bubble
     - Typing Animation
     - Pronunciation Feedback Card
     - Grammar Correction Highlights
     - Voice Playback Controls
     - Emotion Indicators

3. **Scenario Selection**

   - Components:
     - Scenario Categories
     - Difficulty Filters
     - Scenario Cards
     - Progress Indicators
     - Completion Badges
     - Search Scenarios
     - Custom Scenario Creator

4. **Feedback Review**

   - Components:
     - Conversation Replay
     - Grammar Mistakes List
     - Pronunciation Score Card
     - Vocabulary Suggestions
     - Improvement Tips
     - Practice Exercises

5. **Progress Dashboard**

   - Components:
     - Proficiency Score Card
     - Skill Breakdown Chart
     - Progress Timeline
     - Weak Areas Highlight
     - Learning Time Statistics
     - Achievement Progress

6. **Achievement Gallery**

   - Components:
     - Badge Collection Grid
     - Achievement Details Card
     - Progress Indicators
     - Locked Achievement Preview
     - Reward Animation
     - Share Achievement Button

7. **Learning Path Customization**

   - Components:
     - Learning Goals Selector
     - Proficiency Assessment
     - Focus Area Toggles
     - Schedule Planner
     - Learning Style Preferences
     - Pace Adjustment Slider

8. **Daily Challenge**

   - Components:
     - Challenge Description
     - Timer
     - Difficulty Indicator
     - XP Reward Display
     - Challenge Content
     - Submit Answer Button
     - Results Feedback

9. **Memory Card Games**
   - Components:
     - Vocabulary Card Deck with animated visual cues
     - Flip Animation with sound effects and haptic feedback
     - Matching Pairs Interface with difficulty progression
     - Adaptive Difficulty Levels that adjust based on user performance
     - Topic-based Card Sets aligned with conversation scenarios
     - Comprehensive Progress Tracker with detailed analytics
     - Time Challenge Mode with competitive leaderboards
     - Spaced Repetition Scheduler optimized for long-term retention
     - Custom Deck Creator for personalized learning
     - Multiplayer Challenge Mode for social learning
     - Daily Vocabulary Challenges with bonus XP rewards
     - Visual Mastery Map showing vocabulary acquisition progress
     - Word Association Games for contextual learning
     - Pronunciation Practice integrated with card games
     - Streak Bonuses for consistent daily practice

## Development Roadmap

> **Note**: As per project requirements, the AI Tutor module will be developed first, followed by the Marketplace module.

### Phase 1: Setup & Authentication (2 weeks)

- Project initialization
- PostgreSQL database setup with Docker
- Authentication flows
  - Email input first page
  - OTP and Magic Link verification
  - Registration for new accounts
  - Username field implementation
- User profile management
  - Profile Setup
  - Profile Editing
  - Avatar Upload

### Phase 2: AI Korean Tutor Foundation (4 weeks) - COMPLETED

- Voice conversation interface
  - WebRTC integration for audio streaming
  - OpenAI Realtime API integration
  - Real-time conversation UI with audio visualization
- OpenAI API integration
  - GPT-4o for natural language understanding
  - OpenAI Whisper for speech recognition
  - OpenAI TTS for text-to-speech synthesis
- Korean language learning features
  - Pronunciation guidance for Korean phonemes
  - Basic vocabulary and phrases
  - Cultural context for language usage
- Progress tracking system
  - User progress database schema
  - Analytics dashboard components
  - Achievement tracking mechanism

### Phase 3: AI Korean Tutor Advanced Features (3 weeks) - IN PROGRESS

- Learning path customization - 70% COMPLETE
  - Personalized learning algorithms
  - Difficulty adjustment system
  - User preference settings
  - Adaptive AI that evolves with user progress
- Scenario-based learning - 80% COMPLETE
  - Multiple conversation scenarios in Korean
  - Role-playing interactions
  - Context-aware responses
  - Dynamic difficulty scaling based on user performance
- AI Adaptation System - 60% COMPLETE
  - Real-time proficiency assessment using NLP analysis of user responses
  - Korean vocabulary complexity adjustment that gradually introduces new words
  - Grammar correction sensitivity tuning with progressive difficulty
  - Speaking pace and complexity matching user level with natural conversation flow
  - Personalized feedback depth based on learning stage and confidence level
  - Emotional intelligence to detect user frustration or confidence
  - Korean-specific pronunciation guidance
  - Memory patterns analysis to reinforce challenging concepts
  - Learning style adaptation (visual, auditory, or kinesthetic approaches)
  - Korean cultural context awareness for relevant conversation scenarios
  - Progress-based curriculum adjustment that focuses on weak areas
  - Motivational coaching tailored to individual learning patterns
  - Adaptive questioning techniques based on Bloom's taxonomy
  - Personalized vocabulary recommendations from user conversations
- Gamification elements - 40% COMPLETE
  - XP and level system
  - Achievements and badges
  - Daily challenges and streaks
  - Memory card games for Korean vocabulary retention (PLANNED)
  - Spaced repetition learning system (PLANNED)
  - Competitive leaderboards (PLANNED)
  - Social learning challenges (PLANNED)
- Advanced pronunciation analysis - 50% COMPLETE
  - Korean phoneme-level feedback
  - Accent improvement suggestions
  - Intonation and rhythm analysis

### Phase 4: Marketplace Core (4 weeks)

- Product listing functionality
- Search & filter implementation
- Chat system
- User ratings & reviews

### Phase 5: Marketplace Advanced & Payment (3 weeks)

- Payment gateway integration
- Transaction management
- Advanced filtering and recommendations
- Location-based services

### Phase 6: Testing & Refinement (2 weeks)

- Comprehensive testing
  - AI Tutor module testing priority
  - Marketplace module testing
  - Cross-module integration testing
- Performance optimization
  - Speech recognition response time
  - Conversation latency reduction
  - Image loading and caching for marketplace
- UI/UX refinement
  - Usability testing feedback implementation
  - Accessibility improvements
  - Visual consistency across modules
- Bug fixes and stability improvements

## Common Functions & Utilities

### Authentication & User Management

- **User Authentication**

  - Login/Logout Functions
  - Social Authentication Integration
  - OTP Verification
  - Password Reset
  - Session Management

- **User Profile Management**
  - Profile Data CRUD Operations
  - Avatar Upload & Management
  - User Preferences Storage
  - Activity History Tracking

### UI/UX Utilities

- **Form Handling**

  - Input Validation
  - Error Messaging
  - Form Submission
  - Field Masking (phone, currency)

- **Navigation Helpers**

  - Deep Linking
  - Screen Transitions
  - Tab Management
  - Navigation History

- **Media Handling**

  - Image Picker
  - Camera Access
  - Image Compression
  - Media Preview
  - Gallery Management

- **Notifications**
  - Push Notification Management
  - In-App Notification Display
  - Notification Preferences
  - Badge Counters

### Data Management

- **API Communication**

  - Request/Response Handling
  - Error Handling
  - Caching Strategies
  - Offline Support
  - Retry Logic

- **Storage Utilities**

  - Local Storage Management
  - Secure Storage for Sensitive Data
  - Data Synchronization
  - Cache Management

- **State Management**
  - Global App State
  - Screen-level State
  - Persistence Helpers
  - State Restoration

### AI & Voice Processing

- **Speech Recognition**

  - Voice Recording
  - Speech-to-Text Processing
  - Language Detection
  - Accent Analysis

- **Text-to-Speech**

  - Voice Selection
  - Speech Rate Control
  - Pronunciation Emphasis
  - Audio Playback Controls

- **Natural Language Processing**
  - Text Analysis
  - Grammar Checking
  - Sentiment Analysis
  - Context Management

### Marketplace Utilities

- **Product Management**

  - Listing Creation/Editing
  - Image Management
  - Category Classification
  - Product Search & Filtering

- **Chat & Messaging**

  - Real-time Messaging
  - Message Status Tracking
  - Attachment Handling
  - Chat History Management

- **Payment Processing**
  - Payment Method Management
  - Transaction Processing
  - Receipt Generation
  - Payment Status Tracking

## Best Practices Checklist

To ensure we maintain high code quality and follow best practices throughout the development process, we've established the following checklist:

### Code Quality

- [ ] Consistent code formatting with ESLint and Prettier
- [ ] Meaningful variable and function names
- [ ] Proper error handling and logging
- [ ] Code comments for complex logic
- [ ] TypeScript migration for better type safety (future enhancement)

### Performance

- [ ] Lazy loading of components and assets
- [ ] Memoization for expensive computations
- [ ] Optimized list rendering with proper keys
- [ ] Image optimization and caching
- [ ] Minimize re-renders with proper state management

### Security

- [ ] Secure storage of sensitive information
- [ ] Input validation on both client and server
- [ ] Proper authentication and authorization
- [ ] Protection against common vulnerabilities (XSS, CSRF)
- [ ] Regular security audits

### Testing

- [ ] Unit tests for critical components and services
- [ ] Integration tests for key user flows
- [ ] End-to-end tests for critical paths
- [ ] Accessibility testing
- [ ] Performance testing

### User Experience

- [ ] Consistent design language
- [ ] Responsive layouts for different screen sizes
- [ ] Proper loading states and error messages
- [ ] Smooth animations and transitions
- [ ] Accessibility compliance

## Architecture & Code Quality

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)

- **Components**: Each component should have only one reason to change
  - UI components should only handle rendering and user interactions
  - Container components should only manage data flow and state
- **Services**: Each service should focus on a single domain or functionality
  - AuthService should only handle authentication
  - TokenService should only manage token operations
  - UserProfileService should only handle user profile data
- **Utilities**: Each utility function should perform a single, well-defined task

#### Open/Closed Principle (OCP)

- **Base Components**: Create extensible base components that can be extended without modification
  - BaseScreen for common screen behaviors
  - BaseForm for form handling
  - BaseList for list rendering
- **Service Abstractions**: Define service interfaces that can be extended but not modified
  - IAuthService interface with multiple implementations
  - IStorageService with different storage strategies

#### Liskov Substitution Principle (LSP)

- **Component Hierarchy**: Derived components must be substitutable for their base components
  - All form components should follow the same contract
  - All list components should behave consistently
- **Service Implementations**: Different implementations of the same service should be interchangeable
  - MockAuthService should be substitutable for FirebaseAuthService in tests

#### Interface Segregation Principle (ISP)

- **Component Props**: Define focused prop interfaces that don't force components to depend on props they don't use
  - Separate visual props from behavioral props
  - Use composition for complex components
- **Service Interfaces**: Create specific interfaces for different client needs
  - ReadOnlyUserService for components that only need to read user data
  - UserEditorService for components that need to modify user data

#### Dependency Inversion Principle (DIP)

- **Dependency Injection**: Components should depend on abstractions, not concrete implementations
  - Use React Context for service injection
  - Pass service interfaces as props or through hooks
- **Service Locator**: Implement a service locator pattern for accessing services
  - Create a ServiceProvider component at the app root
  - Use useService hook to access services

### Code Structure

- **Feature-based Organization**: Group related components, services, and models by feature

  ```
  /src
    /features
      /auth
        /components
        /services
        /hooks
        /models
        /screens
      /tutor
        /components
        /services
        /hooks
        /models
        /screens
      /marketplace
        /components
        /services
        /hooks
        /models
        /screens
    /shared
      /components
      /services
      /hooks
      /utils
  ```

- **Clean Architecture**: Separate business logic from UI and external services

  - Domain Layer: Business logic and models
  - Application Layer: Use cases and application logic
  - Infrastructure Layer: External services and APIs
  - Presentation Layer: UI components and screens

- **Atomic Design Pattern**: Organize components as atoms, molecules, organisms, templates, and pages
  ```
  /components
    /atoms        # Basic building blocks (Button, Input, Text)
    /molecules    # Combinations of atoms (Form Field, Search Bar)
    /organisms    # Complex UI sections (Navigation Bar, Product Card)
    /templates    # Page layouts without specific content
    /pages        # Complete screens with real content
  ```

### DRY (Don't Repeat Yourself)

- **Shared Components**: Create reusable components for common UI patterns

  - FormField component for all form inputs
  - Card component for consistent card styling
  - List component for rendering lists with common behaviors

- **Utility Functions**: Extract common logic into reusable utility functions

  - Form validation utilities
  - Date formatting utilities
  - Error handling utilities

- **Custom Hooks**: Create hooks for reusable stateful logic
  - useForm for form state management
  - useAPI for API calls with loading/error states
  - useAuth for authentication state and operations

### Performance Optimization

- Implement lazy loading for images and components
- Use memoization for expensive computations (React.memo, useMemo, useCallback)
- Optimize Firebase queries with proper indexing
- Implement virtualized lists for long scrolling screens
- Use proper React key props for efficient list rendering
- Implement code splitting for large feature modules

### Security Measures

- Implement proper authentication and authorization
- Secure API endpoints with JWT validation
- Store sensitive data in secure storage (using environment variables)
  - API keys stored only on server-side
  - Proper separation of client/server environment variables
- Implement input validation on both client and server using Zod
- Implement database access control
- Implement CORS protection for API endpoints
- Implement proper error handling that doesn't expose sensitive information
- Backend-first security approach
  - All sensitive operations performed on the server
  - Third-party API calls (OpenAI, Vapi) made from backend only
  - Client receives only necessary data after server-side processing
  - Server-side validation of all client requests

### Testing Strategy

- **Unit Tests**: Jest for business logic and services

  - Test each service method in isolation
  - Mock external dependencies
  - Focus on business logic correctness

- **Component Tests**: React Native Testing Library

  - Test component rendering and interactions
  - Verify component behavior with different props
  - Test component accessibility

- **Integration Tests**: Test interactions between components and services

  - Test form submission flows
  - Test authentication flows
  - Test data fetching and rendering

- **E2E Tests**: Detox for critical user flows

  - Test complete user journeys
  - Verify app behavior in real-world scenarios
  - Test on multiple device sizes

- **API Tests**: Supertest for backend endpoints
  - Test API request/response cycles
  - Verify error handling
  - Test authentication and authorization

### Accessibility

- Support dynamic text sizes
- Implement proper contrast ratios
- Add screen reader support
- Include alternative text for images
- Ensure keyboard navigation
- Implement focus management
- Test with accessibility tools

### Internationalization

- Implement i18n support from the beginning
- Extract all text to language files
- Support RTL languages
- Format dates, numbers, and currencies according to locale
- Support pluralization rules

## Deployment Strategy

### App Store Submission

- Prepare App Store assets (screenshots, descriptions)
- Configure App Store Connect
- Implement TestFlight for beta testing

### Google Play Submission

- Prepare Google Play Console assets
- Configure Play Store listing
- Implement internal testing tracks

### CI/CD Pipeline

- Automate builds with GitHub Actions
- Implement code quality checks
- Automate testing before deployment
- Configure automatic deployment to self-hosted VPS

## Maintenance Plan

- Regular dependency updates
- Monthly security audits
- Performance monitoring with Supabase monitoring tools
- Error logging and monitoring with server-side logging
- User feedback collection and analysis

## Project Structure

The project is organized as follows:

- **Root Directory**: Contains project documentation and configuration files
- **`/app/` Directory**: Contains the Expo React Native application
  - Mobile client implementation for both Android and iOS
  - UI components for both Marketplace and AI Tutor modules
  - State management and API integration

## Docker Setup

The project uses Docker for easy deployment and development environment setup:

```
# Docker Compose configuration
version: '3.8'

services:
  # Backend API service
  api:
    build: ./server
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - VAPI_API_KEY=${VAPI_API_KEY}
    depends_on:
      - postgres
    volumes:
      - ./server:/app
      - /app/node_modules

  # PostgreSQL database
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## WebSocket Implementation for Vapi Integration

To implement real-time communication with Vapi for the AI Tutor module, the following components need to be developed:

### Backend WebSocket Server

1. **WebSocket Server Setup**

   - Implement Socket.IO or ws library on the Express server
   - Set up authentication for WebSocket connections
   - Configure connection handling and error management

2. **Speech Recognition Streaming**

   - Create handlers for audio stream chunks from the client
   - Implement Vapi streaming API integration
   - Set up real-time transcription feedback

3. **Real-time Conversation**
   - Implement message handling for conversation
   - Set up typing indicators
   - Create feedback channels for grammar and pronunciation

### Frontend WebSocket Client

1. **WebSocket Connection Management**

   - Implement connection establishment and reconnection logic
   - Handle authentication for WebSocket connections
   - Manage connection state and error handling

2. **Audio Streaming**

   - Implement audio recording with streaming capability
   - Set up chunked audio transmission
   - Handle real-time transcription updates

3. **Real-time UI Updates**
   - Create components for displaying real-time feedback
   - Implement typing indicators
   - Set up pronunciation visualization

## Conclusion

This document outlines the comprehensive plan for developing UNextDoor mobile application, with Phase 1 focusing exclusively on the AI Korean Tutor module. The development will follow an iterative approach with regular client feedback at each milestone.

The AI Korean Tutor development will focus on creating a sophisticated language learning experience with real-time conversation capabilities using WebSockets and Vapi, providing immediate pronunciation feedback for Korean language learners, and delivering personalized learning paths. The authentication system features a modern, aesthetic UI with a streamlined flow starting with email input and supporting both OTP and magic link verification.

By following the outlined architecture, best practices, and development roadmap, we aim to deliver a high-quality product that meets all the specified requirements within the allocated budget and timeframe. The WebSocket integration will provide a more natural and responsive language learning experience, making the AI tutor more effective for users.
