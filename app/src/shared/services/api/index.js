import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../../utils/authUtils";
import { API_BASE_URL, ENDPOINTS, STATUS_CODES } from "../../config/api";

// API Client Configuration
// =======================

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token and log requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token if available
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request details for debugging
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log("Headers:", JSON.stringify(config.headers));

      if (config.data) {
        console.log("Request data:", JSON.stringify(config.data));
      }

      // Special handling for registration
      if (config.url.includes("/auth/register")) {
        console.log("REGISTRATION REQUEST DETAILS:");
        console.log("Data type:", typeof config.data);
        console.log("Data:", config.data);

        // Ensure Content-Type is set correctly
        config.headers["Content-Type"] = "application/json";

        // Log the stringified data
        const jsonData = JSON.stringify(config.data);
        console.log("Stringified data:", jsonData);

        // Ensure data is not empty
        if (
          !config.data ||
          (typeof config.data === "object" &&
            Object.keys(config.data).length === 0)
        ) {
          // Removed dummy data injection for production
        }
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers = [];

// Function to add callbacks to the queue
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to execute all callbacks in the queue
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to reject all callbacks in the queue
const onRefreshError = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

// Function to refresh the token
const refreshAuthToken = async () => {
  try {
    // Get the refresh token from storage
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      return null;
    }

    // Call the refresh token endpoint
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      {
        refreshToken,
      }
    );

    // Extract the new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      response.data.data || response.data;

    // Store the new tokens
    await AsyncStorage.setItem("accessToken", accessToken);

    // If a new refresh token is provided, store it too
    if (newRefreshToken) {
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Clear auth data on refresh error
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("user");
    return null;
  }
};
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Extract the error message with better handling
    let errorMessage = "Unknown error occurred";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (
      error.response?.data &&
      typeof error.response.data === "string"
    ) {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log the error
    console.error(`API Error: ${errorMessage}`, error);

    // Disabled to prevent conflicts with auth service
    // Let auth service handle token refresh

    // Handle other errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    } else if (!error.response) {
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      throw new Error(errorMessage);
    }
  }
);

// API Service Methods
// ==================

// Auth API
export const authApi = {
  checkEmail: (email) => apiClient.post(ENDPOINTS.AUTH.CHECK_EMAIL, { email }),

  sendOTP: (email) => apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { email }),

  verifyOTP: (email, otp) =>
    apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp }),

  register: (userData) => {
    console.log("Register API called with data:", userData);

    // Ensure userData is properly formatted
    if (!userData || typeof userData !== "object") {
      console.error("Invalid userData:", userData);
      throw new Error("Invalid user data for registration");
    }

    // Check if userData is empty
    if (Object.keys(userData).length === 0) {
      console.error("Empty userData object, adding dummy data");
      userData = {
        email: "test@example.com",
        username: "testuser" + Date.now().toString().slice(-4),
        firstName: "Test",
        lastName: "User",
      };
    }

    // Create a clean object with only the needed properties
    const cleanData = {
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      displayName: userData.displayName || "",
    };

    console.log("Sending registration data:", JSON.stringify(cleanData));

    // Validate required fields
    if (!cleanData.email || !cleanData.username) {
      console.error("Missing required fields:", cleanData);
      throw new Error("Email and username are required for registration");
    }

    // Use axios directly to have more control
    return axios({
      method: "post",
      url: `${API_BASE_URL}${ENDPOINTS.AUTH.REGISTER}`,
      data: cleanData,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => {
        console.log("Registration response:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Registration API error:", error);

        // Extract the specific error message from the server response
        let errorMessage = "Registration failed";

        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);

          // Extract the specific error message from server response
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (
            error.response.data &&
            typeof error.response.data === "string"
          ) {
            errorMessage = error.response.data;
          } else if (error.response.status === 400) {
            errorMessage = "Invalid registration data provided";
          } else if (error.response.status === 409) {
            errorMessage = "Username or email already exists";
          } else if (error.response.status >= 500) {
            errorMessage = "Server error. Please try again later";
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          errorMessage = "Network error. Please check your connection";
        } else {
          console.error("Error message:", error.message);
          errorMessage = error.message || "Registration failed";
        }

        // Create a new error with the specific message
        const customError = new Error(errorMessage);
        customError.response = error.response;
        customError.status = error.response?.status;

        throw customError;
      });
  },

  refreshToken: (refreshToken) =>
    apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }),

  googleAuth: (token) => apiClient.post(ENDPOINTS.AUTH.GOOGLE_AUTH, { token }),

  appleAuth: (token) => apiClient.post(ENDPOINTS.AUTH.APPLE_AUTH, { token }),

  getProfile: () => apiClient.get(ENDPOINTS.AUTH.PROFILE),

  updateProfile: (userData) => apiClient.put(ENDPOINTS.AUTH.PROFILE, userData),

  logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
};

