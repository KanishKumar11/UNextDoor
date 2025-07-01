import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useAuth } from '../../auth/hooks/useAuth';

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernHeader,
  ModernButton,
  SlideIn,
  Stagger,
} from '../../../shared/components';

/**
 * ModernSettingsScreen component
 * A modern implementation of the settings screen
 */
const ModernSettingsScreen = () => {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // Setting sections
  const settingSections = [
    {
      title: 'Appearance',
      icon: 'color-palette-outline',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: 'Change app theme',
          type: 'link',
          value: isDarkMode ? 'Dark' : 'Light',
          onPress: () => router.push('/profile/theme'),
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Toggle dark mode',
          type: 'switch',
          value: isDarkMode,
          onValueChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          description: 'Receive push notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          id: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive email notifications',
          type: 'switch',
          value: emailNotifications,
          onValueChange: setEmailNotifications,
        },
      ],
    },
    {
      title: 'Audio',
      icon: 'volume-high-outline',
      items: [
        {
          id: 'soundEffects',
          title: 'Sound Effects',
          description: 'Play sound effects',
          type: 'switch',
          value: soundEffects,
          onValueChange: setSoundEffects,
        },
        {
          id: 'autoPlay',
          title: 'Auto-Play Audio',
          description: 'Automatically play audio messages',
          type: 'switch',
          value: autoPlay,
          onValueChange: setAutoPlay,
        },
      ],
    },
    {
      title: 'Account',
      icon: 'person-outline',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your profile information',
          type: 'link',
          onPress: () => router.push('/profile/edit'),
        },
        {
          id: 'password',
          title: 'Change Password',
          description: 'Update your password',
          type: 'link',
          onPress: () => router.push('/profile/password'),
        },
        {
          id: 'language',
          title: 'Language',
          description: 'Change app language',
          type: 'link',
          value: 'English',
          onPress: () => router.push('/profile/language'),
        },
      ],
    },
    {
      title: 'Support',
      icon: 'help-circle-outline',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get help with the app',
          type: 'link',
          onPress: () => router.push('/profile/help'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          description: 'Help us improve the app',
          type: 'link',
          onPress: () => router.push('/profile/feedback'),
        },
        {
          id: 'about',
          title: 'About',
          description: 'App information and version',
          type: 'link',
          onPress: () => router.push('/profile/about'),
        },
      ],
    },
  ];
  
  // Render setting item
  const renderSettingItem = (item, index) => {
    // Render switch setting
    if (item.type === 'switch') {
      return (
        <Row justify="space-between" align="center" style={styles.settingItem} key={item.id}>
          <Column style={{ flex: 1 }}>
            <Text weight="medium">{item.title}</Text>
            {item.description && (
              <Text variant="caption" color={theme.colors.text.secondary}>
                {item.description}
              </Text>
            )}
          </Column>
          
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{
              false: theme.colors.neutral[300],
              true: theme.colors.primary[300],
            }}
            thumbColor={
              item.value ? theme.colors.primary[500] : theme.colors.neutral[100]
            }
          />
        </Row>
      );
    }
    
    // Render link setting
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={item.onPress}
        key={item.id}
      >
        <Column style={{ flex: 1 }}>
          <Text weight="medium">{item.title}</Text>
          {item.description && (
            <Text variant="caption" color={theme.colors.text.secondary}>
              {item.description}
            </Text>
          )}
        </Column>
        
        <Row align="center">
          {item.value && (
            <Text variant="caption" color={theme.colors.text.secondary} style={{ marginRight: 8 }}>
              {item.value}
            </Text>
          )}
          
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.neutral[400]}
          />
        </Row>
      </TouchableOpacity>
    );
  };
  
  return (
    <Container>
      <ModernHeader
        title="Settings"
        showBackButton
        onBackPress={() => router.back()}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stagger animation="slide" staggerDelay={100}>
          {settingSections.map((section, sectionIndex) => (
            <ModernCard key={section.title} style={styles.sectionCard}>
              <Row align="center" style={styles.sectionHeader}>
                <Ionicons
                  name={section.icon}
                  size={22}
                  color={theme.colors.primary[500]}
                  style={styles.sectionIcon}
                />
                <Heading level="h4">{section.title}</Heading>
              </Row>
              
              <Column>
                {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
              </Column>
            </ModernCard>
          ))}
        </Stagger>
        
        <Spacer size="xl" />
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    margin: 16,
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
});

export default ModernSettingsScreen;
