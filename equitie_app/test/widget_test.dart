// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:equitie_app/main.dart';
import 'package:equitie_app/core/services/storage_service.dart';
import 'package:equitie_app/core/providers/app_providers.dart';

void main() {
  testWidgets('App loads correctly', (WidgetTester tester) async {
    // Create a mock storage service
    final mockStorageService = MockStorageService();
    
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          storageServiceProvider.overrideWithValue(mockStorageService),
        ],
        child: const EquitieApp(),
      ),
    );

    // Wait for the app to load
    await tester.pump();

    // Verify that the app loads without crashing
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

// Mock storage service for testing
class MockStorageService extends StorageService {
  MockStorageService._() : super._();
  
  static MockStorageService? _instance;
  
  static MockStorageService getInstance() {
    _instance ??= MockStorageService._();
    return _instance!;
  }
  
  @override
  ThemeMode getThemeMode() => ThemeMode.system;
  
  @override
  String? getAuthToken() => null;
  
  @override
  Map<String, dynamic>? getUserData() => null;
  
  @override
  bool isLoggedIn() => false;
}
