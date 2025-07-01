import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { levelService } from "../services/levelService";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import LevelUpModal from "../components/LevelUpModal";

// Create context
const UserLevelContext = createContext();

/**
 * UserLevelProvider component
 * Provides user level state and functions to the app
 */
export const UserLevelProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // State
  const [levelDetails, setLevelDetails] = useState({
    currentLevel: null,
    nextLevel: null,
    xpPoints: 0,
    levelProgress: 0,
    nextLevelXp: 100,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpDetails, setLevelUpDetails] = useState({
    level: 1,
    levelName: "",
    levelDescription: "",
    rewards: [],
  });

  // Load user level
  const loadUserLevel = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await levelService.getUserLevel();

      if (result.success) {
        setLevelDetails(result.levelDetails);
      } else {
        setError(result.error || "Failed to load user level");
      }
    } catch (err) {
      console.error("Error loading user level:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Add XP to user
  const addXp = useCallback(
    async (xpAmount, source = "general") => {
      if (!isAuthenticated || !xpAmount || xpAmount <= 0) {
        return { success: false };
      }

      try {
        const result = await levelService.addXp(xpAmount, source);

        if (result.success) {
          setLevelDetails(result.levelDetails);

          // Check if user leveled up
          if (result.leveledUp && result.levelDetails.currentLevel) {
            // Show level up modal
            setLevelUpDetails({
              level: result.levelDetails.currentLevel.level,
              levelName: result.levelDetails.currentLevel.name,
              levelDescription: result.levelDetails.currentLevel.description,
              rewards: result.rewards || [],
            });
            setShowLevelUpModal(true);
          }

          return result;
        } else {
          setError(result.error || "Failed to add XP");
          return result;
        }
      } catch (err) {
        console.error("Error adding XP:", err);
        setError("An unexpected error occurred");
        return { success: false, error: "An unexpected error occurred" };
      }
    },
    [isAuthenticated]
  );

  // Load user level when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserLevel();
    }
  }, [isAuthenticated, loadUserLevel]);

  // Context value
  const value = {
    levelDetails,
    isLoading,
    error,
    loadUserLevel,
    addXp,
  };

  return (
    <UserLevelContext.Provider value={value}>
      {children}

      {/* Level up modal */}
      <LevelUpModal
        visible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        level={levelUpDetails.level}
        levelName={levelUpDetails.levelName}
        levelDescription={levelUpDetails.levelDescription}
        rewards={levelUpDetails.rewards}
      />
    </UserLevelContext.Provider>
  );
};

/**
 * useUserLevel hook
 * @returns {Object} User level context
 */
export const useUserLevel = () => {
  const context = useContext(UserLevelContext);

  if (!context) {
    throw new Error("useUserLevel must be used within a UserLevelProvider");
  }

  return context;
};
