import 'package:flutter/material.dart';
import 'figma_colors.dart';
import 'figma_typography.dart';
import 'figma_spacing.dart';

/// Complete Figma-based theme
class FigmaTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: FigmaTypography.fontFamily,
      colorScheme: const ColorScheme.light(
        primary: FigmaColors.primary,
        secondary: FigmaColors.secondary,
        surface: FigmaColors.surface,
        background: FigmaColors.background,
        error: FigmaColors.error,
        onPrimary: FigmaColors.text_primary,
        onSecondary: FigmaColors.text_secondary,
        onSurface: FigmaColors.text_primary,
        onBackground: FigmaColors.text_primary,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: FigmaColors.surface,
        foregroundColor: FigmaColors.text_primary,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: FigmaSpacing.paddingMD,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: FigmaTypography.fontFamily,
      colorScheme: ColorScheme.dark(
        primary: FigmaColors.primary,
        secondary: FigmaColors.secondary,
        surface: FigmaColors.surface.withOpacity(0.08),
        background: const Color(0xFF121212),
        error: FigmaColors.error,
      ),
    );
  }
}
