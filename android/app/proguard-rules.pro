# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class expo.modules.kotlin.** { *; }
-keep class expo.modules.kotlin.functions.** { *; }
-keep class expo.modules.kotlin.modules.** { *; }
-keep class expo.modules.notifications.** { *; }
-keep class expo.modules.notifications.badge.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Suppress warnings
-dontwarn expo.modules.**
-dontwarn expo.modules.kotlin.**
-dontwarn expo.modules.notifications.**
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# Add any project specific keep options here:
