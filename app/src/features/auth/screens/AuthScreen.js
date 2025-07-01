import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import EmailInput from "../components/EmailInput";
import OTPVerification from "../components/OTPVerification";
import Registration from "../components/Registration";
import { Spinner, Center } from "@gluestack-ui/themed";

// Authentication flow steps
const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  REGISTRATION: "registration",
};

const AuthScreen = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center style={styles.container}>
        <Spinner size="large" />
      </Center>
    );
  }

  // If user is already authenticated, don't render anything
  if (isAuthenticated) {
    return null;
  }

  const handleEmailContinue = (email, exists) => {
    setEmail(email);
    setUserExists(exists);
    setCurrentStep(STEPS.OTP);
  };

  const handleOTPVerified = () => {
    if (userExists) {
      // If user exists, redirect to home
      router.replace("/");
    } else {
      // If user doesn't exist, show registration form
      setCurrentStep(STEPS.REGISTRATION);
    }
  };

  const handleRegistrationComplete = () => {
    // After registration, redirect to home
    router.replace("/");
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return <EmailInput onContinue={handleEmailContinue} />;
      case STEPS.OTP:
        return <OTPVerification email={email} onVerified={handleOTPVerified} />;
      case STEPS.REGISTRATION:
        return (
          <Registration
            email={email}
            onRegistered={handleRegistrationComplete}
          />
        );
      default:
        return <EmailInput onContinue={handleEmailContinue} />;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default AuthScreen;
