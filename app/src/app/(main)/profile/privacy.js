import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../shared/context/ThemeContext';
import SafeAreaWrapper from '../../../shared/components/SafeAreaWrapper';
import { 
  Container, 
  Row, 
  Column, 
  Spacer, 
  Text, 
  Heading, 
  ModernCard, 
  ModernButton,
  Divider
} from '../../../shared/components';
import { Ionicons } from '@expo/vector-icons';

/**
 * Privacy & Security Screen
 * Allows users to configure privacy and security settings
 */
export default function PrivacyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State for privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [dataCollection, setDataCollection] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would call an API to update the user's privacy settings
    console.log('Saving privacy settings:', {
      profileVisibility,
      dataCollection,
      twoFactorAuth,
      biometricLogin,
      rememberDevice,
    });
    
    // Navigate back to profile
    router.back();
  };
  
  // Render a toggle setting
  const renderToggleSetting = (title, description, value, onValueChange) => (
    <Row justify="space-between" align="center" style={{ marginBottom: theme.spacing.md }}>
      <Column style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text weight="semibold">{title}</Text>
        <Text variant="caption" color="neutral.600">
          {description}
        </Text>
      </Column>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: theme.colors.neutral[300], 
          true: theme.colors.primary[500] 
        }}
        thumbColor="white"
      />
    </Row>
  );
  
  // Render a radio option
  const renderRadioOption = (label, value, currentValue, onSelect) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      }}
      onPress={() => onSelect(value)}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: currentValue === value 
            ? theme.colors.primary[500] 
            : theme.colors.neutral[400],
          marginRight: theme.spacing.sm,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {currentValue === value && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.primary[500],
            }}
          />
        )}
      </View>
      
      <Text>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <Container withPadding>
        <Column>
          <Row justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h1">Privacy & Security</Heading>
            
            <ModernButton
              variant="text"
              text="Cancel"
              onPress={() => router.back()}
            />
          </Row>
          
          {/* Privacy settings */}
          <ModernCard style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h3" gutterBottom>Privacy</Heading>
            
            <Text weight="semibold" gutterBottom>Profile Visibility</Text>
            <Text variant="caption" color="neutral.600" gutterBottom>
              Control who can see your profile information
            </Text>
            
            <View style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>
              {renderRadioOption('Public', 'public', profileVisibility, setProfileVisibility)}
              {renderRadioOption('Friends Only', 'friends', profileVisibility, setProfileVisibility)}
              {renderRadioOption('Private', 'private', profileVisibility, setProfileVisibility)}
            </View>
            
            <Divider style={{ marginVertical: theme.spacing.sm }} />
            
            {renderToggleSetting(
              'Data Collection',
              'Allow us to collect usage data to improve your experience',
              dataCollection,
              setDataCollection
            )}
          </ModernCard>
          
          {/* Security settings */}
          <ModernCard style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h3" gutterBottom>Security</Heading>
            
            {renderToggleSetting(
              'Two-Factor Authentication',
              'Add an extra layer of security to your account',
              twoFactorAuth,
              setTwoFactorAuth
            )}
            
            {renderToggleSetting(
              'Biometric Login',
              'Use fingerprint or face recognition to log in',
              biometricLogin,
              setBiometricLogin
            )}
            
            {renderToggleSetting(
              'Remember Device',
              'Stay logged in on this device',
              rememberDevice,
              setRememberDevice
            )}
            
            <Spacer size="md" />
            
            <ModernButton
              text="Change Password"
              variant="outline"
              iconName="lock-closed-outline"
              onPress={() => router.push('/profile/change-password')}
              style={{ marginTop: theme.spacing.sm }}
            />
          </ModernCard>
          
          {/* Data management */}
          <ModernCard style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h3" gutterBottom>Data Management</Heading>
            
            <ModernButton
              text="Download My Data"
              variant="outline"
              iconName="download-outline"
              onPress={() => console.log('Download data')}
              style={{ marginBottom: theme.spacing.md }}
            />
            
            <ModernButton
              text="Delete Account"
              variant="outline"
              iconName="trash-outline"
              onPress={() => console.log('Delete account')}
              style={{ 
                borderColor: theme.colors.error[500],
              }}
              textStyle={{
                color: theme.colors.error[500],
              }}
            />
          </ModernCard>
          
          <Spacer size="lg" />
          
          {/* Save button */}
          <ModernButton
            text="Save Settings"
            variant="solid"
            iconName="save-outline"
            onPress={handleSaveSettings}
          />
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}
