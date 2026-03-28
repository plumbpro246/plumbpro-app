#!/bin/bash
# PlumbPro iOS Build Script

echo "==================================="
echo "PlumbPro iOS Build"
echo "==================================="

# Navigate to frontend
cd /app/frontend

# Build the React app
echo "Building React app..."
yarn build

# Add iOS platform if not already done
if [ ! -d "ios" ]; then
  echo "Adding iOS platform..."
  npx cap add ios
fi

# Sync web assets to iOS
echo "Syncing to iOS..."
npx cap sync ios

echo ""
echo "==================================="
echo "Build Complete!"
echo "==================================="
echo ""
echo "Next steps for App Store:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Set your development team in Signing & Capabilities"
echo "3. Product > Archive to create the build"
echo "4. Distribute to App Store Connect"
echo ""
echo "Requirements:"
echo "- macOS with Xcode installed"
echo "- Apple Developer account ($99/year)"
echo "- App Store Connect access"
echo ""
