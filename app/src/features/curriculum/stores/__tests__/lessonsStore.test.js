import { act, renderHook } from '@testing-library/react-native';
import useLessonsStore from '../lessonsStore';

// Mock the curriculum service
jest.mock('../../services/curriculumService', () => ({
  default: {
    getUserProgress: jest.fn(),
    updateLessonProgress: jest.fn(),
    updateSectionProgress: jest.fn(),
    setCurrentLesson: jest.fn(),
  },
}));

import curriculumService from '../../services/curriculumService';

describe('useLessonsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useLessonsStore());
    act(() => {
      result.current.reset();
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('fetchUserProgress', () => {
    it('should fetch user progress successfully', async () => {
      const mockProgress = {
        data: {
          progress: {
            totalExperience: 100,
            lessonsCompleted: 5,
            levels: [
              {
                modules: [
                  {
                    lessons: [
                      { lessonId: 'lesson1', completed: true, xpReward: 20 }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        await result.current.fetchUserProgress();
      });

      expect(result.current.userProgress).toEqual(mockProgress.data.progress);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      curriculumService.getUserProgress.mockRejectedValue(mockError);

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        try {
          await result.current.fetchUserProgress();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('completeLesson', () => {
    it('should complete lesson with optimistic updates', async () => {
      const mockProgress = {
        data: {
          progress: {
            totalExperience: 100,
            lessonsCompleted: 5,
            levels: [
              {
                modules: [
                  {
                    lessons: [
                      { lessonId: 'lesson1', completed: false, xpReward: 20 }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);
      curriculumService.updateLessonProgress.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLessonsStore());

      // First fetch initial progress
      await act(async () => {
        await result.current.fetchUserProgress();
      });

      // Then complete the lesson
      await act(async () => {
        await result.current.completeLesson('lesson1', {
          score: 100,
          xpReward: 20,
          completedSection: 'practice'
        });
      });

      expect(curriculumService.updateLessonProgress).toHaveBeenCalledWith(
        'lesson1',
        true,
        100,
        20,
        'practice'
      );
      expect(result.current.isCompletingLesson).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should prevent duplicate completion requests', async () => {
      const { result } = renderHook(() => useLessonsStore());

      // Start first completion
      const promise1 = act(async () => {
        result.current.completeLesson('lesson1', { score: 100 });
      });

      // Try to start second completion immediately
      const promise2 = act(async () => {
        result.current.completeLesson('lesson1', { score: 100 });
      });

      await Promise.all([promise1, promise2]);

      // Should only call the service once
      expect(curriculumService.updateLessonProgress).toHaveBeenCalledTimes(1);
    });

    it('should revert optimistic updates on error', async () => {
      const mockError = new Error('Server error');
      curriculumService.updateLessonProgress.mockRejectedValue(mockError);
      curriculumService.getUserProgress.mockResolvedValue({
        data: { progress: { totalExperience: 100 } }
      });

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        try {
          await result.current.completeLesson('lesson1', { score: 100 });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isCompletingLesson).toBe(false);
      expect(result.current.error).toBe('Server error');
      // Should have called getUserProgress to revert optimistic update
      expect(curriculumService.getUserProgress).toHaveBeenCalled();
    });
  });

  describe('helper functions', () => {
    it('should check lesson completion status correctly', async () => {
      const mockProgress = {
        data: {
          progress: {
            levels: [
              {
                modules: [
                  {
                    lessons: [
                      { lessonId: 'lesson1', completed: true },
                      { lessonId: 'lesson2', completed: false }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        await result.current.fetchUserProgress();
      });

      expect(result.current.isLessonCompleted('lesson1')).toBe(true);
      expect(result.current.isLessonCompleted('lesson2')).toBe(false);
      expect(result.current.isLessonCompleted('nonexistent')).toBe(false);
    });

    it('should find lesson by ID correctly', async () => {
      const mockLesson = { lessonId: 'lesson1', name: 'Test Lesson', completed: true };
      const mockProgress = {
        data: {
          progress: {
            levels: [
              {
                modules: [
                  {
                    lessons: [mockLesson]
                  }
                ]
              }
            ]
          }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        await result.current.fetchUserProgress();
      });

      expect(result.current.getLessonById('lesson1')).toEqual(mockLesson);
      expect(result.current.getLessonById('nonexistent')).toBe(null);
    });

    it('should find next lesson correctly', async () => {
      const mockProgress = {
        data: {
          progress: {
            levels: [
              {
                modules: [
                  {
                    lessons: [
                      { lessonId: 'lesson1', isUnlocked: true },
                      { lessonId: 'lesson2', isUnlocked: true },
                      { lessonId: 'lesson3', isUnlocked: false }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      await act(async () => {
        await result.current.fetchUserProgress();
      });

      const nextLesson = result.current.findNextLesson('lesson1');
      expect(nextLesson?.lessonId).toBe('lesson2');

      const noNextLesson = result.current.findNextLesson('lesson2');
      expect(noNextLesson).toBe(null);
    });
  });

  describe('caching', () => {
    it('should use cache when data is recent', async () => {
      const mockProgress = {
        data: {
          progress: { totalExperience: 100 }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      // First fetch
      await act(async () => {
        await result.current.fetchUserProgress();
      });

      // Second fetch immediately (should use cache)
      await act(async () => {
        await result.current.fetchUserProgress();
      });

      // Should only call the service once due to caching
      expect(curriculumService.getUserProgress).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache when force refresh is requested', async () => {
      const mockProgress = {
        data: {
          progress: { totalExperience: 100 }
        }
      };

      curriculumService.getUserProgress.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useLessonsStore());

      // First fetch
      await act(async () => {
        await result.current.fetchUserProgress();
      });

      // Force refresh
      await act(async () => {
        await result.current.fetchUserProgress(true);
      });

      // Should call the service twice
      expect(curriculumService.getUserProgress).toHaveBeenCalledTimes(2);
    });
  });
});
