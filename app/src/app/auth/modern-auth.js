import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../features/auth/hooks/useAuth";

import ModernEmailInput from "../../features/auth/components/ModernEmailInput";
import ModernOTPVerification from "../../features/auth/components/ModernOTPVerification";
import ModernRegistration from "../../features/auth/components/ModernRegistration";
import { Container } from "../../shared/components";

/**
 * ModernAuth component
 * A modern authentication screen with email, OTP, and registration flows
 */
const ModernAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, sendOTP } = useAuth();

  // State for auth flow
  const [currentStep, setCurrentStep] = useState("email");
  const [email, setEmail] = useState("");
  const [requiresRegistration, setRequiresRegistration] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  // Handle email submission
  const handleEmailSubmit = (emailValue) => {
    setEmail(emailValue);
    setCurrentStep("otp");
  };

  // Handle OTP verification
  const handleOTPVerified = (needsRegistration, verifiedUser) => {
    if (verifiedUser) {
      // User is authenticated, redirect to home
      router.replace("/");
      return;
    }

    if (needsRegistration) {
      // User needs to register
      setRequiresRegistration(true);
      setCurrentStep("registration");
    } else {
      router.replace("/");
    }
  };

  // Handle registration completion
  const handleRegistrationComplete = (registeredUser) => {
    // User is registered and authenticated, redirect to home
    router.replace("/");
  };

  // Handle going back to email input
  const handleBackToEmail = () => {
    setCurrentStep("email");
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    if (email) {
      return await sendOTP(email);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case "email":
        return <ModernEmailInput onContinue={handleEmailSubmit} />;

      case "otp":
        return (
          <ModernOTPVerification
            email={email}
            onVerified={handleOTPVerified}
            onChangeEmail={handleBackToEmail}
            onResendOTP={handleResendOTP}
          />
        );

      case "registration":
        return (
          <ModernRegistration
            email={email}
            onRegistered={handleRegistrationComplete}
            onBack={() => setCurrentStep("otp")}
          />
        );

      default:
        return <ModernEmailInput onContinue={handleEmailSubmit} />;
    }
  };

  return <Container>{renderStep()}</Container>;
};

export default ModernAuth;
