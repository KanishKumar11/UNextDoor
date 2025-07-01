import React from "react";
import {
  Button,
  ButtonText,
  ButtonIcon,
  HStack,
  Image,
  Box,
  Text,
} from "@gluestack-ui/themed";
import { IMAGES } from "../../assets/index";

/**
 * Social login button component
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {Function} props.onPress - Button press handler
 * @param {boolean} props.isLoading - Is button loading
 * @param {boolean} props.isDisabled - Is button disabled
 * @param {string} props.provider - Social provider (google, facebook, apple)
 * @param {Object} props.style - Additional styles
 * @returns {React.ReactNode} SocialButton component
 */
const SocialButton = ({
  text,
  onPress,
  isLoading = false,
  isDisabled = false,
  provider = "google",
  style,
  ...props
}) => {
  // Define provider-specific properties
  const providerProps = {
    google: {
      icon: IMAGES.GOOGLE_ICON,
      bgColor: "$white",
      textColor: "$neutral800",
      borderColor: "$neutral300",
      iconText: "G",
    },
    facebook: {
      icon: IMAGES.FACEBOOK_ICON,
      bgColor: "#1877F2",
      textColor: "$white",
      borderColor: "#1877F2",
      iconText: "f",
    },
    apple: {
      icon: IMAGES.APPLE_ICON,
      bgColor: "$black",
      textColor: "$white",
      borderColor: "$black",
      iconText: "a",
    },
  }[provider];

  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      variant="outline"
      size="lg"
      bg={providerProps.bgColor}
      borderColor={providerProps.borderColor}
      borderWidth={1}
      borderRadius="$md"
      py="$3"
      width="$full"
      style={style}
      {...props}
    >
      <HStack space="md" alignItems="center" justifyContent="center">
        {providerProps.icon ? (
          <Image
            source={providerProps.icon}
            alt={`${provider} icon`}
            width={24}
            height={24}
            resizeMode="contain"
          />
        ) : (
          <Box
            width={24}
            height={24}
            borderRadius="$full"
            bg={providerProps.bgColor}
            borderWidth={1}
            borderColor={providerProps.borderColor}
            alignItems="center"
            justifyContent="center"
          >
            <Text color={providerProps.textColor} fontWeight="$bold">
              {providerProps.iconText}
            </Text>
          </Box>
        )}
        <ButtonText color={providerProps.textColor} fontWeight="$semibold">
          {text}
        </ButtonText>
      </HStack>
    </Button>
  );
};

export default SocialButton;
