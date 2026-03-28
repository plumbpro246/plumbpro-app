#!/bin/bash
# PlumbPro Android Build Script

echo "==================================="
echo "PlumbPro Android Build"
echo "==================================="

# Navigate to frontend
cd /app/frontend

# Build the React app
echo "Building React app..."
yarn build

# Initialize Capacitor if not already done
if [ ! -d "android" ]; then
  echo "Initializing Capacitor Android..."
  npx cap init PlumbPro com.plumbpro.fieldcompanion --web-dir build
  npx cap add android
fi

# Sync web assets to Android
echo "Syncing to Android..."
npx cap sync android

echo ""
echo "==================================="
echo "Build Complete!"
echo "==================================="
echo ""
echo "Next steps to generate APK:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Build > Generate Signed Bundle/APK"
echo "3. Choose APK and follow the signing wizard"
echo ""
echo "For Play Store release:"
echo "1. Generate signed AAB (Android App Bundle)"
echo "2. Upload to Google Play Console"
echo "3. Complete store listing with screenshots"
echo ""
