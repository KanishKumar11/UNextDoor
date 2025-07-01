import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Heading, ModernButton, Row, Column, Spacer } from '../index';

const { width, height } = Dimensions.get('window');

const ConfirmationDialog = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'solid',
  cancelVariant = 'outline',
  loading = false,
  icon = null,
  iconColor = null,
}) => {
  const { theme } = useTheme();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleBackdropPress = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <View
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 20,
            padding: theme.spacing.xl,
            maxWidth: width * 0.9,
            width: '100%',
            maxHeight: height * 0.8,
            elevation: 10,
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
          }}
        >
          {/* Header */}
          <Row justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
            <Row align="center" style={{ flex: 1, marginRight: 12 }}>
              {icon && (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: (iconColor || theme.colors.brandGreen) + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={iconColor || theme.colors.brandGreen}
                  />
                </View>
              )}
              <Heading
                level="h3"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  flex: 1,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title}
              </Heading>
            </Row>
            
            {!loading && (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: 16,
                  padding: 8,
                }}
              >
                <Ionicons name="close" size={16} color={theme.colors.neutral[600]} />
              </TouchableOpacity>
            )}
          </Row>

          {/* Message */}
          <Text
            style={{
              color: theme.colors.neutral[700],
              fontFamily: theme.typography.fontFamily.regular,
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Actions */}
          <Row justify="flex-end" align="center">
            <ModernButton
              text={cancelText}
              variant={cancelVariant}
              size="md"
              disabled={loading}
              onPress={handleCancel}
              style={{
                marginRight: 12,
                paddingHorizontal: 20,
                backgroundColor: cancelVariant === 'outline' ? 'transparent' : theme.colors.neutral[200],
                borderColor: theme.colors.neutral[400],
              }}
              textStyle={{
                color: theme.colors.neutral[600],
              }}
            />
            
            <ModernButton
              text={loading ? 'Processing...' : confirmText}
              variant={confirmVariant}
              size="md"
              disabled={loading}
              onPress={handleConfirm}
              style={{
                paddingHorizontal: 24,
                backgroundColor: confirmVariant === 'solid' ? theme.colors.brandGreen : 'transparent',
                borderColor: theme.colors.brandGreen,
              }}
              textStyle={{
                color: confirmVariant === 'solid' ? theme.colors.brandWhite : theme.colors.brandGreen,
              }}
            />
          </Row>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationDialog;
