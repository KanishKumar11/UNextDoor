/**
 * Custom styled components system
 * This file provides utility functions for creating styled components
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import theme from './theme';

/**
 * Creates a styled component with the given base component and styles
 * @param {React.ComponentType} Component - Base component to style
 * @param {Object} baseStyles - Base styles to apply
 * @param {Function} stylesFn - Function to generate dynamic styles based on props
 * @returns {React.ComponentType} Styled component
 */
export const styled = (Component, baseStyles = {}, stylesFn = () => ({})) => {
  return React.forwardRef((props, ref) => {
    const { style, ...rest } = props;
    const dynamicStyles = stylesFn(props, theme);
    const mergedStyles = StyleSheet.create({
      base: {
        ...baseStyles,
        ...dynamicStyles,
      },
    });

    return (
      <Component
        ref={ref}
        style={[mergedStyles.base, style]}
        {...rest}
      />
    );
  });
};

/**
 * Creates a styled View component
 * @param {Object} baseStyles - Base styles to apply
 * @param {Function} stylesFn - Function to generate dynamic styles based on props
 * @returns {React.ComponentType} Styled View component
 */
export const Box = styled(View);

/**
 * Creates a styled Text component
 * @param {Object} baseStyles - Base styles to apply
 * @param {Function} stylesFn - Function to generate dynamic styles based on props
 * @returns {React.ComponentType} Styled Text component
 */
export const StyledText = styled(Text, {
  color: theme.colors.textPrimary,
  fontSize: theme.typography.fontSize.md,
  fontWeight: theme.typography.fontWeight.normal,
});

/**
 * Creates a styled TouchableOpacity component for buttons
 * @param {Object} baseStyles - Base styles to apply
 * @param {Function} stylesFn - Function to generate dynamic styles based on props
 * @returns {React.ComponentType} Styled TouchableOpacity component
 */
export const Button = styled(TouchableOpacity, {
  backgroundColor: theme.colors.primary,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.lg,
  borderRadius: theme.borderRadius.md,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
});

/**
 * Creates a styled TextInput component
 * @param {Object} baseStyles - Base styles to apply
 * @param {Function} stylesFn - Function to generate dynamic styles based on props
 * @returns {React.ComponentType} Styled TextInput component
 */
export const Input = styled(TextInput, {
  backgroundColor: theme.colors.white,
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: theme.borderRadius.md,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  fontSize: theme.typography.fontSize.md,
  color: theme.colors.textPrimary,
});

/**
 * Creates a container component with common layout styles
 */
export const Container = styled(View, {
  flex: 1,
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
});

/**
 * Creates a row component for horizontal layouts
 */
export const Row = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
});

/**
 * Creates a column component for vertical layouts
 */
export const Column = styled(View, {
  flexDirection: 'column',
});

/**
 * Creates a card component with shadow and rounded corners
 */
export const Card = styled(View, {
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
  ...theme.shadows.md,
});

/**
 * Creates a heading component with different size variants
 */
export const Heading = props => {
  const { size = 'md', color = theme.colors.textPrimary, style, ...rest } = props;
  
  const sizeMap = {
    xs: theme.typography.fontSize.lg,
    sm: theme.typography.fontSize.xl,
    md: theme.typography.fontSize['2xl'],
    lg: theme.typography.fontSize['3xl'],
    xl: theme.typography.fontSize['4xl'],
    '2xl': theme.typography.fontSize['5xl'],
  };
  
  const fontSize = sizeMap[size] || theme.typography.fontSize['2xl'];
  
  return (
    <StyledText
      style={[
        {
          fontSize,
          fontWeight: theme.typography.fontWeight.bold,
          color,
          marginBottom: theme.spacing.sm,
        },
        style,
      ]}
      {...rest}
    />
  );
};

/**
 * Creates a paragraph component
 */
export const Paragraph = props => {
  const { size = 'md', color = theme.colors.textPrimary, style, ...rest } = props;
  
  const sizeMap = {
    xs: theme.typography.fontSize.xs,
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.md,
    lg: theme.typography.fontSize.lg,
    xl: theme.typography.fontSize.xl,
  };
  
  const fontSize = sizeMap[size] || theme.typography.fontSize.md;
  
  return (
    <StyledText
      style={[
        {
          fontSize,
          color,
          marginBottom: theme.spacing.sm,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export default {
  Box,
  StyledText,
  Button,
  Input,
  Container,
  Row,
  Column,
  Card,
  Heading,
  Paragraph,
};
