import React, { useState } from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { NoInternetScreen } from "./NoInternetScreen";

/**
 * Network Wrapper Component
 * Wraps content and shows no internet screen when offline
 */
export const NetworkWrapper = ({ children, showOfflineScreen = true }) => {
  const { hasInternetAccess, refreshNetworkStatus } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Wait a moment for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh network status
      await refreshNetworkStatus();
      
      console.log("🔄 Network status refreshed");
    } catch (error) {
      console.error("❌ Error during retry:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Show no internet screen if offline and enabled
  if (!hasInternetAccess && showOfflineScreen) {
    return (
      <NoInternetScreen 
        onRetry={handleRetry} 
        isRetrying={isRetrying} 
      />
    );
  }

  // Show children if online or offline screen is disabled
  return children;
};

export default NetworkWrapper;
