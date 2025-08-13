# Equitie App - Flutter Implementation

A comprehensive Flutter application for equity management and investment tracking, designed for both iOS and web platforms.

## 🏗️ Architecture Overview

This project follows a clean, scalable architecture with the following structure:

```
lib/
├── core/                     # Core application logic
│   ├── constants/           # App-wide constants
│   ├── models/              # Data models
│   ├── providers/           # Riverpod state providers
│   ├── router/              # Navigation setup (GoRouter)
│   └── services/            # Business logic services
├── features/                # Feature-specific modules (future)
├── screens/                 # UI screens
│   ├── auth/               # Authentication screens
│   ├── home/               # Dashboard/home screens
│   ├── onboarding/         # First-time user flow
│   ├── profile/            # User profile management
│   ├── settings/           # App settings
│   └── splash/             # App launch screen
├── shared/                 # Shared components
│   └── widgets/            # Reusable UI widgets
├── theme/                  # Design system
├── utils/                  # Utility functions
└── main.dart              # App entry point
```

## 🎨 Design System

The app implements a comprehensive design system with:

- **Colors**: Semantic color palette with light/dark theme support
- **Typography**: Consistent text styles following Material 3 guidelines
- **Spacing**: Standardized spacing scale (4px base unit)
- **Components**: Reusable UI components (buttons, cards, text fields)
- **Responsive Design**: Adaptive layouts for different screen sizes

## 🛠️ Tech Stack

### Core Dependencies
- **Flutter SDK**: ^3.6.0
- **flutter_riverpod**: ^2.5.1 (State Management)
- **go_router**: ^14.3.0 (Navigation)
- **dio**: ^5.7.0 (HTTP Client)
- **shared_preferences**: ^2.3.2 (Local Storage)

### UI & Design
- **flutter_screenutil**: ^5.9.3 (Responsive Design)
- **flutter_svg**: ^2.0.10+1 (SVG Support)
- **cached_network_image**: ^3.4.1 (Image Caching)
- **shimmer**: ^3.0.0 (Loading Effects)

### Development
- **logger**: ^2.4.0 (Logging)
- **flutter_lints**: ^5.0.0 (Code Quality)

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.6.0 or higher
- Dart SDK 3.0.0 or higher
- iOS development: Xcode 14+ (macOS only)
- Web development: Chrome browser

### Installation

1. **Install dependencies**
   ```bash
   flutter pub get
   ```

2. **Generate necessary files** (if using code generation)
   ```bash
   flutter packages pub run build_runner build
   ```

### Running the App

#### iOS Simulator
```bash
flutter run -d ios
```

#### Web Browser
```bash
flutter run -d chrome
```

#### Physical Device
```bash
flutter devices  # List available devices
flutter run -d [device-id]
```

### Building for Production

#### iOS App Store
```bash
flutter build ios --release
# Then use Xcode to archive and upload
```

#### Web Deployment
```bash
flutter build web --release
# Deploy the build/web folder to your hosting service
```

## 🎯 Key Features Implemented

### ✅ Authentication System
- Login/Register screens with form validation
- JWT token management
- Biometric authentication support (placeholder)
- Password reset flow (placeholder)

### ✅ Navigation & Routing
- GoRouter implementation with type-safe navigation
- Bottom navigation with persistent shell
- Deep linking support
- Route guards for authentication

### ✅ State Management
- Riverpod providers for scalable state management
- Authentication state management
- Theme state management
- Loading and error state handling

### ✅ Responsive Design
- Adaptive layouts for mobile, tablet, and desktop
- Platform-specific adaptations (iOS/Android/Web)
- Responsive typography and spacing
- Safe area handling

### ✅ Design System Components
- **AppButton**: Customizable button with variants and sizes
- **AppTextField**: Form inputs with validation
- **AppCard**: Consistent card layouts
- **Theme System**: Complete light/dark theme support

### ✅ Core Services
- **API Service**: HTTP client with interceptors and error handling
- **Storage Service**: Local data persistence
- **Auth Service**: Authentication logic
- **Logger**: Development and production logging

## 🔧 Configuration

### Environment Setup
Update the following files with your specific configuration:

1. **API Configuration** (`lib/core/constants/app_constants.dart`)
   ```dart
   static const String baseUrl = 'https://your-api-url.com';
   ```

2. **App Branding** (`lib/core/constants/app_constants.dart`)
   ```dart
   static const String appName = 'Your App Name';
   ```

3. **Theme Colors** (`lib/theme/app_colors.dart`)
   ```dart
   // Update colors to match your brand
   static const Color primary = Color(0xFF2563EB);
   ```

## 🎨 Customization Guide

### Adding Figma Design Assets

1. **Extract colors from Figma**
   - Update `lib/theme/app_colors.dart`
   - Use semantic naming (primary, secondary, etc.)

2. **Typography from Figma**
   - Update `lib/theme/app_typography.dart`
   - Add custom font files to `assets/fonts/`
   - Update `pubspec.yaml` with font definitions

3. **Spacing and sizing**
   - Update `lib/theme/app_spacing.dart`
   - Maintain consistent 4px base unit

4. **Custom components**
   - Create new widgets in `lib/shared/widgets/`
   - Follow existing component patterns

## 🧪 Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
```bash
flutter test integration_test/
```

## 📦 Build & Deployment

### Version Management
Update version in `pubspec.yaml`:
```yaml
version: 1.0.0+1
```

## 🐛 Troubleshooting

### Common Issues

1. **Build errors after pub get**
   ```bash
   flutter clean
   flutter pub get
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   flutter clean && flutter build ios
   ```

3. **Web CORS issues**
   - Configure your API server for CORS
   - Use `flutter run -d chrome --web-renderer html`

## 📚 Next Steps

To fully integrate with your Figma design:

1. **Design Asset Integration**
   - Export design tokens from Figma
   - Update theme files with actual colors/typography
   - Add custom fonts and icons

2. **API Integration**
   - Connect to your backend services
   - Implement real authentication
   - Add business logic for equity management

3. **Advanced Features**
   - Real-time data integration
   - Push notifications
   - Offline support
   - Advanced charts and analytics

---

**Built with ❤️ using Flutter**
