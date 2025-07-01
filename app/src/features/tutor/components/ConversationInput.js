import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform
} from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import modernTheme from '../../../shared/styles/modernTheme';

/**
 * ConversationInput component
 * A modern, animated input component for the conversation interface
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Input text value
 * @param {Function} props.onChangeText - Function to call when text changes
 * @param {Function} props.onSend - Function to call when send button is pressed
 * @param {Function} props.onStartRecording - Function to call when recording starts
 * @param {Function} props.onStopRecording - Function to call when recording stops
 * @param {boolean} props.isRecording - Whether recording is in progress
 * @param {boolean} props.isProcessing - Whether processing is in progress
 * @param {boolean} props.isConnected - Whether connected to the server
 * @param {Object} props.style - Additional styles to apply
 */
const ConversationInput = ({
  value,
  onChangeText,
  onSend,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  isProcessing = false,
  isConnected = true,
  style
}) => {
  const [inputHeight, setInputHeight] = useState(40);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);
  
  // Animation for button press
  const animateScale = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  
  // Determine if send button should be disabled
  const isSendDisabled = !value.trim() || !isConnected || isProcessing;
  
  // Determine if mic button should be disabled
  const isMicDisabled = !isConnected || isProcessing;
  
  return (
    <View style={[styles.container, style]}>
      <HStack alignItems="center" space={modernTheme.spacing.sm} style={styles.inputRow}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.recordingButton,
              isMicDisabled && styles.disabledButton,
            ]}
            onPress={isRecording ? onStopRecording : onStartRecording}
            disabled={isMicDisabled}
            onPressIn={() => animateScale(0.9)}
            onPressOut={() => animateScale(1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { height: Math.max(40, inputHeight) }]}
            value={value}
            onChangeText={onChangeText}
            placeholder="Type your message..."
            placeholderTextColor={modernTheme.colors.text.hint}
            multiline
            editable={isConnected && !isProcessing}
            onContentSizeChange={(event) => {
              setInputHeight(Math.min(100, event.nativeEvent.contentSize.height));
            }}
          />
        </View>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendDisabled && styles.disabledButton,
            ]}
            onPress={onSend}
            disabled={isSendDisabled}
            onPressIn={() => !isSendDisabled && animateScale(0.9)}
            onPressOut={() => !isSendDisabled && animateScale(1)}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.divider,
    backgroundColor: modernTheme.colors.background.paper,
    paddingVertical: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.md,
  },
  inputRow: {
    alignItems: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: modernTheme.colors.neutral[100],
    borderRadius: modernTheme.borderRadius.xl,
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? modernTheme.spacing.xs : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.primary,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? modernTheme.spacing.xs : modernTheme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? modernTheme.spacing.xs : modernTheme.spacing.sm,
  },
  sendButton: {
    backgroundColor: modernTheme.colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  micButton: {
    backgroundColor: modernTheme.colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recordingButton: {
    backgroundColor: modernTheme.colors.error.main,
  },
  disabledButton: {
    backgroundColor: modernTheme.colors.neutral[400],
  },
});

export default ConversationInput;
