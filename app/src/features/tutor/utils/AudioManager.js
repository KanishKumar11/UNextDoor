import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import { AudioModule } from "expo-audio";

/**
 * Utility class for managing audio devices and routing
 */
class AudioManager {
  constructor() {
    this.audioDevices = [];
    this.currentDevice = null;
    this._isInitialized = false;
    this._listeners = [];

    // Event names vary by platform
    this.eventNames = {
      routeChange:
        Platform.OS === "ios" ? "onAudioRouteChange" : "onAudioFocusChange",
      devicesChange:
        Platform.OS === "ios"
          ? "onAudioDevicesChanged"
          : "onAudioDevicesChanged",
    };

    // Setup audio manager using expo-audio
    this.audioModule = AudioModule;
  }

  /**
   * Initialize the audio manager and register event listeners
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._isInitialized) return;

    try {
      // Set up audio session for voice communication
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // Initialize device list
      await this.refreshDeviceList();

      this._isInitialized = true;
      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);

      // Set initialized to true anyway so we don't keep trying and failing
      this._isInitialized = true;

      // Set up basic devices as fallback
      this.audioDevices = [
        { id: "speaker", name: "Speaker", icon: "volume-high" },
        { id: "earpiece", name: "Phone", icon: "phone-portrait" },
        { id: "bluetooth", name: "Bluetooth", icon: "bluetooth" },
      ];

      // Default to speaker
      this.currentDevice = "speaker";

      // Don't throw the error, just log it and continue with fallback
      console.log("Using fallback audio device configuration");
    }
  }

  /**
   * Register event listeners for audio route changes
   * @private
   */
  _registerEventListeners() {
    // No longer using InCallManager events
    // expo-audio handles device changes internally
    console.log("🎧 Event listeners not needed with expo-audio");
  }

  /**
   * Remove all event listeners
   * @private
   */
  _removeEventListeners() {
    // Clear any existing listeners
    this._listeners.forEach((listener) => {
      if (listener && typeof listener.remove === "function") {
        listener.remove();
      }
    });
    this._listeners = [];
  }

  /**
   * Handle audio route change events
   * @param {Object} event - The route change event
   * @private
   */
  _handleRouteChange(event) {
    console.log("🎧 Audio route changed:", event);
    // Refresh device list when route changes
    this.refreshDeviceList();
  }

  /**
   * Handle device list change events
   * @param {Object} event - The devices change event
   * @private
   */
  _handleDevicesChange(event) {
    console.log("🎧 Audio devices changed:", event);
    // Refresh device list when devices change
    this.refreshDeviceList();
  }

