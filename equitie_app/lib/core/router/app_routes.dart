/// App route paths and names
class AppRoutes {
  AppRoutes._();

  // Route Paths
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String settings = '/settings';

  // Route Names (for named navigation)
  static const String splashName = 'splash';
  static const String onboardingName = 'onboarding';
  static const String loginName = 'login';
  static const String registerName = 'register';
  static const String homeName = 'home';
  static const String profileName = 'profile';
  static const String settingsName = 'settings';

  // Route Parameters
  static const String userIdParam = 'userId';
  static const String itemIdParam = 'itemId';

  // Query Parameters
  static const String redirectParam = 'redirect';
  static const String messageParam = 'message';
  static const String typeParam = 'type';

  /// Get all route paths as a list
  static List<String> get allRoutes => [
        splash,
        onboarding,
        login,
        register,
        home,
        profile,
        settings,
      ];

  /// Check if a route requires authentication
  static bool requiresAuth(String route) {
    const authRequiredRoutes = [
      home,
      profile,
      settings,
    ];
    return authRequiredRoutes.contains(route);
  }

  /// Check if a route is for authentication
  static bool isAuthRoute(String route) {
    const authRoutes = [
      login,
      register,
    ];
    return authRoutes.contains(route);
  }

  /// Get the initial route based on user state
  static String getInitialRoute({
    bool isFirstTime = false,
    bool isLoggedIn = false,
  }) {
    if (isFirstTime) {
      return onboarding;
    }
    if (isLoggedIn) {
      return home;
    }
    return login;
  }
}