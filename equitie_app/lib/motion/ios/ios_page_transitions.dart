import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import '../core/motion_constants.dart';

/// iOS-style page route with native transition animations
class IOSPageRoute<T> extends PageRouteBuilder<T> {
  final WidgetBuilder builder;

  IOSPageRoute({
    required this.builder,
    RouteSettings? settings,
    bool maintainState = true,
  }) : super(
          settings: settings,
          maintainState: maintainState,
          pageBuilder: (context, animation, secondaryAnimation) => builder(context),
          transitionDuration: MotionConstants.iOS.pageTransition,
          reverseTransitionDuration: MotionConstants.iOS.pageTransition,
          transitionsBuilder: _buildTransition,
        );

  static Widget _buildTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    // Primary animation: slide from right
    final slideAnimation = Tween<Offset>(
      begin: const Offset(1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    // Secondary animation: slide previous page to left
    final secondarySlideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(-0.3, 0.0),
    ).animate(CurvedAnimation(
      parent: secondaryAnimation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    return Stack(
      children: [
        // Previous page sliding out
        SlideTransition(
          position: secondarySlideAnimation,
          child: Container(), // This will be the previous page
        ),
        // New page sliding in
        SlideTransition(
          position: slideAnimation,
          child: child,
        ),
      ],
    );
  }
}

/// iOS-style modal page route with vertical slide animation
class IOSModalPageRoute<T> extends PageRouteBuilder<T> {
  final WidgetBuilder builder;

  IOSModalPageRoute({
    required this.builder,
    RouteSettings? settings,
    bool maintainState = true,
  }) : super(
          settings: settings,
          maintainState: maintainState,
          pageBuilder: (context, animation, secondaryAnimation) => builder(context),
          transitionDuration: MotionConstants.iOS.modalPresentation,
          reverseTransitionDuration: MotionConstants.iOS.modalPresentation,
          transitionsBuilder: _buildModalTransition,
          opaque: false,
          barrierColor: Colors.black54,
        );

  static Widget _buildModalTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    // Slide from bottom with iOS-style curve
    final slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 1.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    // Scale previous page slightly
    final scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: secondaryAnimation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    return Stack(
      children: [
        // Previous page scaling down
        Transform.scale(
          scale: scaleAnimation.value,
          child: Container(), // This will be the previous page
        ),
        // Modal sliding up
        SlideTransition(
          position: slideAnimation,
          child: child,
        ),
      ],
    );
  }
}

/// Custom iOS modal route for overlays and dialogs
class IOSModalRoute<T> extends ModalRoute<T> {
  final Widget child;
  final bool barrierDismissible;
  final Color barrierColor;
  final String barrierLabel;

  IOSModalRoute({
    required this.child,
    RouteSettings? settings,
    this.barrierDismissible = true,
    this.barrierColor = Colors.black54,
    this.barrierLabel = 'Dismiss',
  }) : super(settings: settings);

  @override
  Duration get transitionDuration => MotionConstants.iOS.modalPresentation;

  @override
  Duration get reverseTransitionDuration => MotionConstants.iOS.modalPresentation;

  @override
  bool get opaque => false;

  @override
  bool get maintainState => true;

  @override
  Widget buildPage(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) {
    return child;
  }

  @override
  Widget buildTransitions(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return IOSModalTransition(
      animation: animation,
      child: child,
    );
  }
}

/// iOS-style modal transition widget
class IOSModalTransition extends StatelessWidget {
  final Animation<double> animation;
  final Widget child;

  const IOSModalTransition({
    super.key,
    required this.animation,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    // Fade in animation
    final fadeAnimation = CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.easeCurve,
    );

    // Scale animation for modal
    final scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.bounceCurve,
    ));

    return FadeTransition(
      opacity: fadeAnimation,
      child: ScaleTransition(
        scale: scaleAnimation,
        child: child,
      ),
    );
  }
}

/// iOS-style hero page route for seamless element transitions
class IOSHeroPageRoute<T> extends PageRouteBuilder<T> {
  final WidgetBuilder builder;
  final String heroTag;

  IOSHeroPageRoute({
    required this.builder,
    required this.heroTag,
    RouteSettings? settings,
    bool maintainState = true,
  }) : super(
          settings: settings,
          maintainState: maintainState,
          pageBuilder: (context, animation, secondaryAnimation) => builder(context),
          transitionDuration: MotionConstants.slow,
          reverseTransitionDuration: MotionConstants.slow,
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              _buildHeroTransition(context, animation, secondaryAnimation, child, heroTag),
        );

  static Widget _buildHeroTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
    String heroTag,
  ) {
    // Fade animation for background
    final fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: const Interval(0.3, 1.0, curve: MotionConstants.iOS.easeCurve),
    ));

    // Scale animation for secondary page
    final secondaryScaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.9,
    ).animate(CurvedAnimation(
      parent: secondaryAnimation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    return Stack(
      children: [
        // Previous page scaling down
        Transform.scale(
          scale: secondaryScaleAnimation.value,
          child: Container(), // This will be the previous page
        ),
        // New page fading in (Hero animation handles the transition)
        FadeTransition(
          opacity: fadeAnimation,
          child: child,
        ),
      ],
    );
  }
}

/// iOS-style drawer route with slide animation
class IOSDrawerRoute<T> extends PageRouteBuilder<T> {
  final WidgetBuilder builder;
  final bool isRightToLeft;

  IOSDrawerRoute({
    required this.builder,
    this.isRightToLeft = false,
    RouteSettings? settings,
  }) : super(
          settings: settings,
          maintainState: true,
          opaque: false,
          barrierColor: Colors.black38,
          barrierDismissible: true,
          pageBuilder: (context, animation, secondaryAnimation) => builder(context),
          transitionDuration: MotionConstants.medium,
          reverseTransitionDuration: MotionConstants.medium,
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              _buildDrawerTransition(context, animation, secondaryAnimation, child, isRightToLeft),
        );

  static Widget _buildDrawerTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
    bool isRightToLeft,
  ) {
    // Slide animation for drawer
    final slideAnimation = Tween<Offset>(
      begin: Offset(isRightToLeft ? 1.0 : -1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    // Scale animation for background page
    final scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.85,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: MotionConstants.iOS.easeCurve,
    ));

    return Stack(
      children: [
        // Background page scaling down
        Transform.scale(
          scale: scaleAnimation.value,
          child: Container(), // This will be the background page
        ),
        // Drawer sliding in
        SlideTransition(
          position: slideAnimation,
          child: child,
        ),
      ],
    );
  }
}