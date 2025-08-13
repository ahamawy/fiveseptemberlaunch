import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';

/// Custom card widget with consistent styling
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? borderWidth;
  final BorderRadius? borderRadius;
  final double? elevation;
  final VoidCallback? onTap;
  final bool hasShadow;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth,
    this.borderRadius,
    this.elevation,
    this.onTap,
    this.hasShadow = true,
  });

  const AppCard.outlined({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderRadius,
    this.onTap,
  }) : borderColor = AppColors.border,
       borderWidth = 1.0,
       elevation = 0,
       hasShadow = false;

  const AppCard.filled({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.onTap,
  }) : backgroundColor = AppColors.surfaceVariant,
       borderColor = null,
       borderWidth = null,
       elevation = 0,
       hasShadow = false;

  @override
  Widget build(BuildContext context) {
    final cardBorderRadius = borderRadius ?? 
        BorderRadius.circular(AppSpacing.radiusCard);
    
    final cardElevation = elevation ?? (hasShadow ? 2.0 : 0.0);

    Widget card = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surface,
        borderRadius: cardBorderRadius,
        border: borderColor != null && borderWidth != null
            ? Border.all(
                color: borderColor!,
                width: borderWidth!,
              )
            : null,
        boxShadow: hasShadow && cardElevation > 0
            ? [
                BoxShadow(
                  color: AppColors.shadow,
                  offset: const Offset(0, 2),
                  blurRadius: 8,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: cardBorderRadius,
        child: Padding(
          padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
          child: child,
        ),
      ),
    );

    if (onTap != null) {
      card = InkWell(
        onTap: onTap,
        borderRadius: cardBorderRadius,
        child: card,
      );
    }

    return card;
  }
}

/// Specialized card variants

class AppListCard extends StatelessWidget {
  final Widget? leading;
  final Widget title;
  final Widget? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const AppListCard({
    super.key,
    this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
      margin: margin,
      child: Row(
        children: [
          if (leading != null) ...[
            leading!,
            const SizedBox(width: AppSpacing.md),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                title,
                if (subtitle != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  subtitle!,
                ],
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: AppSpacing.md),
            trailing!,
          ],
        ],
      ),
    );
  }
}

class AppImageCard extends StatelessWidget {
  final Widget image;
  final Widget? title;
  final Widget? subtitle;
  final Widget? content;
  final List<Widget>? actions;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;
  final double? imageHeight;

  const AppImageCard({
    super.key,
    required this.image,
    this.title,
    this.subtitle,
    this.content,
    this.actions,
    this.onTap,
    this.margin,
    this.imageHeight,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: EdgeInsets.zero,
      margin: margin,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          SizedBox(
            height: imageHeight ?? 200,
            width: double.infinity,
            child: image,
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null) ...[
                  title!,
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (subtitle != null) ...[
                  subtitle!,
                  const SizedBox(height: AppSpacing.md),
                ],
                if (content != null) ...[
                  content!,
                  const SizedBox(height: AppSpacing.md),
                ],
                if (actions != null && actions!.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: actions!
                        .expand((action) => [action, const SizedBox(width: AppSpacing.sm)])
                        .take(actions!.length * 2 - 1)
                        .toList(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}