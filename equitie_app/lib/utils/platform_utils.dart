import 'dart:io';
import 'package:flutter/foundation.dart';

/// Platform-specific utilities for iOS and web adaptation
class PlatformUtils {
  /// Check if running on iOS
  static bool get isIOS => !kIsWeb && Platform.isIOS;

  /// Check if running on Android
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;

  /// Check if running on web
  static bool get isWeb => kIsWeb;

  /// Check if running on mobile (iOS or Android)
  static bool get isMobile => isIOS || isAndroid;

  /// Check if running on desktop platforms
  static bool get isDesktop => !kIsWeb && (Platform.isMacOS || Platform.isWindows || Platform.isLinux);

  /// Get platform-specific padding for safe areas
  static double get defaultSafeAreaTop => isIOS ? 44.0 : 24.0;
  static double get defaultSafeAreaBottom => isIOS ? 34.0 : 0.0;

  /// Get platform-specific app bar height
  static double get appBarHeight => isIOS ? 44.0 : 56.0;

  /// Get platform-specific tab bar height
  static double get tabBarHeight => isIOS ? 83.0 : 72.0;

  /// Get platform-specific navigation bar height
  static double get navigationBarHeight => isIOS ? 83.0 : 80.0;

  /// Get platform-specific button height
  static double get buttonHeight => isIOS ? 50.0 : 48.0;

  /// Get platform-specific text field height
  static double get textFieldHeight => isIOS ? 44.0 : 56.0;

  /// Check if the platform supports haptic feedback
  static bool get supportsHapticFeedback => isMobile;

  /// Check if the platform supports biometric authentication
  static bool get supportsBiometrics => isMobile;

  /// Get platform-specific scroll physics
  static String get scrollPhysics => isIOS ? 'ios' : 'android';

  /// Get platform-specific elevation
  static double get cardElevation => isIOS ? 0.0 : 2.0;
  static double get buttonElevation => isIOS ? 0.0 : 2.0;

  /// Get platform-specific border radius
  static double get defaultBorderRadius => isIOS ? 8.0 : 4.0;

  /// Check if dark mode is supported
  static bool get supportsDarkMode => true;

  /// Get platform-specific animation duration
  static Duration get defaultAnimationDuration => 
      Duration(milliseconds: isIOS ? 300 : 200);

  /// Get platform-specific curve
  static String get defaultCurve => isIOS ? 'easeInOut' : 'fastOutSlowIn';

  /// Platform-specific file path separator
  static String get pathSeparator => isWeb ? '/' : Platform.pathSeparator;

  /// Check if platform supports file system access
  static bool get supportsFileSystem => !isWeb;

  /// Check if platform supports camera
  static bool get supportsCamera => isMobile;

  /// Check if platform supports notifications
  static bool get supportsNotifications => isMobile || isDesktop;

  /// Get platform name as string
  static String get platformName {
    if (isWeb) return 'Web';
    if (isIOS) return 'iOS';
    if (isAndroid) return 'Android';
    if (Platform.isMacOS) return 'macOS';
    if (Platform.isWindows) return 'Windows';
    if (Platform.isLinux) return 'Linux';
    return 'Unknown';
  }

  /// Get user agent string for web
  static String get userAgent {
    if (!isWeb) return '';
    // This would typically be implemented with web-specific imports
    return 'Flutter Web';
  }

  /// Check if running in debug mode
  static bool get isDebugMode => kDebugMode;

  /// Check if running in release mode
  static bool get isReleaseMode => kReleaseMode;

  /// Check if running in profile mode
  static bool get isProfileMode => kProfileMode;
}