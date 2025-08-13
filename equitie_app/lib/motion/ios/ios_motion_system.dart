import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:flutter_haptic_feedback/flutter_haptic_feedback.dart';
import 'package:spring/spring.dart';
import '../core/motion_system.dart';
import '../core/motion_constants.dart';
import 'ios_page_transitions.dart';
import 'ios_spring_animations.dart';

/// iOS-specific motion system implementation
/// Provides native iOS feel with spring physics, bounce effects, and haptic feedback
class IOSMotionSystem implements IPlatformMotionSystem {
  @override
  PageRoute<T> createPageRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool maintainState = true,
    bool fullscreenDialog = false,
  }) {
    if (fullscreenDialog) {
      return IOSModalPageRoute<T>(
        builder: (context) => child,
        settings: settings,
        maintainState: maintainState,
      );
    }
    
    return IOSPageRoute<T>(
      builder: (context) => child,
      settings: settings,
      maintainState: maintainState,
    );
  }

  @override
  Route<T> createModalRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool barrierDismissible = true,
    Color? barrierColor,
    String? barrierLabel,
  }) {
    return IOSModalRoute<T>(
      child: child,
      settings: settings,
      barrierDismissible: barrierDismissible,
      barrierColor: barrierColor ?? Colors.black54,
      barrierLabel: barrierLabel ?? 'Dismiss',
    );
  }

  @override
  Future<void> hapticFeedback(HapticFeedbackType type) async {
    try {
      switch (type) {
        case HapticFeedbackType.light:
          await FlutterHapticFeedback.lightImpact();
          break;
        case HapticFeedbackType.medium:
          await FlutterHapticFeedback.mediumImpact();
          break;
        case HapticFeedbackType.heavy:
          await FlutterHapticFeedback.heavyImpact();
          break;
        case HapticFeedbackType.selection:
          await FlutterHapticFeedback.selectionClick();
          break;
        case HapticFeedbackType.impact:
          await FlutterHapticFeedback.mediumImpact();
          break;
        case HapticFeedbackType.success:
          await FlutterHapticFeedback.lightImpact();
          break;
        case HapticFeedbackType.warning:
          await FlutterHapticFeedback.heavyImpact();
          break;
        case HapticFeedbackType.error:
          await FlutterHapticFeedback.heavyImpact();
          await Future.delayed(const Duration(milliseconds: 100));
          await FlutterHapticFeedback.heavyImpact();
          break;
      }
    } catch (e) {
      // Fallback to system haptic feedback
      HapticFeedback.mediumImpact();
    }
  }

  @override
  Duration getAnimationDuration(AnimationType type) {
    switch (type) {
      case AnimationType.pageTransition:
        return MotionConstants.iOS.pageTransition;
      case AnimationType.modalPresentation:
        return MotionConstants.iOS.modalPresentation;
      case AnimationType.buttonPress:
        return MotionConstants.fast;
      case AnimationType.cardHover:
        return MotionConstants.medium;
      case AnimationType.listItem:
        return MotionConstants.fast;
      case AnimationType.hero:
        return MotionConstants.slow;
      case AnimationType.fab:
        return MotionConstants.medium;
      case AnimationType.drawer:
        return MotionConstants.medium;
      case AnimationType.snackbar:
        return MotionConstants.medium;
      case AnimationType.ripple:
        return MotionConstants.fast; // iOS doesn't use ripples, but provide fallback
    }
  }

  @override
  Curve getAnimationCurve(AnimationType type) {
    switch (type) {
      case AnimationType.pageTransition:
        return MotionConstants.iOS.easeCurve;
      case AnimationType.modalPresentation:
        return MotionConstants.iOS.easeCurve;
      case AnimationType.buttonPress:
        return MotionConstants.iOS.bounceCurve;
      case AnimationType.cardHover:
        return MotionConstants.bounceEase;
      case AnimationType.listItem:
        return MotionConstants.gentleEase;
      case AnimationType.hero:
        return MotionConstants.iOS.easeCurve;
      case AnimationType.fab:
        return MotionConstants.iOS.bounceCurve;
      case AnimationType.drawer:
        return MotionConstants.iOS.easeCurve;
      case AnimationType.snackbar:
        return MotionConstants.gentleEase;
      case AnimationType.ripple:
        return MotionConstants.gentleEase;
    }
  }

  @override
  Widget createScaleAnimation({
    required Widget child,
    required AnimationController controller,
    double? scale,
    Curve? curve,
  }) {
    return IOSSpringScaleAnimation(
      controller: controller,
      scale: scale ?? MotionConstants.smallScale,
      curve: curve ?? MotionConstants.iOS.bounceCurve,
      child: child,
    );
  }

  @override
  Widget createSlideAnimation({
    required Widget child,
    required AnimationController controller,
    Offset? offset,
    Curve? curve,
  }) {
    return IOSSpringSlideAnimation(
      controller: controller,
      offset: offset ?? const Offset(0.0, 1.0),
      curve: curve ?? MotionConstants.iOS.easeCurve,
      child: child,
    );
  }

  @override
  Widget createFadeAnimation({
    required Widget child,
    required AnimationController controller,
    Curve? curve,
  }) {
    return IOSFadeAnimation(
      controller: controller,
      curve: curve ?? MotionConstants.iOS.easeCurve,
      child: child,
    );
  }
}

/// iOS-style fade animation with smooth easing
class IOSFadeAnimation extends StatelessWidget {
  final Widget child;
  final AnimationController controller;
  final Curve curve;

  const IOSFadeAnimation({
    super.key,
    required this.child,
    required this.controller,
    this.curve = Curves.easeInOutCubic,
  });

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: controller,
        curve: curve,
      ),
      child: child,
    );
  }
}