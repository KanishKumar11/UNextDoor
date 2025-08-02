/**
 * Navigation Cleanup Tests
 * Tests for the navigation event handling and session cleanup fixes
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PersistentConversationView from '../PersistentConversationView';

// Mock the WebRTC hook
const mockWebRTCHook = {
  isInitialized: true,
  isConnected: false,
  isSessionActive: false,
  isAISpeaking: false,
  audioOutputDevice: 'speaker',
  currentScenario: null,
  connectionState: 'disconnected',
  error: null,
  userEndedSession: false,
  allowAutoRestart: true,
  conversationHistory: [],
  currentAITranscript: '',
  startSession: jest.fn(),
  stopSession: jest.fn(),
  changeScenario: jest.fn(),
  stopSessionByUser: jest.fn(),
  resetSessionControlFlags: jest.fn(),
  clearAllData: jest.fn(),
  isConnecting: false,
  isDisconnected: true,
};

jest.mock('../../hooks/useWebRTCConversation', () => ({
  useWebRTCConversation: () => mockWebRTCHook,
}));

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    id: 'test-user',
    displayName: 'Test User',
    subscriptionTier: 'premium'
  })),
}));

// Mock navigation
const mockNavigation = {
  addListener: jest.fn(),
  dispatch: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
}));

// Mock other dependencies
jest.mock('../../../shared/utils/audioUtils', () => ({
  setAudioModeAsync: jest.fn(),
}));

jest.mock('../../../shared/services/characterIconService', () => ({
  default: {
    getCharacterIcon: jest.fn(() => 'mock-icon-uri'),
  },
}));

const Stack = createStackNavigator();

const TestNavigationWrapper = ({ children }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test" component={() => children} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Cleanup Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation.addListener.mockClear();
    mockWebRTCHook.clearAllData.mockClear();
    mockWebRTCHook.stopSession.mockClear();
  });

  describe('Navigation Event Listeners', () => {
    it('should register beforeRemove navigation listener', () => {
      render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      expect(mockNavigation.addListener).toHaveBeenCalledWith(
        'beforeRemove',
        expect.any(Function)
      );
    });

    it('should prevent navigation when session is active and perform cleanup', async () => {
      // Mock active session
      mockWebRTCHook.isSessionActive = true;
      mockWebRTCHook.isConnected = true;
      mockWebRTCHook.clearAllData.mockResolvedValue();

      render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Get the beforeRemove listener
      const beforeRemoveListener = mockNavigation.addListener.mock.calls.find(
        call => call[0] === 'beforeRemove'
      )[1];

      // Mock navigation event
      const mockEvent = {
        preventDefault: jest.fn(),
        data: {
          action: { type: 'GO_BACK' }
        }
      };

      // Trigger the beforeRemove event
      await act(async () => {
        beforeRemoveListener(mockEvent);
      });

      // Should prevent default navigation
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      // Should perform cleanup
      await waitFor(() => {
        expect(mockWebRTCHook.clearAllData).toHaveBeenCalled();
      });

      // Should dispatch navigation action after cleanup
      await waitFor(() => {
        expect(mockNavigation.dispatch).toHaveBeenCalledWith(mockEvent.data.action);
      });
    });

    it('should allow navigation when no active session', async () => {
      // Mock inactive session
      mockWebRTCHook.isSessionActive = false;
      mockWebRTCHook.isConnected = false;

      render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Get the beforeRemove listener
      const beforeRemoveListener = mockNavigation.addListener.mock.calls.find(
        call => call[0] === 'beforeRemove'
      )[1];

      // Mock navigation event
      const mockEvent = {
        preventDefault: jest.fn(),
        data: {
          action: { type: 'GO_BACK' }
        }
      };

      // Trigger the beforeRemove event
      await act(async () => {
        beforeRemoveListener(mockEvent);
      });

      // Should not prevent navigation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();

      // Should not perform cleanup
      expect(mockWebRTCHook.clearAllData).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup Race Condition Prevention', () => {
    it('should prevent multiple simultaneous cleanup operations', async () => {
      mockWebRTCHook.isSessionActive = true;
      mockWebRTCHook.isConnected = true;

      // Mock cleanup to take some time
      let cleanupResolve;
      const cleanupPromise = new Promise(resolve => {
        cleanupResolve = resolve;
      });
      mockWebRTCHook.clearAllData.mockReturnValue(cleanupPromise);

      const { unmount } = render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Get the beforeRemove listener
      const beforeRemoveListener = mockNavigation.addListener.mock.calls.find(
        call => call[0] === 'beforeRemove'
      )[1];

      // Mock navigation event
      const mockEvent = {
        preventDefault: jest.fn(),
        data: { action: { type: 'GO_BACK' } }
      };

      // Trigger multiple cleanup operations simultaneously
      const cleanup1 = act(async () => {
        beforeRemoveListener(mockEvent);
      });

      const cleanup2 = act(async () => {
        unmount(); // This should also trigger cleanup
      });

      // Resolve the cleanup
      cleanupResolve();
      await Promise.all([cleanup1, cleanup2]);

      // Cleanup should only be called once despite multiple triggers
      expect(mockWebRTCHook.clearAllData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Effect Cleanup', () => {
    it('should perform navigation cleanup on focus blur', async () => {
      const { useFocusEffect } = require('@react-navigation/native');
      mockWebRTCHook.clearAllData.mockResolvedValue();

      render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Get the focus effect callback
      const focusEffectCallback = useFocusEffect.mock.calls[0][0];

      // Execute the focus effect and get the cleanup function
      const cleanup = focusEffectCallback();

      // Execute the cleanup function
      await act(async () => {
        cleanup();
      });

      // Should perform navigation cleanup
      expect(mockWebRTCHook.clearAllData).toHaveBeenCalled();
    });
  });

  describe('Component Unmount Cleanup', () => {
    it('should perform navigation cleanup on component unmount', async () => {
      mockWebRTCHook.clearAllData.mockResolvedValue();

      const { unmount } = render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Unmount the component
      await act(async () => {
        unmount();
      });

      // Should perform navigation cleanup
      expect(mockWebRTCHook.clearAllData).toHaveBeenCalled();
    });
  });

  describe('Error Handling in Navigation Cleanup', () => {
    it('should handle cleanup errors gracefully and still allow navigation', async () => {
      mockWebRTCHook.isSessionActive = true;
      mockWebRTCHook.isConnected = true;

      // Mock cleanup to throw an error
      const cleanupError = new Error('Cleanup failed');
      mockWebRTCHook.clearAllData.mockRejectedValue(cleanupError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TestNavigationWrapper>
          <PersistentConversationView
            scenarioId="test-scenario"
            level="beginner"
            onSessionEnd={jest.fn()}
          />
        </TestNavigationWrapper>
      );

      // Get the beforeRemove listener
      const beforeRemoveListener = mockNavigation.addListener.mock.calls.find(
        call => call[0] === 'beforeRemove'
      )[1];

      // Mock navigation event
      const mockEvent = {
        preventDefault: jest.fn(),
        data: { action: { type: 'GO_BACK' } }
      };

      // Trigger the beforeRemove event
      await act(async () => {
        beforeRemoveListener(mockEvent);
      });

      // Should still dispatch navigation action even if cleanup fails
      await waitFor(() => {
        expect(mockNavigation.dispatch).toHaveBeenCalledWith(mockEvent.data.action);
      });

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error during navigation cleanup:'),
        cleanupError
      );

      consoleSpy.mockRestore();
    });
  });
});
