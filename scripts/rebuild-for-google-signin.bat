@echo off
REM Script to rebuild the app for Google Sign-In
echo 🔄 Rebuilding app for Google Sign-In...
echo ======================================

cd app

echo 1️⃣ Cleaning Expo cache...
call npx expo install --fix

echo 2️⃣ Running prebuild with clean...
call npx expo prebuild --clean

echo 3️⃣ Installing dependencies...
call npm install

echo ✅ Rebuild complete!
echo.
echo 📱 Next steps:
echo    • For Android: npx expo run:android
echo    • For iOS: npx expo run:ios
echo.
echo ⚠️  Important:
echo    • Test on a physical device, not simulator
echo    • Make sure Google Cloud Console is configured
echo    • Ensure SHA-1 fingerprint is added for Android
echo.
pause
