import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import curriculumService from '../services/curriculumService';

/**
 * Centralized Zustand store for lessons data and progress management
 * Provides optimistic updates and proper error handling for better UX
 */
const useLessonsStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    userProgress: null,
    lessons: {},
    isLoading: false,
    isCompletingLesson: false,
    completingLessonId: null,
    error: null,
    lastFetchTime: null,
    
    // Actions
    
    /**
     * Fetch user progress with caching and error handling
     * @param {boolean} forceRefresh - Whether to force refresh from server
     */
    fetchUserProgress: async (forceRefresh = false) => {
      const state = get();
      
      // Avoid duplicate requests
      if (state.isLoading && !forceRefresh) {
        console.log('📋 Fetch already in progress, skipping duplicate request');
        return;
      }
      
      // Use cache if recent and not forcing refresh
      const now = Date.now();
      const cacheAge = state.lastFetchTime ? now - state.lastFetchTime : Infinity;
      const cacheValid = cacheAge < 30000; // 30 seconds cache
      
      if (cacheValid && state.userProgress && !forceRefresh) {
        console.log('📋 Using cached user progress data');
        return state.userProgress;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        console.log('📋 Fetching user progress from server...');
        const response = await curriculumService.getUserProgress(forceRefresh);
        
        if (response.data && response.data.progress) {
          set({
            userProgress: response.data.progress,
            isLoading: false,
            error: null,
            lastFetchTime: now,
          });
          
          console.log('✅ User progress fetched successfully');
          return response.data.progress;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('❌ Error fetching user progress:', error);
        set({
          isLoading: false,
          error: error.message || 'Failed to fetch user progress',
        });
        throw error;
      }
    },
    
    /**
     * Complete a lesson with optimistic updates
     * @param {string} lessonId - The lesson ID to complete
     * @param {Object} lessonData - Lesson data for completion
     */
    completeLesson: async (lessonId, lessonData = {}) => {
      const state = get();
      
      // Prevent duplicate completion requests
      if (state.isCompletingLesson && state.completingLessonId === lessonId) {
        console.log('📋 Lesson completion already in progress');
        return;
      }
      
      set({
        isCompletingLesson: true,
        completingLessonId: lessonId,
        error: null,
      });
      
      // Optimistic update - immediately mark lesson as completed in UI
      const optimisticUpdate = (prevProgress) => {
        if (!prevProgress) return prevProgress;
        
        const updatedProgress = { ...prevProgress };
        
        // Update lesson progress optimistically
        if (updatedProgress.levels) {
          updatedProgress.levels = updatedProgress.levels.map(level => ({
            ...level,
            modules: level.modules.map(module => ({
              ...module,
              lessons: module.lessons.map(lesson => {
                if (lesson.lessonId === lessonId) {
                  return {
                    ...lesson,
                    completed: true,
                    score: lessonData.score || 100,
                    xpEarned: lessonData.xpReward || lesson.xpReward || 0,
                  };
                }
                return lesson;
              }),
            })),
          }));
        }
        
        // Update overall stats optimistically
        if (!updatedProgress.lessonsCompleted) {
          updatedProgress.lessonsCompleted = 0;
        }
        updatedProgress.lessonsCompleted += 1;
        
        if (lessonData.xpReward) {
          updatedProgress.totalExperience = (updatedProgress.totalExperience || 0) + lessonData.xpReward;
        }
        
        return updatedProgress;
      };
      
      // Apply optimistic update
      set(state => ({
        userProgress: optimisticUpdate(state.userProgress),
      }));
      
      try {
        console.log(`📋 Completing lesson ${lessonId}...`);
        console.log(`📋 Lesson data:`, lessonData);
        console.log(`📋 Curriculum service available:`, !!curriculumService);
        console.log(`📋 Update function available:`, !!curriculumService.updateLessonProgress);

        // Call the API to complete the lesson
        const apiResult = await curriculumService.updateLessonProgress(
          lessonId,
          true, // completed
          lessonData.score || 100,
          lessonData.xpReward || 0,
          lessonData.completedSection || 'practice'
        );

        console.log(`✅ Lesson ${lessonId} completed successfully:`, apiResult);

        // Fetch fresh data to ensure consistency
        console.log(`📋 Fetching fresh progress data...`);
        await get().fetchUserProgress(true);

        set({
          isCompletingLesson: false,
          completingLessonId: null,
          error: null,
        });

        console.log(`✅ Store state updated successfully`);
        return { success: true, apiResult };

      } catch (error) {
        console.error(`❌ Error completing lesson ${lessonId}:`, error);
        console.error(`❌ Error type:`, typeof error);
        console.error(`❌ Error message:`, error.message);
        console.error(`❌ Error stack:`, error.stack);
        console.error(`❌ Error response:`, error.response?.data);
        console.error(`❌ Error status:`, error.response?.status);

        // Revert optimistic update on error
        try {
          await get().fetchUserProgress(true);
        } catch (revertError) {
          console.error(`❌ Error reverting optimistic update:`, revertError);
        }

        set({
          isCompletingLesson: false,
          completingLessonId: null,
          error: error.message || 'Failed to complete lesson',
        });

        throw error;
      }
    },
    
    /**
     * Update section progress
     * @param {string} lessonId - The lesson ID
     * @param {string} sectionId - The section ID
     * @param {boolean} completed - Whether section is completed
     * @param {number} timeSpent - Time spent in seconds
     */
    updateSectionProgress: async (lessonId, sectionId, completed = false, timeSpent = 0) => {
      try {
        console.log(`📋 Updating section progress: ${lessonId} - ${sectionId}`);
        
        await curriculumService.updateSectionProgress(
          lessonId,
          sectionId,
          completed,
          timeSpent
        );
        
        console.log(`✅ Section progress updated: ${lessonId} - ${sectionId}`);
        
        // Optionally refresh progress data
        // await get().fetchUserProgress(true);
        
      } catch (error) {
        console.error(`❌ Error updating section progress:`, error);
        set({ error: error.message || 'Failed to update section progress' });
        throw error;
      }
    },
    
    /**
     * Set current lesson
     * @param {string} lessonId - The lesson ID to set as current
     */
    setCurrentLesson: async (lessonId) => {
      try {
        console.log(`📋 Setting current lesson: ${lessonId}`);
        
        await curriculumService.setCurrentLesson(lessonId);
        
        console.log(`✅ Current lesson set: ${lessonId}`);
        
        // Refresh progress to get updated current lesson
        await get().fetchUserProgress(true);
        
      } catch (error) {
        console.error(`❌ Error setting current lesson:`, error);
        set({ error: error.message || 'Failed to set current lesson' });
        throw error;
      }
    },
    
    /**
     * Clear error state
     */
    clearError: () => {
      set({ error: null });
    },
    
    /**
     * Reset store state
     */
    reset: () => {
      set({
        userProgress: null,
        lessons: {},
        isLoading: false,
        isCompletingLesson: false,
        completingLessonId: null,
        error: null,
        lastFetchTime: null,
      });
    },
    
    /**
     * Get lesson completion status
     * @param {string} lessonId - The lesson ID to check
     * @returns {boolean} Whether the lesson is completed
     */
    isLessonCompleted: (lessonId) => {
      const state = get();
      if (!state.userProgress || !state.userProgress.levels) return false;
      
      for (const level of state.userProgress.levels) {
        for (const module of level.modules) {
          const lesson = module.lessons.find(l => l.lessonId === lessonId);
          if (lesson) {
            return lesson.completed || false;
          }
        }
      }
      return false;
    },
    
    /**
     * Get lesson data by ID
     * @param {string} lessonId - The lesson ID
     * @returns {Object|null} Lesson data or null if not found
     */
    getLessonById: (lessonId) => {
      const state = get();
      if (!state.userProgress || !state.userProgress.levels) return null;

      for (const level of state.userProgress.levels) {
        for (const module of level.modules) {
          const lesson = module.lessons.find(l => l.lessonId === lessonId);
          if (lesson) {
            return lesson;
          }
        }
      }
      return null;
    },

    /**
     * Find next available lesson
     * @param {string} currentLessonId - Current lesson ID
     * @returns {Object|null} Next lesson data or null if not found
     */
    findNextLesson: (currentLessonId) => {
      const state = get();
      if (!state.userProgress || !state.userProgress.levels) return null;

      let foundCurrent = false;

      for (const level of state.userProgress.levels) {
        for (const module of level.modules) {
          for (const lesson of module.lessons) {
            if (foundCurrent && lesson.isUnlocked) {
              return lesson;
            }
            if (lesson.lessonId === currentLessonId) {
              foundCurrent = true;
            }
          }
        }
      }
      return null;
    },

    /**
     * Get completion statistics
     * @returns {Object} Completion stats
     */
    getCompletionStats: () => {
      const state = get();
      if (!state.userProgress) {
        return {
          totalLessons: 0,
          completedLessons: 0,
          completionPercentage: 0,
          totalXP: 0,
        };
      }

      return {
        totalLessons: state.userProgress.totalLessons || 0,
        completedLessons: state.userProgress.lessonsCompleted || 0,
        completionPercentage: state.userProgress.completionPercentage || 0,
        totalXP: state.userProgress.totalExperience || 0,
      };
    },
  }))
);

export default useLessonsStore;
