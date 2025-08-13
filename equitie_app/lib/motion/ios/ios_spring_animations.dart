import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'package:spring/spring.dart';
import '../core/motion_constants.dart';

/// iOS-style spring scale animation with authentic bounce physics
class IOSSpringScaleAnimation extends StatefulWidget {
  final Widget child;
  final AnimationController controller;
  final double scale;
  final Curve curve;

  const IOSSpringScaleAnimation({
    super.key,
    required this.child,
    required this.controller,
    this.scale = 0.95,
    this.curve = Curves.elasticOut,
  });

  @override
  State<IOSSpringScaleAnimation> createState() => _IOSSpringScaleAnimationState();
}

class _IOSSpringScaleAnimationState extends State<IOSSpringScaleAnimation>
    with SingleTickerProviderStateMixin {
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimation();
  }

  void _setupAnimation() {
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scale,
    ).animate(CurvedAnimation(
      parent: widget.controller,
      curve: widget.curve,
    ));
  }

  @override
  void didUpdateWidget(IOSSpringScaleAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.scale != widget.scale || oldWidget.curve != widget.curve) {
      _setupAnimation();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: widget.child,
        );
      },
    );
  }
}

/// iOS-style spring slide animation with natural physics
class IOSSpringSlideAnimation extends StatefulWidget {
  final Widget child;
  final AnimationController controller;
  final Offset offset;
  final Curve curve;

  const IOSSpringSlideAnimation({
    super.key,
    required this.child,
    required this.controller,
    this.offset = const Offset(0.0, 1.0),
    this.curve = Curves.easeInOutCubic,
  });

  @override
  State<IOSSpringSlideAnimation> createState() => _IOSSpringSlideAnimationState();
}

class _IOSSpringSlideAnimationState extends State<IOSSpringSlideAnimation>
    with SingleTickerProviderStateMixin {
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimation();
  }

  void _setupAnimation() {
    _slideAnimation = Tween<Offset>(
      begin: widget.offset,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: widget.controller,
      curve: widget.curve,
    ));
  }

  @override
  void didUpdateWidget(IOSSpringSlideAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.offset != widget.offset || oldWidget.curve != widget.curve) {
      _setupAnimation();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: widget.child,
    );
  }
}

/// iOS-style elastic scroll physics with authentic bounce
class IOSElasticScrollPhysics extends ScrollPhysics {
  final double bounceFactor;
  final double dampingRatio;

  const IOSElasticScrollPhysics({
    super.parent,
    this.bounceFactor = 0.1,
    this.dampingRatio = MotionConstants.iOS.springDamping,
  });

  @override
  IOSElasticScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return IOSElasticScrollPhysics(
      parent: buildParent(ancestor),
      bounceFactor: bounceFactor,
      dampingRatio: dampingRatio,
    );
  }

  @override
  SpringDescription get spring => SpringDescription(
        mass: 1.0,
        stiffness: MotionConstants.iOS.springStiffness,
        damping: dampingRatio * 2.0 * math.sqrt(MotionConstants.iOS.springStiffness),
      );

  @override
  double get dragStartDistanceMotionThreshold => 3.5;

  @override
  double get maxFlingVelocity => 8000.0;

  @override
  double get minFlingVelocity => 50.0;

  @override
  Simulation? createBallisticSimulation(
    ScrollMetrics position,
    double velocity,
  ) {
    final tolerance = toleranceFor(position);
    
    if (velocity.abs() >= minFlingVelocity || position.outOfRange) {
      return BouncingScrollSimulation(
        spring: spring,
        position: position.pixels,
        velocity: velocity,
        leadingExtent: position.minScrollExtent,
        trailingExtent: position.maxScrollExtent,
        tolerance: tolerance,
      );
    }
    
    return null;
  }
}

/// Custom iOS-style button with spring animation and haptic feedback
class IOSSpringButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final Duration duration;
  final double scale;
  final bool enableHaptics;

  const IOSSpringButton({
    super.key,
    required this.child,
    this.onPressed,
    this.duration = const Duration(milliseconds: 100),
    this.scale = 0.95,
    this.enableHaptics = true,
  });

  @override
  State<IOSSpringButton> createState() => _IOSSpringButtonState();
}

class _IOSSpringButtonState extends State<IOSSpringButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onTapDown(TapDownDetails details) async {
    if (widget.enableHaptics) {
      HapticFeedback.lightImpact();
    }
    await _controller.forward();
  }

  Future<void> _onTapUp(TapUpDetails details) async {
    await _controller.reverse();
    widget.onPressed?.call();
  }

  Future<void> _onTapCancel() async {
    await _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null ? _onTapDown : null,
      onTapUp: widget.onPressed != null ? _onTapUp : null,
      onTapCancel: widget.onPressed != null ? _onTapCancel : null,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: widget.child,
          );
        },
      ),
    );
  }
}

/// iOS-style floating action button with spring animation
class IOSFloatingActionButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final double size;

  const IOSFloatingActionButton({
    super.key,
    required this.child,
    this.onPressed,
    this.backgroundColor,
    this.size = 56.0,
  });

  @override
  State<IOSFloatingActionButton> createState() => _IOSFloatingActionButtonState();
}

class _IOSFloatingActionButtonState extends State<IOSFloatingActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: MotionConstants.medium,
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    ));
    
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    ));
    
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Transform.rotate(
            angle: _rotationAnimation.value * 0.1,
            child: IOSSpringButton(
              onPressed: widget.onPressed,
              scale: 0.9,
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  color: widget.backgroundColor ?? Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(widget.size / 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(child: widget.child),
              ),
            ),
          ),
        );
      },
    );
  }
}

// Required import for math functions
import 'dart:math' as math;