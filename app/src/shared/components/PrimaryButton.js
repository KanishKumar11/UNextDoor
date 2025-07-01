import React from "react";
import { Button, ButtonText, ButtonIcon, Spinner } from "@gluestack-ui/themed";

/**
 * Primary button component
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {Function} props.onPress - Button press handler
 * @param {boolean} props.isLoading - Is button loading
 * @param {boolean} props.isDisabled - Is button disabled
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {React.ReactNode} props.leftIcon - Left icon
 * @param {React.ReactNode} props.rightIcon - Right icon
 * @param {Object} props.style - Additional styles
 * @returns {React.ReactNode} PrimaryButton component
 */
const PrimaryButton = ({
  text,
  onPress,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  size = "lg",
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      variant={variant}
      size={size}
      style={style}
      borderRadius="$md"
      py="$3"
      width="$full"
      {...props}
    >
      {isLoading && (
        <Spinner
          mr="$2"
          color={variant === "outline" ? "$primary500" : "$white"}
          size="small"
        />
      )}
      {!isLoading && leftIcon && <ButtonIcon as={leftIcon} mr="$2" />}
      <ButtonText fontWeight="$semibold">{text}</ButtonText>
      {!isLoading && rightIcon && <ButtonIcon as={rightIcon} ml="$2" />}
    </Button>
  );
};

export default PrimaryButton;
