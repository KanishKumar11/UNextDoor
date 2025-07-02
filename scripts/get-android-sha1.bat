@echo off
REM Script to get Android SHA-1 fingerprint for Google OAuth setup
REM This script helps developers get the SHA-1 fingerprint needed for Google Cloud Console

echo 🔑 Android SHA-1 Fingerprint Generator for Google OAuth
echo =======================================================
echo.

REM Check if keytool is available
keytool -help >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ keytool not found. Please install Java JDK.
    echo    Download from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

echo 📱 Getting SHA-1 fingerprints for Android...
echo.

REM Debug keystore (for development)
echo 🔧 DEBUG KEYSTORE (for development builds):
echo ============================================

set DEBUG_KEYSTORE=%USERPROFILE%\.android\debug.keystore

if exist "%DEBUG_KEYSTORE%" (
    echo 📍 Debug keystore found at: %DEBUG_KEYSTORE%
    echo.
    echo SHA-1 Fingerprint:
    keytool -list -v -keystore "%DEBUG_KEYSTORE%" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1:"
    echo.
    echo 📋 Copy the SHA-1 fingerprint above and add it to your Google Cloud Console:
    echo    1. Go to Google Cloud Console ^> APIs ^& Services ^> Credentials
    echo    2. Edit your Android OAuth 2.0 Client ID
    echo    3. Add the SHA-1 fingerprint
    echo.
) else (
    echo ❌ Debug keystore not found at: %DEBUG_KEYSTORE%
    echo    Run your app once in development mode to generate it:
    echo    npx expo run:android
    echo.
)

REM Release keystore (for production)
echo 🚀 RELEASE KEYSTORE (for production builds):
echo =============================================
echo If you have a release keystore, run this command:
echo keytool -list -v -keystore C:\path\to\your\release.keystore -alias your-alias
echo.
echo 📝 Note: You'll need to create a release keystore for production builds.
echo    Follow Expo's guide: https://docs.expo.dev/app-signing/app-credentials/
echo.

REM Additional information
echo ℹ️  ADDITIONAL INFORMATION:
echo ==========================
echo • Package name: com.UNextDoor.app
echo • For Google Cloud Console, you need:
echo   - Package name: com.UNextDoor.app
echo   - SHA-1 fingerprint (from above)
echo.
echo • For iOS, you need:
echo   - Bundle ID: com.UNextDoor.app
echo.
echo 🔗 Useful links:
echo • Google Cloud Console: https://console.cloud.google.com/
echo • Expo App Signing: https://docs.expo.dev/app-signing/app-credentials/
echo • React Native Google Sign-In: https://github.com/react-native-google-signin/google-signin
echo.
echo ✅ Done! Use the SHA-1 fingerprint above in your Google Cloud Console.
echo.
pause
