/**
 * Client-side tools for OpenAI Realtime API
 * 
 * These tools can be used by the AI assistant during realtime conversations
 * to access device capabilities.
 */

import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

/**
 * Get device battery level
 * @param {Object} args - Arguments (none required)
 * @returns {Promise<Object>} Battery information
 */
const getBatteryLevel = async (args) => {
  try {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    const batteryState = await Battery.getBatteryStateAsync();
    
    let stateString = 'unknown';
    switch (batteryState) {
      case Battery.BatteryState.CHARGING:
        stateString = 'charging';
        break;
      case Battery.BatteryState.FULL:
        stateString = 'full';
        break;
      case Battery.BatteryState.UNPLUGGED:
        stateString = 'unplugged';
        break;
    }
    
    return {
      level: Math.round(batteryLevel * 100),
      state: stateString,
      lowPowerMode: await Battery.isLowPowerModeEnabledAsync(),
    };
  } catch (error) {
    console.error('Error getting battery level:', error);
    return { error: 'Failed to get battery level', message: error.message };
  }
};

/**
 * Set screen brightness
 * @param {Object} args - Arguments
 * @param {number} args.brightness - Brightness level (0 to 1)
 * @returns {Promise<Object>} Result
 */
const setScreenBrightness = async (args) => {
  try {
    const { brightness } = args;
    
    // Validate brightness value
    if (typeof brightness !== 'number' || brightness < 0 || brightness > 1) {
      return { 
        error: 'Invalid brightness value', 
        message: 'Brightness must be a number between 0 and 1' 
      };
    }
    
    // Request permission if needed
    const { status } = await Brightness.requestPermissionsAsync();
    if (status !== 'granted') {
      return { 
        error: 'Permission denied', 
        message: 'User denied permission to change screen brightness' 
      };
    }
    
    // Set brightness
    await Brightness.setSystemBrightnessAsync(brightness);
    
    return {
      success: true,
      brightness,
      message: `Screen brightness set to ${Math.round(brightness * 100)}%`,
    };
  } catch (error) {
    console.error('Error setting screen brightness:', error);
    return { error: 'Failed to set brightness', message: error.message };
  }
};

/**
 * Get device information
 * @param {Object} args - Arguments (none required)
 * @returns {Promise<Object>} Device information
 */
const getDeviceInfo = async (args) => {
  try {
    const deviceType = Device.deviceType;
    let deviceTypeString = 'unknown';
    
    switch (deviceType) {
      case Device.DeviceType.PHONE:
        deviceTypeString = 'phone';
        break;
      case Device.DeviceType.TABLET:
        deviceTypeString = 'tablet';
        break;
      case Device.DeviceType.DESKTOP:
        deviceTypeString = 'desktop';
        break;
      case Device.DeviceType.TV:
        deviceTypeString = 'tv';
        break;
    }
    
    const networkState = await Network.getNetworkStateAsync();
    
    return {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceType: deviceTypeString,
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      networkType: networkState.type,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return { error: 'Failed to get device info', message: error.message };
  }
};

// Export all tools
export const clientTools = {
  getBatteryLevel,
  setScreenBrightness,
  getDeviceInfo,
};

// Schema for OpenAI to understand the tools
export const clientToolsSchema = [
  {
    type: 'function',
    function: {
      name: 'getBatteryLevel',
      description: 'Get the current battery level and state of the device',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setScreenBrightness',
      description: 'Set the screen brightness of the device',
      parameters: {
        type: 'object',
        properties: {
          brightness: {
            type: 'number',
            description: 'Brightness level from 0 (darkest) to 1 (brightest)',
          },
        },
        required: ['brightness'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDeviceInfo',
      description: 'Get information about the device, such as model, OS, and network status',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];
