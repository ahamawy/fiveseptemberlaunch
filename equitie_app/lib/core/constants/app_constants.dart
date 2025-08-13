/// App-wide constants
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Equitie';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';

  // API Configuration
  static const String baseUrl = 'https://api.equitie.com'; // Update with actual API URL
  static const String apiVersion = 'v1';
  static const Duration apiTimeout = Duration(seconds: 30);

  // Storage Keys
  static const String storageKeyUser = 'user_data';
  static const String storageKeyToken = 'auth_token';
  static const String storageKeyRefreshToken = 'refresh_token';
  static const String storageKeyTheme = 'theme_mode';
  static const String storageKeyLanguage = 'language';
  static const String storageKeyOnboarding = 'onboarding_completed';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int maxNameLength = 50;
  static const int maxEmailLength = 254;

  // Animation Durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);

  // Debounce Durations
  static const Duration searchDebounce = Duration(milliseconds: 500);
  static const Duration inputDebounce = Duration(milliseconds: 300);

  // Cache Durations
  static const Duration shortCacheDuration = Duration(minutes: 5);
  static const Duration mediumCacheDuration = Duration(hours: 1);
  static const Duration longCacheDuration = Duration(days: 1);

  // Image Constraints
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const int maxImageWidth = 1920;
  static const int maxImageHeight = 1080;

  // Error Messages
  static const String errorGeneric = 'Something went wrong. Please try again.';
  static const String errorNetwork = 'Please check your internet connection.';
  static const String errorTimeout = 'Request timeout. Please try again.';
  static const String errorUnauthorized = 'Please log in to continue.';
  static const String errorForbidden = 'You don\'t have permission to access this.';
  static const String errorNotFound = 'The requested resource was not found.';
  static const String errorServerError = 'Server error. Please try again later.';

  // Success Messages
  static const String successGeneric = 'Operation completed successfully.';
  static const String successSaved = 'Changes saved successfully.';
  static const String successDeleted = 'Item deleted successfully.';
  static const String successLogout = 'Logged out successfully.';

  // Validation Messages
  static const String validationRequired = 'This field is required.';
  static const String validationEmail = 'Please enter a valid email address.';
  static const String validationPasswordLength = 'Password must be at least 8 characters long.';
  static const String validationPasswordMatch = 'Passwords do not match.';
  static const String validationPhoneNumber = 'Please enter a valid phone number.';

  // Date Formats
  static const String dateFormatDisplay = 'MMM dd, yyyy';
  static const String dateFormatShort = 'MM/dd/yyyy';
  static const String dateFormatLong = 'EEEE, MMMM dd, yyyy';
  static const String timeFormat12Hour = 'h:mm a';
  static const String timeFormat24Hour = 'HH:mm';
  static const String dateTimeFormat = 'MMM dd, yyyy h:mm a';

  // Regular Expressions
  static const String emailRegex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phoneRegex = r'^\+?[1-9]\d{1,14}$';
  static const String passwordRegex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$';

  // Social Media
  static const String facebookUrl = 'https://facebook.com/equitie';
  static const String twitterUrl = 'https://twitter.com/equitie';
  static const String linkedinUrl = 'https://linkedin.com/company/equitie';
  static const String instagramUrl = 'https://instagram.com/equitie';

  // Support
  static const String supportEmail = 'support@equitie.com';
  static const String supportPhone = '+1-800-EQUITIE';
  static const String privacyPolicyUrl = 'https://equitie.com/privacy';
  static const String termsOfServiceUrl = 'https://equitie.com/terms';
  static const String helpCenterUrl = 'https://help.equitie.com';
}