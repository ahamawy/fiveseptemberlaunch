import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'platform_motion_detector.dart';
import 'motion_constants.dart';
import '../ios/ios_motion_system.dart';
import '../android/android_motion_system.dart';
import '../web/web_motion_system.dart';

/// Central motion system that adapts to the current platform
/// Provides a unified API for all motion and animation needs
class MotionSystem {
  static final MotionSystem _instance = MotionSystem._internal();
  factory MotionSystem() => _instance;
  MotionSystem._internal();

  late final IPlatformMotionSystem _platformSystem;
  bool _initialized = false;

  /// Initialize the motion system with platform-specific implementations
  void initialize() {
    if (_initialized) return;

    switch (PlatformMotionDetector.currentPlatform) {
      case MotionPlatform.ios:
      case MotionPlatform.macos:
        _platformSystem = IOSMotionSystem();
        break;
      case MotionPlatform.android:
        _platformSystem = AndroidMotionSystem();
        break;
      case MotionPlatform.web:
      case MotionPlatform.windows:
      case MotionPlatform.linux:
        _platformSystem = WebMotionSystem();
        break;
      case MotionPlatform.unknown:
        _platformSystem = WebMotionSystem(); // Fallback to web
        break;
    }

    _initialized = true;
  }

  /// Get the current platform motion system
  IPlatformMotionSystem get platform {
    if (!_initialized) initialize();
    return _platformSystem;
  }

  /// Create a platform-appropriate page route
  PageRoute<T> createPageRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool maintainState = true,
    bool fullscreenDialog = false,
  }) {
    if (!_initialized) initialize();
    return _platformSystem.createPageRoute<T>(
      child: child,
      settings: settings,
      maintainState: maintainState,
      fullscreenDialog: fullscreenDialog,
    );
  }

  /// Create a platform-appropriate modal route
  Route<T> createModalRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool barrierDismissible = true,
    Color? barrierColor,
    String? barrierLabel,
  }) {
    if (!_initialized) initialize();
    return _platformSystem.createModalRoute<T>(
      child: child,
      settings: settings,
      barrierDismissible: barrierDismissible,
      barrierColor: barrierColor,
      barrierLabel: barrierLabel,
    );
  }

  /// Trigger platform-appropriate haptic feedback
  Future<void> hapticFeedback(HapticFeedbackType type) async {
    if (!_initialized) initialize();
    await _platformSystem.hapticFeedback(type);
  }

  /// Get platform-appropriate animation duration
  Duration getAnimationDuration(AnimationType type) {
    if (!_initialized) initialize();
    return _platformSystem.getAnimationDuration(type);
  }

  /// Get platform-appropriate animation curve
  Curve getAnimationCurve(AnimationType type) {
    if (!_initialized) initialize();
    return _platformSystem.getAnimationCurve(type);
  }

  /// Create a platform-appropriate scale animation
  Widget createScaleAnimation({
    required Widget child,
    required AnimationController controller,
    double? scale,
    Curve? curve,
  }) {
    if (!_initialized) initialize();
    return _platformSystem.createScaleAnimation(
      child: child,
      controller: controller,
      scale: scale,
      curve: curve,
    );
  }

  /// Create a platform-appropriate slide animation
  Widget createSlideAnimation({
    required Widget child,
    required AnimationController controller,
    Offset? offset,
    Curve? curve,
  }) {
    if (!_initialized) initialize();
    return _platformSystem.createSlideAnimation(
      child: child,
      controller: controller,
      offset: offset,
      curve: curve,
    );
  }

  /// Create a platform-appropriate fade animation
  Widget createFadeAnimation({
    required Widget child,
    required AnimationController controller,
    Curve? curve,
  }) {
    if (!_initialized) initialize();
    return _platformSystem.createFadeAnimation(
      child: child,
      controller: controller,
      curve: curve,
    );
  }

  /// Get performance information
  PerformanceInfo getPerformanceInfo() {
    return PerformanceInfo(
      platform: PlatformMotionDetector.currentPlatform,
      profile: PlatformMotionDetector.performanceProfile,
      supportsHaptics: PlatformMotionDetector.supportsHaptics,
      supportsHover: PlatformMotionDetector.supportsHover,
      droppedFrames: PerformanceMetrics.droppedFrames,
      averageFrameTime: PerformanceMetrics.averageFrameTime,
      activeAnimations: PerformanceMetrics.activeAnimations,
    );
  }
}

/// Interface for platform-specific motion systems
abstract class IPlatformMotionSystem {
  PageRoute<T> createPageRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool maintainState = true,
    bool fullscreenDialog = false,
  });

  Route<T> createModalRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool barrierDismissible = true,
    Color? barrierColor,
    String? barrierLabel,
  });

  Future<void> hapticFeedback(HapticFeedbackType type);

  Duration getAnimationDuration(AnimationType type);
  Curve getAnimationCurve(AnimationType type);

  Widget createScaleAnimation({
    required Widget child,
    required AnimationController controller,
    double? scale,
    Curve? curve,
  });

  Widget createSlideAnimation({
    required Widget child,
    required AnimationController controller,
    Offset? offset,
    Curve? curve,
  });

  Widget createFadeAnimation({
    required Widget child,
    required AnimationController controller,
    Curve? curve,
  });
}

/// Types of animations supported by the motion system
enum AnimationType {
  pageTransition,
  modalPresentation,
  buttonPress,
  cardHover,
  listItem,
  hero,
  fab,
  drawer,
  snackbar,
  ripple,
}

/// Types of haptic feedback
enum HapticFeedbackType {
  light,
  medium,
  heavy,
  selection,
  impact,
  success,
  warning,
  error,
}

/// Performance information container
class PerformanceInfo {
  final MotionPlatform platform;
  final PerformanceProfile profile;
  final bool supportsHaptics;
  final bool supportsHover;
  final int droppedFrames;
  final double averageFrameTime;
  final int activeAnimations;

  const PerformanceInfo({
    required this.platform,
    required this.profile,
    required this.supportsHaptics,
    required this.supportsHover,
    required this.droppedFrames,
    required this.averageFrameTime,
    required this.activeAnimations,
  });

  /// Returns true if performance is good (< 16.67ms frame time, < 5% dropped frames)
  bool get isPerformanceGood =>
      averageFrameTime < MotionConstants.frameDuration &&
      droppedFrames < 3; // Less than 5% dropped frames in 60-frame sample

  @override
  String toString() {
    return 'PerformanceInfo('
        'platform: ${platform.displayName}, '
        'profile: $profile, '
        'avgFrameTime: ${averageFrameTime.toStringAsFixed(2)}ms, '
        'droppedFrames: $droppedFrames, '
        'activeAnimations: $activeAnimations'
        ')';
  }
}