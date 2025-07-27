const { withInfoPlist, withEntitlementsPlist } = require('@expo/config-plugins');

/**
 * Plugin to configure Apple Sign-In for iOS
 */
const withAppleSignIn = (config) => {
  // Configure iOS Info.plist
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Add Apple Sign-In usage description (optional but recommended)
    infoPlist.NSAppleSignInUsageDescription = 
      "This app uses Apple Sign-In to provide a secure and private way to sign in to your account.";
    
    return config;
  });

  // Configure iOS Entitlements
  config = withEntitlementsPlist(config, (config) => {
    const entitlements = config.modResults;
    
    // Add Apple Sign-In capability
    entitlements['com.apple.developer.applesignin'] = ['Default'];
    
    return config;
  });

  return config;
};

module.exports = withAppleSignIn;
