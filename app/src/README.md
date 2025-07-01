# UNextDoor App Structure

This document outlines the structure and organization of the UNextDoor mobile application.

## Directory Structure

The application follows a feature-based organization with shared components and utilities:

```
/src
  /app                 # Expo Router app directory
    /(auth)            # Authentication routes
    /(main)            # Main app routes
    _layout.js         # Root layout with providers
    index.js           # Entry point
  
  /assets              # Static assets (images, fonts, etc.)
  
  /features            # Feature modules
    /auth              # Authentication feature
      /components      # Auth-specific components
      /hooks           # Auth-specific hooks
      /screens         # Auth screens
      /services        # Auth services and state management
    
    /tutor             # AI Tutor feature (to be implemented)
      /components
      /hooks
      /screens
      /services
    
    /marketplace       # Marketplace feature (to be implemented)
      /components
      /hooks
      /screens
      /services
  
  /shared              # Shared code across features
    /components        # Reusable UI components
    /hooks             # Reusable hooks
    /services          # Core services (API, storage, etc.)
    /styles            # Global styles and theme
    /utils             # Utility functions
```

## Best Practices

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each component, service, and utility has a single responsibility
   - Components focus on rendering UI, services handle business logic

2. **Open/Closed Principle (OCP)**
   - Components are designed to be extended without modification
   - Use composition and props for customization

3. **Liskov Substitution Principle (LSP)**
   - Components with similar interfaces can be substituted for each other
   - Consistent prop patterns across related components

4. **Interface Segregation Principle (ISP)**
   - Components only depend on props they actually use
   - Break down complex interfaces into smaller, focused ones

5. **Dependency Inversion Principle (DIP)**
   - High-level modules don't depend on low-level modules
   - Both depend on abstractions (hooks, contexts)

### DRY (Don't Repeat Yourself)

- Shared components for common UI patterns
- Utility functions for repeated logic
- Custom hooks for reusable stateful logic
- Consistent error handling and validation

### Code Style

- Consistent naming conventions
  - PascalCase for components
  - camelCase for variables, functions, and instances
  - UPPER_CASE for constants
- Descriptive, meaningful names
- JSDoc comments for functions and components
- Organized imports (React, third-party, local)

### State Management

- Redux for global state (auth, user data)
- Local state with useState for component-specific state
- Context API for theme and feature-specific state
- Async storage for persistence

### Form Handling

- React Hook Form for form state management
- Zod for schema validation
- Consistent error display
- Proper loading states

### Error Handling

- Centralized error handling utilities
- User-friendly error messages
- Proper error boundaries
- Consistent error UI components

### Performance

- Memoization with useMemo and useCallback
- Avoid unnecessary re-renders
- Optimize list rendering
- Lazy loading of components

## Authentication Flow

1. Email Input → OTP Verification → (Registration if new user) → Home
2. Social Login (Google/Apple) → Home

## Styling Approach

- Theme-based styling with consistent colors, spacing, and typography
- Responsive layouts using flexbox
- Platform-specific adaptations where needed
- Consistent component styling

## Testing Strategy

- Unit tests for utilities and services
- Component tests for UI components
- Integration tests for key user flows
- E2E tests for critical paths
