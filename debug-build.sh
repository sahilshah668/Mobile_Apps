#!/bin/bash

echo "🔍 Starting debug build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

# Clear Metro cache
echo "🗑️ Clearing Metro cache..."
npx react-native start --reset-cache &

# Wait for Metro to start
sleep 5

# Build debug APK
echo "🔨 Building debug APK..."
cd android && ./gradlew assembleDebug && cd ..

echo "✅ Debug build completed!"
echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🔍 To install and test:"
echo "1. adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo "2. adb logcat | grep -E '(ReactNativeJS|🔍|❌)'"
echo ""
echo "🔍 To view logs in real-time:"
echo "adb logcat | grep -E '(ReactNativeJS|🔍|❌|ErrorBoundary)'"
