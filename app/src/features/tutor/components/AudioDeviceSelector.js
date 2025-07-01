import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AudioManager from "../utils/AudioManager";
import modernTheme from "../../../shared/styles/modernTheme";

/**
 * AudioDeviceSelector component
 * Provides a UI for selecting audio output devices
 *
 * @param {boolean} isSessionActive - Whether the audio session is active
 * @param {Function} onDeviceSelected - Callback when a device is selected
 * @param {Object} buttonStyle - Additional styles for the button
 */
export default function AudioDeviceSelector({
  isSessionActive = true,
  onDeviceSelected,
  buttonStyle,
}) {
  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available devices
  const loadDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Make sure AudioManager is initialized
      if (!AudioManager._isInitialized) {
        try {
          await AudioManager.initialize();
        } catch (err) {
          console.warn("Error initializing AudioManager in selector:", err);
          // Continue anyway - we'll use fallback devices
        }
      }

      // Get available devices
      const deviceList = await AudioManager.refreshDeviceList();
      setDevices(deviceList || []);

      // Get current device
      const current = AudioManager.getCurrentDevice();
      setCurrentDevice(current);

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading audio devices:", err);
      setError("Failed to load audio devices");
      setIsLoading(false);

      // Set fallback devices
      setDevices([
        { id: "speaker", name: "Speaker", icon: "volume-high" },
        { id: "bluetooth", name: "Bluetooth", icon: "bluetooth" },
      ]);
      setCurrentDevice("speaker");
    }
  }, []);

  // Load devices when component mounts
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Handle device selection
  const handleSelectDevice = useCallback(
    async (deviceId) => {
      try {
        setIsLoading(true);

        // Select the device
        await AudioManager.selectDevice(deviceId);

        // Update current device
        setCurrentDevice(deviceId);

        // Call callback if provided
        if (onDeviceSelected) {
          onDeviceSelected(deviceId);
        }

        setIsLoading(false);
        setModalVisible(false);
      } catch (err) {
        console.error("Error selecting audio device:", err);
        setError("Failed to select audio device");
        setIsLoading(false);

        // Still update UI to show the selected device
        setCurrentDevice(deviceId);
        setModalVisible(false);

        // Call callback anyway
        if (onDeviceSelected) {
          onDeviceSelected(deviceId);
        }
      }
    },
    [onDeviceSelected]
  );

  // Get current device info
  const getCurrentDeviceInfo = useCallback(() => {
    const device = devices.find((d) => d.id === currentDevice);
    return device || { id: "speaker", name: "Speaker", icon: "volume-high" };
  }, [devices, currentDevice]);

  // Render device item
  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        item.id === currentDevice && styles.selectedDeviceItem,
      ]}
      onPress={() => handleSelectDevice(item.id)}
      disabled={isLoading}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={
          item.id === currentDevice
            ? modernTheme.colors.primary[500]
            : modernTheme.colors.text.secondary
        }
      />
      <Text
        style={[
          styles.deviceName,
          item.id === currentDevice && styles.selectedDeviceName,
        ]}
      >
        {item.name}
      </Text>
      {item.id === currentDevice && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={modernTheme.colors.primary[500]}
        />
      )}
    </TouchableOpacity>
  );

  // Get current device info
  const currentDeviceInfo = getCurrentDeviceInfo();

  return (
    <>
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={() => setModalVisible(true)}
        disabled={!isSessionActive}
      >
        <Ionicons
          name={currentDeviceInfo.icon}
          size={22}
          color={
            isSessionActive
              ? modernTheme.colors.primary[500]
              : modernTheme.colors.neutral[400]
          }
        />
        <Text
          style={[styles.buttonText, !isSessionActive && styles.disabledText]}
        >
          {currentDeviceInfo.name}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Audio Output</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={modernTheme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={modernTheme.colors.error.main}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={modernTheme.colors.primary[500]}
                />
                <Text style={styles.loadingText}>Loading devices...</Text>
              </View>
            ) : devices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No audio devices found</Text>
              </View>
            ) : (
              <FlatList
                data={devices}
                renderItem={renderDeviceItem}
                keyExtractor={(item) => item.id}
                style={styles.deviceList}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadDevices}
                disabled={isLoading}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={modernTheme.colors.primary[500]}
                />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: modernTheme.colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: modernTheme.borderRadius.md,
  },
  buttonText: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.text.secondary,
    marginLeft: 4,
  },
  disabledText: {
    color: modernTheme.colors.neutral[400],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: modernTheme.borderRadius.lg,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: modernTheme.typography.fontFamily.bold,
    fontSize: modernTheme.typography.fontSize.lg,
    color: modernTheme.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: modernTheme.borderRadius.md,
    marginBottom: 8,
  },
  selectedDeviceItem: {
    backgroundColor: modernTheme.colors.primary[50],
  },
  deviceName: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  selectedDeviceName: {
    fontFamily: modernTheme.typography.fontFamily.medium,
    color: modernTheme.colors.primary[700],
  },
  modalFooter: {
    marginTop: 16,
    alignItems: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  refreshButtonText: {
    fontFamily: modernTheme.typography.fontFamily.medium,
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.primary[500],
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.secondary,
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE", // Very light red background for better contrast
    padding: 16,
    borderRadius: modernTheme.borderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: modernTheme.colors.error.main,
  },
  errorText: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.error.dark, // Dark red text for better readability
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.secondary,
  },
});