// Tutor API
export const tutorApi = {
  getScenarios: (level) =>
    apiClient.get(ENDPOINTS.TUTOR.SCENARIOS, { params: { level } }),

  getScenarioById: (id) => apiClient.get(`${ENDPOINTS.TUTOR.SCENARIOS}/${id}`),

  startConversation: (scenarioData) =>
    apiClient.post(
      ENDPOINTS.TUTOR.CONVERSATION,
      typeof scenarioData === "string"
        ? { scenarioId: scenarioData }
        : scenarioData
    ),

  sendMessage: (conversationId, message, audioUrl) =>
    apiClient.post(
      `${ENDPOINTS.TUTOR.CONVERSATION}/${conversationId}/message`,
      {
        message,
        audioUrl,
      }
    ),

  getConversation: (conversationId) =>
    apiClient.get(`${ENDPOINTS.TUTOR.CONVERSATION}/${conversationId}`),

  getUserConversations: (page = 1, limit = 10) =>
    apiClient.get(ENDPOINTS.TUTOR.CONVERSATIONS, {
      params: { page, limit },
    }),

  recognizeSpeech: (formData) =>
    apiClient.post(ENDPOINTS.TUTOR.SPEECH_RECOGNIZE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  synthesizeSpeech: (text, language = "ko", voice = "female") =>
    apiClient.post(ENDPOINTS.TUTOR.SPEECH_SYNTHESIZE, {
      text,
      language,
      voice,
    }),
};

// Achievements API
export const achievementsApi = {
  getAchievements: (category) =>
    apiClient.get(ENDPOINTS.ACHIEVEMENTS.LIST, {
      params: { category },
    }),

  getUserAchievements: () => apiClient.get(ENDPOINTS.ACHIEVEMENTS.USER),

  getUnviewedAchievements: () => apiClient.get(ENDPOINTS.ACHIEVEMENTS.UNVIEWED),

  markAchievementsAsViewed: (achievementIds) =>
    apiClient.post(ENDPOINTS.ACHIEVEMENTS.MARK_VIEWED, { achievementIds }),

  checkAndAwardAchievements: () => apiClient.post(ENDPOINTS.ACHIEVEMENTS.CHECK),

  initializeAchievements: () =>
    apiClient.post(ENDPOINTS.ACHIEVEMENTS.INITIALIZE),
};

// Curriculum API
export const curriculumApi = {
  getLevels: () => apiClient.get(ENDPOINTS.CURRICULUM.LEVELS),

  getLevelModules: (levelId) =>
    apiClient.get(`${ENDPOINTS.CURRICULUM.LEVELS}/${levelId}/modules`),

  getModule: (moduleId) =>
    apiClient.get(`${ENDPOINTS.CURRICULUM.MODULES}/${moduleId}`),

  getLesson: (lessonId) =>
    apiClient.get(`${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}`),

  getUserProgress: () => apiClient.get(ENDPOINTS.CURRICULUM.PROGRESS),

  updateLessonProgress: (lessonId, data) =>
    apiClient.post(
      `${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}/progress`,
      data
    ),

  setCurrentLesson: (lessonId) =>
    apiClient.post(`${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}/current`),
};

// Games API
export const gamesApi = {
  getAvailableGames: () => apiClient.get(ENDPOINTS.GAMES.LIST),

  getGameResults: (gameType, lessonId) =>
    apiClient.get(`${ENDPOINTS.GAMES.RESULTS}/${gameType}/${lessonId}`),

  saveGameResults: (gameData) =>
    apiClient.post(ENDPOINTS.GAMES.RESULTS, gameData),

  getLeaderboard: (gameType) =>
    apiClient.get(`${ENDPOINTS.GAMES.LEADERBOARD}/${gameType}`),

  getUserGameProgress: () => apiClient.get(ENDPOINTS.GAMES.PROGRESS),
};

// Progress API (using tutor endpoints)
export const progressApi = {
  getUserProgress: () => apiClient.get(ENDPOINTS.TUTOR.PROGRESS),

  getDetailedProgress: () =>
    apiClient.get(`${ENDPOINTS.TUTOR.PROGRESS}/detailed`),

  completeLesson: (lessonData) =>
    apiClient.post(`${ENDPOINTS.TUTOR.PROGRESS}/complete-lesson`, lessonData),

  updateLearningPath: (pathData) =>
    apiClient.put(`${ENDPOINTS.TUTOR.PROGRESS}/learning-path`, pathData),
};

// Export the API object with all services
export const api = {
  auth: authApi,
  tutor: tutorApi,
  achievements: achievementsApi,
  curriculum: curriculumApi,
  games: gamesApi,
  progress: progressApi,
};

// Export a default API object with all services
export default api;
