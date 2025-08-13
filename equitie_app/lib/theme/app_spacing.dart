/// Spacing system based on design system
/// These values will be updated with actual Figma spacing tokens
class AppSpacing {
  AppSpacing._();

  // Base spacing unit (4px)  
  static const double base = 4.0;

  // Spacing Scale
  static const double xs = base; // 4px
  static const double sm = base * 2; // 8px
  static const double md = base * 3; // 12px
  static const double lg = base * 4; // 16px
  static const double xl = base * 5; // 20px
  static const double xl2 = base * 6; // 24px
  static const double xl3 = base * 8; // 32px
  static const double xl4 = base * 10; // 40px
  static const double xl5 = base * 12; // 48px
  static const double xl6 = base * 16; // 64px
  static const double xl7 = base * 20; // 80px
  static const double xl8 = base * 24; // 96px

  // Semantic Spacing
  static const double tiny = xs; // 4px
  static const double small = sm; // 8px
  static const double medium = lg; // 16px
  static const double large = xl3; // 32px
  static const double extraLarge = xl5; // 48px

  // Component Specific Spacing
  static const double buttonPaddingVertical = md; // 12px
  static const double buttonPaddingHorizontal = xl2; // 24px
  static const double cardPadding = lg; // 16px
  static const double listItemPadding = lg; // 16px
  static const double screenPadding = lg; // 16px
  static const double sectionSpacing = xl3; // 32px

  // Layout Spacing
  static const double safeAreaPadding = lg; // 16px
  static const double bottomNavHeight = 80.0;
  static const double appBarHeight = 56.0;
  static const double tabBarHeight = 48.0;

  // Border Radius
  static const double radiusXs = 4.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 20.0;
  static const double radiusXl2 = 24.0;
  static const double radiusFull = 9999.0;

  // Semantic Border Radius
  static const double radiusButton = radiusMd; // 12px
  static const double radiusCard = radiusLg; // 16px
  static const double radiusModal = radiusXl; // 20px
  static const double radiusInput = radiusSm; // 8px
}