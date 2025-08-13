import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

/// Local storage service using SharedPreferences
class StorageService {
  static StorageService? _instance;
  static SharedPreferences? _preferences;

  StorageService._();

  static Future<StorageService> getInstance() async {
    _instance ??= StorageService._();
    _preferences ??= await SharedPreferences.getInstance();
    return _instance!;
  }

  SharedPreferences get preferences => _preferences!;

  // Generic methods
  Future<bool> setBool(String key, bool value) async {
    return await preferences.setBool(key, value);
  }

  bool getBool(String key, {bool defaultValue = false}) {
    return preferences.getBool(key) ?? defaultValue;
  }

  Future<bool> setString(String key, String value) async {
    return await preferences.setString(key, value);
  }

  String? getString(String key, {String? defaultValue}) {
    return preferences.getString(key) ?? defaultValue;
  }

  Future<bool> setInt(String key, int value) async {
    return await preferences.setInt(key, value);
  }

  int getInt(String key, {int defaultValue = 0}) {
    return preferences.getInt(key) ?? defaultValue;
  }

  Future<bool> setDouble(String key, double value) async {
    return await preferences.setDouble(key, value);
  }

  double getDouble(String key, {double defaultValue = 0.0}) {
    return preferences.getDouble(key) ?? defaultValue;
  }

  Future<bool> setStringList(String key, List<String> value) async {
    return await preferences.setStringList(key, value);
  }

  List<String> getStringList(String key, {List<String>? defaultValue}) {
    return preferences.getStringList(key) ?? defaultValue ?? [];
  }

  Future<bool> remove(String key) async {
    return await preferences.remove(key);
  }

  Future<bool> clear() async {
    return await preferences.clear();
  }

  bool containsKey(String key) {
    return preferences.containsKey(key);
  }

  Set<String> getKeys() {
    return preferences.getKeys();
  }

  // App-specific methods
  Future<bool> setUserData(Map<String, dynamic> userData) async {
    final jsonString = jsonEncode(userData);
    return await setString(AppConstants.storageKeyUser, jsonString);
  }

  Map<String, dynamic>? getUserData() {
    final jsonString = getString(AppConstants.storageKeyUser);
    if (jsonString != null) {
      try {
        return jsonDecode(jsonString) as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<bool> setAuthToken(String token) async {
    return await setString(AppConstants.storageKeyToken, token);
  }

  String? getAuthToken() {
    return getString(AppConstants.storageKeyToken);
  }

  Future<bool> setRefreshToken(String token) async {
    return await setString(AppConstants.storageKeyRefreshToken, token);
  }

  String? getRefreshToken() {
    return getString(AppConstants.storageKeyRefreshToken);
  }

  Future<bool> setThemeMode(ThemeMode mode) async {
    return await setString(AppConstants.storageKeyTheme, mode.name);
  }

  ThemeMode getThemeMode() {
    final modeString = getString(AppConstants.storageKeyTheme);
    switch (modeString) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  Future<bool> setLanguage(String language) async {
    return await setString(AppConstants.storageKeyLanguage, language);
  }

  String getLanguage() {
    return getString(AppConstants.storageKeyLanguage, defaultValue: 'en')!;
  }

  Future<bool> setOnboardingCompleted(bool completed) async {
    return await setBool(AppConstants.storageKeyOnboarding, completed);
  }

  bool isOnboardingCompleted() {
    return getBool(AppConstants.storageKeyOnboarding);
  }

  // Authentication helpers
  bool isLoggedIn() {
    return getAuthToken() != null;
  }

  Future<bool> clearAuthData() async {
    final results = await Future.wait([
      remove(AppConstants.storageKeyUser),
      remove(AppConstants.storageKeyToken),
      remove(AppConstants.storageKeyRefreshToken),
    ]);
    return results.every((result) => result);
  }

  // Cache management
  Future<bool> setCacheData(String key, Map<String, dynamic> data, {Duration? expiry}) async {
    final cacheData = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    final jsonString = jsonEncode(cacheData);
    return await setString('cache_$key', jsonString);
  }

  Map<String, dynamic>? getCacheData(String key) {
    final jsonString = getString('cache_$key');
    if (jsonString != null) {
      try {
        final cacheData = jsonDecode(jsonString) as Map<String, dynamic>;
        final timestamp = cacheData['timestamp'] as int;
        final expiry = cacheData['expiry'] as int?;
        
        if (expiry != null) {
          final expiryTime = timestamp + expiry;
          if (DateTime.now().millisecondsSinceEpoch > expiryTime) {
            // Cache expired, remove it
            remove('cache_$key');
            return null;
          }
        }
        
        return cacheData['data'] as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<bool> clearCache() async {
    final keys = getKeys();
    final cacheKeys = keys.where((key) => key.startsWith('cache_')).toList();
    
    final results = await Future.wait(
      cacheKeys.map((key) => remove(key)),
    );
    
    return results.every((result) => result);
  }
}