const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

/**
 * Plugin to configure Google Sign-In for Android and iOS
 */
const withGoogleSignIn = (config, { iosClientId, androidClientId, webClientId }) => {
  // Configure Android
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Add internet permission if not already present
    if (!androidManifest.manifest.permission) {
      androidManifest.manifest.permission = [];
    }
    
    const internetPermission = androidManifest.manifest.permission.find(
      (permission) => permission.$['android:name'] === 'android.permission.INTERNET'
    );
    
    if (!internetPermission) {
      androidManifest.manifest.permission.push({
        $: {
          'android:name': 'android.permission.INTERNET',
        },
      });
    }

    return config;
  });

  // Configure iOS
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Add URL scheme for Google Sign-In
    if (iosClientId) {
      const reversedClientId = iosClientId.split('.').reverse().join('.');
      
      if (!infoPlist.CFBundleURLTypes) {
        infoPlist.CFBundleURLTypes = [];
      }
      
      // Check if Google URL scheme already exists
      const existingGoogleScheme = infoPlist.CFBundleURLTypes.find(
        (urlType) => urlType.CFBundleURLSchemes && 
        urlType.CFBundleURLSchemes.includes(reversedClientId)
      );
      
      if (!existingGoogleScheme) {
        infoPlist.CFBundleURLTypes.push({
          CFBundleURLName: 'GoogleSignIn',
          CFBundleURLSchemes: [reversedClientId],
        });
      }
    }

    return config;
  });

  return config;
};

module.exports = withGoogleSignIn;
