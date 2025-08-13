import 'dart:io';
import 'package:flutter/foundation.dart';

/// Platform-specific motion behavior detector
/// Determines the appropriate motion system to use based on the current platform
class PlatformMotionDetector {
  PlatformMotionDetector._();

  /// Returns true if running on iOS (iPhone, iPad)
  static bool get isIOS => !kIsWeb && Platform.isIOS;

  /// Returns true if running on Android
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;

  /// Returns true if running on Web
  static bool get isWeb => kIsWeb;

  /// Returns true if running on macOS
  static bool get isMacOS => !kIsWeb && Platform.isMacOS;

  /// Returns true if running on Windows
  static bool get isWindows => !kIsWeb && Platform.isWindows;

  /// Returns true if running on Linux
  static bool get isLinux => !kIsWeb && Platform.isLinux;

  /// Returns true for mobile platforms (iOS, Android)
  static bool get isMobile => isIOS || isAndroid;

  /// Returns true for desktop platforms (macOS, Windows, Linux)
  static bool get isDesktop => isMacOS || isWindows || isLinux;

  /// Returns the appropriate motion platform type
  static MotionPlatform get currentPlatform {
    if (isIOS) return MotionPlatform.ios;
    if (isAndroid) return MotionPlatform.android;
    if (isWeb) return MotionPlatform.web;
    if (isMacOS) return MotionPlatform.macos;
    if (isWindows) return MotionPlatform.windows;
    if (isLinux) return MotionPlatform.linux;
    return MotionPlatform.unknown;
  }

  /// Returns true if haptic feedback is supported
  static bool get supportsHaptics => isMobile;

  /// Returns true if platform supports native spring animations
  static bool get supportsNativeSpring => isIOS || isMacOS;

  /// Returns true if platform supports material ripple effects
  static bool get supportsMaterialRipple => isAndroid || isWeb;

  /// Returns true if platform supports mouse hover effects
  static bool get supportsHover => isWeb || isDesktop;

  /// Returns true if platform supports keyboard navigation
  static bool get supportsKeyboardNavigation => isWeb || isDesktop;

  /// Returns the recommended performance profile for animations
  static PerformanceProfile get performanceProfile {
    if (isMobile) return PerformanceProfile.optimized;
    if (isWeb) return PerformanceProfile.balanced;
    if (isDesktop) return PerformanceProfile.enhanced;
    return PerformanceProfile.basic;
  }
}

/// Available motion platforms
enum MotionPlatform {
  ios,
  android,
  web,
  macos,
  windows,
  linux,
  unknown,
}

/// Performance profiles for different platforms
enum PerformanceProfile {
  /// Basic animations, minimal GPU usage
  basic,
  
  /// Optimized for mobile performance
  optimized,
  
  /// Balanced performance for web
  balanced,
  
  /// Enhanced animations for desktop
  enhanced,
}

/// Extension methods for MotionPlatform
extension MotionPlatformExtension on MotionPlatform {
  /// Returns the human-readable name of the platform
  String get displayName {
    switch (this) {
      case MotionPlatform.ios:
        return 'iOS';
      case MotionPlatform.android:
        return 'Android';
      case MotionPlatform.web:
        return 'Web';
      case MotionPlatform.macos:
        return 'macOS';
      case MotionPlatform.windows:
        return 'Windows';
      case MotionPlatform.linux:
        return 'Linux';
      case MotionPlatform.unknown:
        return 'Unknown';
    }
  }

  /// Returns true if the platform prefers iOS-style animations
  bool get prefersIOSStyle => this == MotionPlatform.ios || this == MotionPlatform.macos;

  /// Returns true if the platform prefers Material Design animations
  bool get prefersMaterialStyle => this == MotionPlatform.android;

  /// Returns true if the platform prefers web-style smooth animations
  bool get prefersWebStyle => this == MotionPlatform.web;
}