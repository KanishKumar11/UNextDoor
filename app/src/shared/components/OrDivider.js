import React from "react";
import { HStack, Divider, Text, Box } from "@gluestack-ui/themed";

/**
 * "Or" divider component for authentication screens
 * @returns {React.ReactNode} OrDivider component
 */
const OrDivider = () => {
  return (
    <HStack alignItems="center" my="$6" width="$full">
      <Divider flex={1} bg="$neutral300" />
      <Box px="$3">
        <Text color="$neutral600" fontWeight="$medium" fontSize="$sm">
          OR
        </Text>
      </Box>
      <Divider flex={1} bg="$neutral300" />
    </HStack>
  );
};

export default OrDivider;
