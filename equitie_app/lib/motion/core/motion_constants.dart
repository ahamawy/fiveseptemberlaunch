import 'package:flutter/animation.dart';

/// Core motion constants and timing values for the Equitie app
/// Provides platform-specific animation durations, curves, and physics
class MotionConstants {
  MotionConstants._();

  // === Equitie App Colors ===
  /// Primary purple from Figma design
  static const String primaryPurple = '#C898FF';
  
  /// Dark background from Figma design
  static const String darkBackground = '#040210';
  
  /// Accent green from Figma design
  static const String accentGreen = '#62FF7F';

  // === Duration Constants ===
  /// Ultra-fast animations (micro-interactions)
  static const Duration ultraFast = Duration(milliseconds: 100);
  
  /// Fast animations (buttons, toggles)
  static const Duration fast = Duration(milliseconds: 200);
  
  /// Medium animations (page transitions, modals)
  static const Duration medium = Duration(milliseconds: 300);
  
  /// Slow animations (complex transitions)
  static const Duration slow = Duration(milliseconds: 500);
  
  /// Ultra-slow animations (special effects)
  static const Duration ultraSlow = Duration(milliseconds: 800);

  // === iOS-Specific Constants ===
  static class iOS {
    /// Spring physics - damping ratio for iOS bounce effect
    static const double springDamping = 0.8;
    
    /// Spring physics - stiffness for iOS animations
    static const double springStiffness = 100.0;
    
    /// Native iOS page transition duration
    static const Duration pageTransition = Duration(milliseconds: 350);
    
    /// iOS modal presentation duration
    static const Duration modalPresentation = Duration(milliseconds: 300);
    
    /// iOS bounce curve for spring animations
    static const Curve bounceCurve = Curves.elasticOut;
    
    /// iOS ease curve for smooth transitions
    static const Curve easeCurve = Curves.easeInOutCubic;
    
    /// Haptic feedback delay
    static const Duration hapticDelay = Duration(milliseconds: 50);
  }

  // === Android Material Design 3 Constants ===
  static class Android {
    /// Material Design 3 emphasized easing curve
    static const Curve emphasizedEasing = Curves.easeInOutCubic;
    
    /// Material Design 3 standard easing curve
    static const Curve standardEasing = Curves.easeInOut;
    
    /// Material ripple effect duration
    static const Duration rippleDuration = Duration(milliseconds: 200);
    
    /// Material elevation animation duration
    static const Duration elevationDuration = Duration(milliseconds: 250);
    
    /// Material page transition duration
    static const Duration pageTransition = Duration(milliseconds: 300);
    
    /// Material shared element transition duration
    static const Duration sharedElementTransition = Duration(milliseconds: 375);
    
    /// Material fab transformation duration
    static const Duration fabTransformation = Duration(milliseconds: 200);
  }

  // === Web-Specific Constants ===
  static class Web {
    /// CSS-inspired smooth transition curve
    static const Curve smoothCurve = Curves.easeInOutQuart;
    
    /// Web page transition duration (faster for web)
    static const Duration pageTransition = Duration(milliseconds: 250);
    
    /// Mouse hover effect duration
    static const Duration hoverDuration = Duration(milliseconds: 150);
    
    /// Keyboard focus animation duration
    static const Duration focusDuration = Duration(milliseconds: 200);
    
    /// Web scroll animation curve (no bounce)
    static const Curve scrollCurve = Curves.decelerate;
    
    /// Modal fade-in duration for web
    static const Duration modalFade = Duration(milliseconds: 200);
  }

  // === Common Animation Curves ===
  /// Gentle ease for subtle animations
  static const Curve gentleEase = Curves.easeInOutSine;
  
  /// Sharp ease for attention-grabbing animations
  static const Curve sharpEase = Curves.easeInOutExpo;
  
  /// Bounce ease for playful interactions
  static const Curve bounceEase = Curves.elasticOut;
  
  /// Anticipation curve (ease out back)
  static const Curve anticipation = Curves.easeOutBack;

  // === Physics Constants ===
  /// Default spring simulation for bouncy effects
  static const SpringDescription defaultSpring = SpringDescription(
    mass: 1.0,
    stiffness: 100.0,
    damping: 10.0,
  );
  
  /// High-tension spring for quick snappy animations
  static const SpringDescription highTensionSpring = SpringDescription(
    mass: 1.0,
    stiffness: 200.0,
    damping: 15.0,
  );
  
  /// Low-tension spring for gentle floating animations
  static const SpringDescription lowTensionSpring = SpringDescription(
    mass: 1.0,
    stiffness: 50.0,
    damping: 8.0,
  );

  // === Stagger Constants ===
  /// Short stagger delay between list items
  static const Duration shortStagger = Duration(milliseconds: 50);
  
  /// Medium stagger delay for card grids
  static const Duration mediumStagger = Duration(milliseconds: 100);
  
  /// Long stagger delay for complex layouts
  static const Duration longStagger = Duration(milliseconds: 150);

  // === Scale Constants ===
  /// Micro scale factor for subtle hover effects
  static const double microScale = 0.98;
  
  /// Small scale factor for button press effects
  static const double smallScale = 0.95;
  
  /// Medium scale factor for card interactions
  static const double mediumScale = 1.05;
  
  /// Large scale factor for dramatic effects
  static const double largeScale = 1.1;

  // === Offset Constants ===
  /// Small offset for subtle slide effects
  static const double smallOffset = 4.0;
  
  /// Medium offset for slide transitions
  static const double mediumOffset = 16.0;
  
  /// Large offset for dramatic slide effects
  static const double largeOffset = 32.0;

  // === Opacity Constants ===
  /// Semi-transparent for overlays
  static const double semiTransparent = 0.7;
  
  /// Subtle transparency for disabled states
  static const double subtle = 0.6;
  
  /// Faded transparency for inactive elements
  static const double faded = 0.4;
  
  /// Ghost transparency for barely visible elements
  static const double ghost = 0.2;

  // === Performance Constants ===
  /// Target FPS for smooth animations
  static const int targetFPS = 60;
  
  /// Frame duration in milliseconds (1000ms / 60fps)
  static const double frameDuration = 16.67;
  
  /// Maximum concurrent animations to maintain performance
  static const int maxConcurrentAnimations = 5;
  
  /// Animation budget per frame in milliseconds
  static const double animationBudget = 10.0;
}

/// Animation performance metrics
class PerformanceMetrics {
  /// Tracks dropped frames during animations
  static int droppedFrames = 0;
  
  /// Tracks average frame time
  static double averageFrameTime = 0.0;
  
  /// Tracks active animation count
  static int activeAnimations = 0;
  
  /// Resets all performance metrics
  static void reset() {
    droppedFrames = 0;
    averageFrameTime = 0.0;
    activeAnimations = 0;
  }
}