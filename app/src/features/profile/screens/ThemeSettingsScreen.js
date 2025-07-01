import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  ModernHeader,
  ModernCard,
} from '../../../shared/components';

/**
 * ThemeSettingsScreen component
 * A screen for changing theme settings
 */
const ThemeSettingsScreen = () => {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, THEME_MODE } = useTheme();
  
  // Theme options
  const themeOptions = [
    {
      id: THEME_MODE.LIGHT,
      label: 'Light',
      icon: 'sunny-outline',
      description: 'Light theme for daytime use',
    },
    {
      id: THEME_MODE.DARK,
      label: 'Dark',
      icon: 'moon-outline',
      description: 'Dark theme for nighttime use',
    },
    {
      id: THEME_MODE.SYSTEM,
      label: 'System',
      icon: 'settings-outline',
      description: 'Follow system theme settings',
    },
  ];
  
  return (
    <Container>
      <ModernHeader
        title="Theme Settings"
        showBackButton
        onBackPress={() => router.back()}
      />
      
      <Column style={styles.content}>
        <Text style={styles.description}>
          Choose your preferred theme mode. The system option will automatically switch between light and dark themes based on your device settings.
        </Text>
        
        {themeOptions.map((option) => (
          <ModernCard
            key={option.id}
            interactive
            onPress={() => setThemeMode(option.id)}
            style={[
              styles.optionCard,
              themeMode === option.id && {
                borderColor: theme.colors.primary[500],
                borderWidth: 2,
              },
            ]}
          >
            <Row align="center">
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      themeMode === option.id
                        ? theme.colors.primary[100]
                        : theme.colors.neutral[100],
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    themeMode === option.id
                      ? theme.colors.primary[500]
                      : theme.colors.neutral[500]
                  }
                />
              </View>
              
              <Column style={styles.optionContent}>
                <Text
                  weight={themeMode === option.id ? 'semibold' : 'regular'}
                  color={
                    themeMode === option.id
                      ? theme.colors.primary[500]
                      : theme.colors.text.primary
                  }
                >
                  {option.label}
                </Text>
                
                <Text variant="caption" color={theme.colors.text.secondary}>
                  {option.description}
                </Text>
              </Column>
              
              {themeMode === option.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              )}
            </Row>
          </ModernCard>
        ))}
        
        <Spacer size="xl" />
        
        <Text variant="caption" color={theme.colors.text.secondary} align="center">
          Changes are applied immediately and will be remembered across app restarts.
        </Text>
      </Column>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  description: {
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
});

export default ThemeSettingsScreen;
