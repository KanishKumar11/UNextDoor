import React from "react";
import { Controller } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Icon,
  EyeIcon,
  EyeOffIcon,
  Pressable,
} from "@gluestack-ui/themed";

/**
 * Reusable form field component
 * @param {Object} props - Component props
 * @param {Object} props.control - React Hook Form control
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.isRequired - Is field required
 * @param {boolean} props.isDisabled - Is field disabled
 * @param {boolean} props.isReadOnly - Is field read-only
 * @param {string} props.keyboardType - Keyboard type
 * @param {boolean} props.isPassword - Is password field
 * @param {boolean} props.autoCapitalize - Auto capitalize
 * @param {boolean} props.autoCorrect - Auto correct
 * @param {Function} props.onChangeCustom - Custom onChange handler
 * @returns {React.ReactNode} FormField component
 */
const FormField = ({
  control,
  name,
  label,
  placeholder,
  helperText,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  keyboardType = "default",
  isPassword = false,
  autoCapitalize = "none",
  autoCorrect = false,
  onChangeCustom,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <FormControl
          isRequired={isRequired}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          isInvalid={!!error}
          mb="$4"
        >
          {label && (
            <FormControlLabel mb="$1">
              <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
          )}

          <Input size="md" variant="outline" borderWidth={1} borderRadius="$sm">
            <InputField
              placeholder={placeholder}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (onChangeCustom) onChangeCustom(text);
              }}
              onBlur={onBlur}
              keyboardType={keyboardType}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              fontSize="$md"
              py="$2"
              px="$3"
            />
            {isPassword && (
              <InputSlot pr="$3" onPress={handleTogglePassword}>
                <InputIcon
                  as={showPassword ? EyeIcon : EyeOffIcon}
                  color="$neutral500"
                />
              </InputSlot>
            )}
          </Input>

          {helperText && !error && (
            <FormControlHelper>
              <FormControlHelperText>{helperText}</FormControlHelperText>
            </FormControlHelper>
          )}

          {error && (
            <FormControlError>
              <FormControlErrorText>{error.message}</FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
      )}
    />
  );
};

export default FormField;
