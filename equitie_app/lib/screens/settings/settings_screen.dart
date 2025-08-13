import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/app_providers.dart';
import '../../shared/widgets/app_card.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../theme/app_spacing.dart';
import '../../utils/responsive.dart';

/// Settings screen - App settings and preferences
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundSecondary,
      appBar: AppBar(
        title: Text(
          'Settings',
          style: AppTypography.headlineMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: context.responsivePadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App Preferences
            _buildSection(
              title: 'App Preferences',
              children: [
                _buildThemeSelector(context, ref, themeMode),
                const Divider(height: 1),
                _buildSwitchItem(
                  icon: Icons.notifications_outlined,
                  title: 'Push Notifications',
                  subtitle: 'Receive notifications about your portfolio',
                  value: true,
                  onChanged: (value) {
                    // Update notification preference
                  },
                ),
                const Divider(height: 1),
                _buildSwitchItem(
                  icon: Icons.fingerprint,
                  title: 'Biometric Authentication',
                  subtitle: 'Use fingerprint or face ID to unlock app',
                  value: false,
                  onChanged: (value) {
                    // Update biometric preference
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.language,
                  title: 'Language',
                  subtitle: 'English (US)',
                  onTap: () {
                    // Navigate to language selection
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.attach_money,
                  title: 'Currency',
                  subtitle: 'USD (\$)',
                  onTap: () {
                    // Navigate to currency selection
                  },
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.xl2),
            
            // Trading Preferences
            _buildSection(
              title: 'Trading Preferences',
              children: [
                _buildSwitchItem(
                  icon: Icons.speed,
                  title: 'Real-time Data',
                  subtitle: 'Get live market data (may affect battery)',
                  value: true,
                  onChanged: (value) {
                    // Update real-time data preference
                  },
                ),
                const Divider(height: 1),
                _buildSwitchItem(
                  icon: Icons.trending_up,
                  title: 'Price Alerts',
                  subtitle: 'Receive alerts for significant price changes',
                  value: true,
                  onChanged: (value) {
                    // Update price alerts preference
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.schedule,
                  title: 'Market Hours',
                  subtitle: 'Eastern Time (ET)',
                  onTap: () {
                    // Navigate to market hours settings
                  },
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.xl2),
            
            // Privacy & Security
            _buildSection(
              title: 'Privacy & Security',
              children: [
                _buildNavigationItem(
                  icon: Icons.lock_outline,
                  title: 'Change Password',
                  subtitle: 'Update your account password',
                  onTap: () {
                    // Navigate to change password
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.verified_user_outlined,
                  title: 'Two-Factor Authentication',
                  subtitle: 'Add an extra layer of security',
                  onTap: () {
                    // Navigate to 2FA settings
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.history,
                  title: 'Login History',
                  subtitle: 'View recent account activity',
                  onTap: () {
                    // Navigate to login history
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy Policy',
                  subtitle: 'Read our privacy policy',
                  onTap: () {
                    // Navigate to privacy policy
                  },
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.xl2),
            
            // Support & About
            _buildSection(
              title: 'Support & About',
              children: [
                _buildNavigationItem(
                  icon: Icons.help_outline,
                  title: 'Help Center',
                  subtitle: 'Get help and find answers',
                  onTap: () {
                    // Navigate to help center
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.feedback_outlined,
                  title: 'Send Feedback',
                  subtitle: 'Help us improve the app',
                  onTap: () {
                    // Navigate to feedback
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.star_outline,
                  title: 'Rate App',
                  subtitle: 'Rate us on the App Store',
                  onTap: () {
                    // Open app store rating
                  },
                ),
                const Divider(height: 1),
                _buildNavigationItem(
                  icon: Icons.info_outline,
                  title: 'About Equitie',
                  subtitle: 'Version 1.0.0',
                  onTap: () {
                    // Navigate to about page
                  },
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.xl2),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.headlineSmall.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildThemeSelector(BuildContext context, WidgetRef ref, ThemeMode currentMode) {
    return ListTile(
      leading: const Icon(
        Icons.palette_outlined,
        color: AppColors.textSecondary,
      ),
      title: Text(
        'Theme',
        style: AppTypography.titleMedium.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        _getThemeModeLabel(currentMode),
        style: AppTypography.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.textTertiary,
      ),
      onTap: () {
        showModalBottomSheet(
          context: context,
          builder: (context) => _ThemeSelector(currentMode: currentMode),
        );
      },
    );
  }

  Widget _buildSwitchItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: AppColors.textSecondary,
      ),
      title: Text(
        title,
        style: AppTypography.titleMedium.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: AppTypography.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildNavigationItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: AppColors.textSecondary,
      ),
      title: Text(
        title,
        style: AppTypography.titleMedium.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: AppTypography.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.textTertiary,
      ),
      onTap: onTap,
    );
  }

  String _getThemeModeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }
}

class _ThemeSelector extends ConsumerWidget {
  final ThemeMode currentMode;

  const _ThemeSelector({required this.currentMode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Choose Theme',
            style: AppTypography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _buildThemeOption(
            context,
            ref,
            'System',
            'Follow system setting',
            ThemeMode.system,
            Icons.settings_suggest,
          ),
          _buildThemeOption(
            context,
            ref,
            'Light',
            'Light theme',
            ThemeMode.light,
            Icons.light_mode,
          ),
          _buildThemeOption(
            context,
            ref,
            'Dark',
            'Dark theme',
            ThemeMode.dark,
            Icons.dark_mode,
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext context,
    WidgetRef ref,
    String title,
    String subtitle,
    ThemeMode mode,
    IconData icon,
  ) {
    final isSelected = currentMode == mode;

    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
      ),
      title: Text(
        title,
        style: AppTypography.titleMedium.copyWith(
          fontWeight: FontWeight.w600,
          color: isSelected ? AppColors.primary : null,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: AppTypography.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: isSelected
          ? const Icon(
              Icons.check,
              color: AppColors.primary,
            )
          : null,
      onTap: () {
        ref.read(themeModeProvider.notifier).setThemeMode(mode);
        Navigator.of(context).pop();
      },
    );
  }
}