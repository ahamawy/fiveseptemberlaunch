import '../models/user_model.dart';
import 'storage_service.dart';
import 'api_service.dart';

/// Authentication service
class AuthService {
  final StorageService storage;
  final ApiService apiService;

  AuthService({
    required this.storage,
    required this.apiService,
  });

  /// Get current user from storage
  Future<UserModel?> getCurrentUser() async {
    final userData = storage.getUserData();
    if (userData != null) {
      try {
        return UserModel.fromJson(userData);
      } catch (e) {
        // Invalid user data, clear it
        await storage.clearAuthData();
        return null;
      }
    }
    return null;
  }

  /// Login with email and password
  Future<UserModel> login(String email, String password) async {
    final response = await apiService.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    if (response.isSuccess && response.data != null) {
      final responseData = response.data as Map<String, dynamic>;
      final token = responseData['token'] as String;
      final refreshToken = responseData['refresh_token'] as String?;
      final userData = responseData['user'] as Map<String, dynamic>;

      // Store tokens
      await storage.setAuthToken(token);
      if (refreshToken != null) {
        await storage.setRefreshToken(refreshToken);
      }

      // Store user data
      final user = UserModel.fromJson(userData);
      await storage.setUserData(user.toJson());

      // Set auth token for future requests
      apiService.setAuthToken(token);

      return user;
    } else {
      throw Exception(response.message);
    }
  }

  /// Register new user
  Future<UserModel> register(String email, String password, String name) async {
    final response = await apiService.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
    });

    if (response.isSuccess && response.data != null) {
      final responseData = response.data as Map<String, dynamic>;
      final token = responseData['token'] as String;
      final refreshToken = responseData['refresh_token'] as String?;
      final userData = responseData['user'] as Map<String, dynamic>;

      // Store tokens
      await storage.setAuthToken(token);
      if (refreshToken != null) {
        await storage.setRefreshToken(refreshToken);
      }

      // Store user data
      final user = UserModel.fromJson(userData);
      await storage.setUserData(user.toJson());

      // Set auth token for future requests
      apiService.setAuthToken(token);

      return user;
    } else {
      throw Exception(response.message);
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      // Call logout endpoint if needed
      await apiService.post('/auth/logout');
    } catch (e) {
      // Continue with local logout even if API call fails
    }

    // Clear local data
    await storage.clearAuthData();
    apiService.removeAuthToken();
  }

  /// Refresh authentication token
  Future<String?> refreshToken() async {
    final refreshToken = storage.getRefreshToken();
    if (refreshToken == null) {
      return null;
    }

    try {
      final response = await apiService.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });

      if (response.isSuccess && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;
        final newToken = responseData['token'] as String;
        final newRefreshToken = responseData['refresh_token'] as String?;

        // Store new tokens
        await storage.setAuthToken(newToken);
        if (newRefreshToken != null) {
          await storage.setRefreshToken(newRefreshToken);
        }

        // Set auth token for future requests
        apiService.setAuthToken(newToken);

        return newToken;
      }
    } catch (e) {
      // Refresh failed, logout user
      await logout();
    }

    return null;
  }

  /// Check if user is logged in
  bool isLoggedIn() {
    return storage.isLoggedIn();
  }

  /// Update user profile
  Future<UserModel> updateProfile(Map<String, dynamic> updates) async {
    final response = await apiService.put('/auth/profile', data: updates);

    if (response.isSuccess && response.data != null) {
      final userData = response.data as Map<String, dynamic>;
      final user = UserModel.fromJson(userData);
      
      // Update stored user data
      await storage.setUserData(user.toJson());
      
      return user;
    } else {
      throw Exception(response.message);
    }
  }

  /// Change password
  Future<void> changePassword(String currentPassword, String newPassword) async {
    final response = await apiService.put('/auth/password', data: {
      'current_password': currentPassword,
      'new_password': newPassword,
    });

    if (!response.isSuccess) {
      throw Exception(response.message);
    }
  }

  /// Forgot password
  Future<void> forgotPassword(String email) async {
    final response = await apiService.post('/auth/forgot-password', data: {
      'email': email,
    });

    if (!response.isSuccess) {
      throw Exception(response.message);
    }
  }

  /// Reset password
  Future<void> resetPassword(String token, String newPassword) async {
    final response = await apiService.post('/auth/reset-password', data: {
      'token': token,
      'password': newPassword,
    });

    if (!response.isSuccess) {
      throw Exception(response.message);
    }
  }

  /// Verify email
  Future<void> verifyEmail(String token) async {
    final response = await apiService.post('/auth/verify-email', data: {
      'token': token,
    });

    if (response.isSuccess && response.data != null) {
      // Update user data with verified status
      final userData = response.data as Map<String, dynamic>;
      final user = UserModel.fromJson(userData);
      await storage.setUserData(user.toJson());
    } else {
      throw Exception(response.message);
    }
  }

  /// Resend verification email
  Future<void> resendVerificationEmail() async {
    final response = await apiService.post('/auth/resend-verification');

    if (!response.isSuccess) {
      throw Exception(response.message);
    }
  }
}