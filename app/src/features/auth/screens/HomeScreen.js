import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import {
  Center,
  Heading,
  Text,
  Button,
  ButtonText,
  VStack,
  Spinner,
} from "@gluestack-ui/themed";

const HomeScreen = () => {
  const { user, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <Center style={styles.container}>
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <Center style={styles.container}>
      <VStack space="lg" alignItems="center">
        <Heading size="2xl">Welcome to UNextDoor</Heading>
        {user && <Text>Hello, {user.username || user.email}</Text>}
        <Text>This is the home screen of the app.</Text>
        <Button onPress={handleSignOut}>
          <ButtonText>Sign Out</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default HomeScreen;