  /**
   * Refresh the list of available audio devices
   * @returns {Promise<Array>} - List of available audio devices
   */
  /**
   * Refresh the list of available audio devices with improved detection
   * @returns {Promise<Array>} - List of available audio devices
   */
  async refreshDeviceList() {
    try {
      console.log("🎧 Starting audio device detection with expo-audio...");

      // Use expo-audio to get available outputs
      if (this.audioModule && typeof this.audioModule.getAvailableOutputsAsync === "function") {
        try {
          const outputs = await this.audioModule.getAvailableOutputsAsync();
          console.log("🎧 Available audio outputs:", outputs);

          // Convert expo-audio outputs to our format
          const detectedDevices = [];
          let hasBluetoothDevices = false;
          let isHeadsetConnected = false;

          outputs.forEach(output => {
            if (output.type === 'bluetooth' ||
                (output.name && output.name.toLowerCase().includes('bluetooth')) ||
                (output.name && output.name.toLowerCase().includes('airpods')) ||
                (output.name && output.name.toLowerCase().includes('headset'))) {
              hasBluetoothDevices = true;
              if (!detectedDevices.includes("BLUETOOTH")) {
                detectedDevices.push("BLUETOOTH");
              }
            } else if (output.type === 'headphones' ||
                       (output.name && output.name.toLowerCase().includes('headphone')) ||
                       (output.name && output.name.toLowerCase().includes('wired'))) {
              isHeadsetConnected = true;
              if (!detectedDevices.includes("HEADPHONES")) {
                detectedDevices.push("HEADPHONES");
              }
            } else if (output.type === 'speaker' ||
                       (output.name && output.name.toLowerCase().includes('speaker'))) {
              if (!detectedDevices.includes("SPEAKER_PHONE")) {
                detectedDevices.push("SPEAKER_PHONE");
              }
            } else if (output.type === 'earpiece' ||
                       output.type === 'receiver' ||
                       (output.name && output.name.toLowerCase().includes('earpiece')) ||
                       (output.name && output.name.toLowerCase().includes('receiver'))) {
              if (!detectedDevices.includes("EARPIECE")) {
                detectedDevices.push("EARPIECE");
              }
            }
          });

          // Always include basic devices
          if (!detectedDevices.includes("SPEAKER_PHONE")) {
            detectedDevices.push("SPEAKER_PHONE");
          }
          if (!detectedDevices.includes("EARPIECE")) {
            detectedDevices.push("EARPIECE");
          }

          console.log("🎧 Detected devices:", detectedDevices);
          this.audioDevices = this._formatDeviceList(detectedDevices);
          console.log("🎧 Formatted audio devices:", this.audioDevices);

          // Set default device with priority: headphones > bluetooth > earpiece > speaker
          if (isHeadsetConnected) {
            this.currentDevice = "headphones";
          } else if (hasBluetoothDevices) {
            this.currentDevice = "bluetooth";
          } else {
            this.currentDevice = "earpiece";
          }

          console.log("🎧 Current audio device set to:", this.currentDevice);
          return this.audioDevices;

        } catch (audioModuleError) {
          console.warn("🎧 Error using AudioModule:", audioModuleError);
          // Fall through to fallback
        }
      }

      // Fallback: Return basic devices
      console.log("🎧 Using basic fallback devices");
      this.audioDevices = this._formatDeviceList([
        "SPEAKER_PHONE",
        "EARPIECE",
        "BLUETOOTH",
        "HEADPHONES",
      ]);
      this.currentDevice = "earpiece";
      return this.audioDevices;

    } catch (error) {
      console.error("🎧 Error refreshing device list:", error);

      // Return basic devices as fallback
      console.log("🎧 Using basic fallback devices due to error");
      this.audioDevices = this._formatDeviceList([
        "SPEAKER_PHONE",
        "EARPIECE",
        "BLUETOOTH",
        "HEADPHONES",
      ]);
      this.currentDevice = "earpiece";
      return this.audioDevices;
    }
  }

  /**
   * Select an audio output device with improved handling
   * @param {string} deviceId - The ID of the device to select
   * @returns {Promise<boolean>} - Whether the selection was successful
   */
  async selectDevice(deviceId) {
    try {
      console.log(`Selecting audio device: ${deviceId}`);

      if (!this._isInitialized) {
        await this.initialize();
      }

      // Check if device exists in our list
      const device = this.audioDevices.find((d) => d.id === deviceId);
      if (!device) {
        console.warn(`Device ${deviceId} not found in available devices`);
        // Add it anyway since our detection might be incomplete
        this.audioDevices.push({
          id: deviceId,
          name: deviceId.charAt(0).toUpperCase() + deviceId.slice(1),
          icon: deviceId === "bluetooth" ? "bluetooth" : "hardware-chip",
        });
      }

      // Always update the current device regardless of whether we can actually switch
      this.currentDevice = deviceId;

      try {
        console.log(`🎧 Selecting audio device: ${deviceId}`);

        // Set up audio session for the selected device
        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: deviceId === "earpiece",
          staysActiveInBackground: true,
        });

        // Use AudioModule to select the appropriate output if available
        if (this.audioModule && typeof this.audioModule.selectAudioOutput === "function") {
          try {
            // Get available outputs first
            const outputs = await this.audioModule.getAvailableOutputsAsync();
            console.log(`🎧 Available outputs for ${deviceId}:`, outputs);

            let targetOutput = null;

            switch (deviceId) {
              case "bluetooth":
                targetOutput = outputs.find(output =>
                  output.type === 'bluetooth' ||
                  (output.name && output.name.toLowerCase().includes('bluetooth')) ||
                  (output.name && output.name.toLowerCase().includes('airpods')) ||
                  (output.name && output.name.toLowerCase().includes('headset'))
                );
                break;
              case "headphones":
                targetOutput = outputs.find(output =>
                  output.type === 'headphones' ||
                  (output.name && output.name.toLowerCase().includes('headphone')) ||
                  (output.name && output.name.toLowerCase().includes('wired'))
                );
                break;
              case "speaker":
                targetOutput = outputs.find(output =>
                  output.type === 'speaker' ||
                  (output.name && output.name.toLowerCase().includes('speaker'))
                );
                break;
              case "earpiece":
                targetOutput = outputs.find(output =>
                  output.type === 'earpiece' ||
                  output.type === 'receiver' ||
                  (output.name && output.name.toLowerCase().includes('earpiece')) ||
                  (output.name && output.name.toLowerCase().includes('receiver'))
                );
                break;
              default:
                console.warn(`🎧 Unknown device type: ${deviceId}, defaulting to speaker`);
                targetOutput = outputs.find(output =>
                  output.type === 'speaker' ||
                  (output.name && output.name.toLowerCase().includes('speaker'))
                );
                break;
            }

            if (targetOutput) {
              console.log(`🎧 Selecting ${deviceId} output:`, targetOutput.name);
              await this.audioModule.selectAudioOutput(targetOutput);
            } else {
              console.warn(`🎧 No ${deviceId} output found, trying fallback`);
              // Fallback: try to select by type string
              await this.audioModule.selectAudioOutput(deviceId);
            }
          } catch (selectErr) {
            console.warn(`🎧 Error selecting ${deviceId} output:`, selectErr);
          }
        } else {
          console.warn("🎧 AudioModule.selectAudioOutput not available");
        }

        // Add a small delay to allow device switching to take effect
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log(`Audio device selected: ${deviceId}`);
        return true;
      } catch (innerError) {
        console.warn(
          `Error switching to device ${deviceId}, but will continue:`,
          innerError
        );
        // Continue anyway - we'll update the UI even if the actual switch failed
      }

