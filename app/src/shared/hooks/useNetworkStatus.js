import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook to monitor network connectivity status
 * @returns {Object} Network status information
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("🌐 Network state changed:", {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Get initial network state
    NetInfo.fetch().then((state) => {
      console.log("🌐 Initial network state:", {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Check if device has internet access
   * @returns {boolean} True if connected and internet is reachable
   */
  const hasInternetAccess = () => {
    return isConnected && isInternetReachable !== false;
  };

  /**
   * Refresh network status
   * @returns {Promise<Object>} Current network state
   */
  const refreshNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      console.log("🔄 Refreshed network state:", state);
      
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
      
      return state;
    } catch (error) {
      console.error("❌ Error refreshing network status:", error);
      return null;
    }
  };

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    hasInternetAccess: hasInternetAccess(),
    refreshNetworkStatus,
  };
};

export default useNetworkStatus;
