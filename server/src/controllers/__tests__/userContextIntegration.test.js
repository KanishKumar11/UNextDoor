/**
 * User Context Integration Tests
 * Tests for the user context integration in OpenAI API calls
 */

import { jest } from '@jest/globals';

// Mock the prompt templates module
const mockCreateTeachingPrompt = jest.fn();
jest.unstable_mockModule('../data/promptTemplates.js', () => ({
  createContextAwareTeachingPrompt: jest.fn(async (options) => {
    return mockCreateTeachingPrompt(options);
  }),
}));

// Mock the OpenAI module
const mockOpenAI = {
  beta: {
    realtime: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
};

jest.unstable_mockModule('openai', () => ({
  default: jest.fn(() => mockOpenAI),
}));

describe('User Context Integration Tests', () => {
  let openaiController;

  beforeAll(async () => {
    // Import the controller after mocking
    const module = await import('../openaiController.js');
    openaiController = module;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTeachingPrompt.mockResolvedValue('Mock teaching prompt');
    mockOpenAI.beta.realtime.sessions.create.mockResolvedValue({
      client_secret: {
        value: 'mock-token',
      },
    });
  });

  describe('Voice Selection', () => {
    it('should use echo voice as the most robotic option', async () => {
      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
          isScenarioBased: true,
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockOpenAI.beta.realtime.sessions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini-realtime-preview-2024-12-17',
        voice: 'echo',
        instructions: 'Mock teaching prompt',
      });
    });

    it('should allow custom voice override', async () => {
      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
          isScenarioBased: true,
          voice: 'sage',
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockOpenAI.beta.realtime.sessions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini-realtime-preview-2024-12-17',
        voice: 'sage',
        instructions: 'Mock teaching prompt',
      });
    });
  });

  describe('Model Configuration', () => {
    it('should use the correct OpenAI model as specified in requirements', async () => {
      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockOpenAI.beta.realtime.sessions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini-realtime-preview-2024-12-17',
        voice: 'echo',
        instructions: 'Mock teaching prompt',
      });
    });
  });

  describe('User Context Integration', () => {
    it('should pass user context to prompt generation', async () => {
      const testUser = {
        id: 'test-user-123',
        displayName: 'John Doe',
        subscriptionTier: 'premium',
        preferences: {
          languageLevel: 'intermediate',
        },
      };

      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
          isScenarioBased: true,
          user: testUser,
        },
        user: { id: 'test-user-123' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockCreateTeachingPrompt).toHaveBeenCalledWith({
        isScenarioBased: true,
        scenarioId: 'test-scenario',
        isLessonBased: false,
        lessonDetails: undefined,
        level: 'beginner',
        user: testUser,
      }, 'test-user-123');
    });

    it('should handle missing user context gracefully', async () => {
      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
          isScenarioBased: true,
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockCreateTeachingPrompt).toHaveBeenCalledWith({
        isScenarioBased: true,
        scenarioId: 'test-scenario',
        isLessonBased: false,
        lessonDetails: undefined,
        level: 'beginner',
        user: undefined,
      }, 'test-user');
    });

    it('should log user context information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const testUser = {
        id: 'test-user-123',
        displayName: 'Jane Smith',
        subscriptionTier: 'free',
      };

      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'advanced',
          user: testUser,
        },
        user: { id: 'test-user-123' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('user=Jane Smith (test-user-123)')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      const apiError = new Error('OpenAI API Error');
      mockOpenAI.beta.realtime.sessions.create.mockRejectedValue(apiError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to generate realtime token',
        details: apiError.message,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating realtime token:'),
        apiError
      );

      consoleSpy.mockRestore();
    });

    it('should handle prompt generation errors', async () => {
      const promptError = new Error('Prompt generation failed');
      mockCreateTeachingPrompt.mockRejectedValue(promptError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockReq = {
        body: {
          scenarioId: 'test-scenario',
          level: 'beginner',
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating realtime token:'),
        promptError
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Request Validation', () => {
    it('should handle requests with minimal required data', async () => {
      const mockReq = {
        body: {},
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockCreateTeachingPrompt).toHaveBeenCalledWith({
        isScenarioBased: false,
        scenarioId: undefined,
        isLessonBased: false,
        lessonDetails: undefined,
        level: 'beginner', // Default level
        user: undefined,
      }, 'test-user');
    });

    it('should handle lesson-based requests', async () => {
      const mockReq = {
        body: {
          isLessonBased: true,
          lessonDetails: 'Korean greetings lesson',
          level: 'intermediate',
        },
        user: { id: 'test-user' },
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await openaiController.generateRealtimeToken(mockReq, mockRes);

      expect(mockCreateTeachingPrompt).toHaveBeenCalledWith({
        isScenarioBased: false,
        scenarioId: undefined,
        isLessonBased: true,
        lessonDetails: 'Korean greetings lesson',
        level: 'intermediate',
        user: undefined,
      }, 'test-user');
    });
  });
});