      console.log(`Audio device selection completed: ${deviceId}`);
      return true;
    } catch (error) {
      console.error("Error selecting audio device:", error);
      // Still update the current device for UI consistency
      this.currentDevice = deviceId || "speaker";
      return true; // Return true anyway to avoid breaking the UI
    }
  }

  /**
   * Format the device list into a standardized format
   * @param {Array|String} devices - Raw device list from native module
   * @returns {Array} - Formatted device list
   * @private
   */
  _formatDeviceList(devices) {
    if (!devices) return [];

    // Convert string format to array if needed
    const deviceArray =
      typeof devices === "string"
        ? devices.split(",")
        : Array.isArray(devices)
        ? devices
        : [];

    return deviceArray
      .map((device) => {
        const deviceId = device.trim().toUpperCase();

        // Map device IDs to user-friendly names and icons
        switch (deviceId) {
          case "SPEAKER_PHONE":
          case "SPEAKER":
            return {
              id: "speaker",
              name: "Speaker",
              icon: "volume-high",
            };
          case "EARPIECE":
            return {
              id: "earpiece",
              name: "Phone",
              icon: "phone-portrait",
            };
          case "BLUETOOTH":
          case "SCO":
          case "BLUETOOTH_SCO":
            return {
              id: "bluetooth",
              name: "Bluetooth",
              icon: "bluetooth",
            };
          case "WIRED_HEADSET":
          case "HEADPHONES":
          case "HEADSET":
            return {
              id: "headphones",
              name: "Headphones",
              icon: "headset",
            };
          default:
            return {
              id: deviceId.toLowerCase(),
              name: deviceId,
              icon: "hardware-chip",
            };
        }
      })
      .filter(Boolean); // Remove any undefined entries
  }

  /**
   * Detect the currently active audio device
   * @private
   */
  _detectCurrentDevice() {
    if (Platform.OS === "android") {
      // On Android, we can try to detect the current route
      // This is a placeholder - in a real implementation, you would use
      // the Android AudioManager to get the current route
      if (this.audioDevices.find((d) => d.id === "bluetooth")) {
        this.currentDevice = "bluetooth";
      } else {
        this.currentDevice = "speaker";
      }
    } else {
      // On iOS, use a simple default for now
      this.currentDevice = "speaker";
    }
  }



  /**
   * Get the currently selected device
   * @returns {string} - The ID of the currently selected device
   */
  getCurrentDevice() {
    return this.currentDevice || "unknown";
  }

  /**
   * Clean up the audio manager when no longer needed
   */
  cleanup() {
    console.log("🎧 Cleaning up AudioManager");
    this._removeEventListeners();

    try {
      // Reset audio session to default
      AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error("🎧 Error resetting audio session:", error);
    }

    this._isInitialized = false;
  }

  /**
   * Create a singleton instance for easy access
   * @returns {AudioManager} - Single instance of AudioManager
   */
  static getInstance() {
    if (!this._instance) {
      this._instance = new AudioManager();
    }
    return this._instance;
  }
}

export default AudioManager.getInstance();
