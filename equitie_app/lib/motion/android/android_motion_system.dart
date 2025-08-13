import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_haptic_feedback/flutter_haptic_feedback.dart';
import '../core/motion_system.dart';
import '../core/motion_constants.dart';
import 'material_page_transitions.dart';
import 'material_animations.dart';

/// Android Material Design 3 motion system implementation
/// Provides authentic Material Design animations with emphasis on easing curves and elevation
class AndroidMotionSystem implements IPlatformMotionSystem {
  @override
  PageRoute<T> createPageRoute<T extends Object?>({
    required Widget child,
    RouteSettings? settings,
    bool maintainState = true,
    bool fullscreenDialog = false,
  }) {
    if (fullscreenDialog) {
      return MaterialModalPageRoute<T>(
        builder: (context) => child,
        settings: settings,
        maintainState: maintainState,
      );
    }
    
    return MaterialPageRoute<T>(
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
    return MaterialModalRoute<T>(
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
        case HapticFeedbackType.selection:
          await FlutterHapticFeedback.lightImpact();
          break;
        case HapticFeedbackType.medium:
        case HapticFeedbackType.impact:
          await FlutterHapticFeedback.mediumImpact();
          break;
        case HapticFeedbackType.heavy:
          await FlutterHapticFeedback.heavyImpact();
          break;
        case HapticFeedbackType.success:
          await FlutterHapticFeedback.selectionClick();
          break;
        case HapticFeedbackType.warning:
          await FlutterHapticFeedback.mediumImpact();
          break;
        case HapticFeedbackType.error:
          await FlutterHapticFeedback.heavyImpact();
          break;
      }
    } catch (e) {
      // Fallback to system haptic feedback
      HapticFeedback.selectionClick();
    }
  }

  @override
  Duration getAnimationDuration(AnimationType type) {
    switch (type) {
      case AnimationType.pageTransition:
        return MotionConstants.Android.pageTransition;
      case AnimationType.modalPresentation:
        return MotionConstants.Android.pageTransition;
      case AnimationType.buttonPress:
        return MotionConstants.Android.rippleDuration;
      case AnimationType.cardHover:
        return MotionConstants.Android.elevationDuration;
      case AnimationType.listItem:
        return MotionConstants.fast;
      case AnimationType.hero:
        return MotionConstants.Android.sharedElementTransition;
      case AnimationType.fab:
        return MotionConstants.Android.fabTransformation;
      case AnimationType.drawer:
        return MotionConstants.medium;
      case AnimationType.snackbar:
        return MotionConstants.medium;
      case AnimationType.ripple:
        return MotionConstants.Android.rippleDuration;
    }
  }

  @override
  Curve getAnimationCurve(AnimationType type) {
    switch (type) {
      case AnimationType.pageTransition:
        return MotionConstants.Android.emphasizedEasing;
      case AnimationType.modalPresentation:
        return MotionConstants.Android.emphasizedEasing;
      case AnimationType.buttonPress:
      case AnimationType.ripple:
        return MotionConstants.Android.standardEasing;
      case AnimationType.cardHover:
        return MotionConstants.Android.standardEasing;
      case AnimationType.listItem:
        return MotionConstants.Android.standardEasing;
      case AnimationType.hero:
        return MotionConstants.Android.emphasizedEasing;
      case AnimationType.fab:
        return MotionConstants.Android.emphasizedEasing;
      case AnimationType.drawer:
        return MotionConstants.Android.standardEasing;
      case AnimationType.snackbar:
        return MotionConstants.Android.standardEasing;
    }
  }

  @override
  Widget createScaleAnimation({
    required Widget child,
    required AnimationController controller,
    double? scale,
    Curve? curve,
  }) {
    return MaterialScaleAnimation(
      controller: controller,
      scale: scale ?? MotionConstants.smallScale,
      curve: curve ?? MotionConstants.Android.standardEasing,
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
    return MaterialSlideAnimation(
      controller: controller,
      offset: offset ?? const Offset(0.0, 1.0),
      curve: curve ?? MotionConstants.Android.emphasizedEasing,
      child: child,
    );
  }

  @override
  Widget createFadeAnimation({
    required Widget child,
    required AnimationController controller,
    Curve? curve,
  }) {
    return MaterialFadeAnimation(
      controller: controller,
      curve: curve ?? MotionConstants.Android.standardEasing,
      child: child,
    );
  }
}

/// Material Design fade animation with standard easing
class MaterialFadeAnimation extends StatelessWidget {
  final Widget child;
  final AnimationController controller;
  final Curve curve;

  const MaterialFadeAnimation({
    super.key,
    required this.child,
    required this.controller,
    this.curve = Curves.easeInOut,
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