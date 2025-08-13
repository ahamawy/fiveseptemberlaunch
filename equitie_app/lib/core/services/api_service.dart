import 'dart:io';
import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import '../constants/app_constants.dart';

/// API service for handling HTTP requests
class ApiService {
  late final Dio _dio;
  final Logger _logger = Logger();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: '${AppConstants.baseUrl}/${AppConstants.apiVersion}',
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      sendTimeout: AppConstants.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    // Request interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        _logger.d('🚀 REQUEST: ${options.method} ${options.path}');
        _logger.d('Headers: ${options.headers}');
        if (options.data != null) {
          _logger.d('Data: ${options.data}');
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        _logger.d('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
        _logger.d('Data: ${response.data}');
        handler.next(response);
      },
      onError: (error, handler) {
        _logger.e('❌ ERROR: ${error.requestOptions.path}');
        _logger.e('Message: ${error.message}');
        _logger.e('Response: ${error.response?.data}');
        handler.next(error);
      },
    ));

    // Auth interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add auth token if available
        // This will be updated when storage service is available
        handler.next(options);
      },
    ));
  }

  /// Set authorization token
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  /// Remove authorization token
  void removeAuthToken() {
    _dio.options.headers.remove('Authorization');
  }

  /// GET request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return _handleResponse<T>(response);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// POST request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _handleResponse<T>(response);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// PUT request
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _handleResponse<T>(response);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// DELETE request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _handleResponse<T>(response);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Handle successful response
  ApiResponse<T> _handleResponse<T>(Response response) {
    return ApiResponse<T>(
      success: true,
      data: response.data,
      statusCode: response.statusCode,
      message: 'Success',
    );
  }

  /// Handle error response
  ApiResponse<T> _handleError<T>(dynamic error) {
    if (error is DioException) {
      String message;
      int? statusCode = error.response?.statusCode;

      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          message = AppConstants.errorTimeout;
          break;
        case DioExceptionType.connectionError:
          message = AppConstants.errorNetwork;
          break;
        case DioExceptionType.badResponse:
          message = _getErrorMessage(error.response?.data) ?? 
                   _getStatusCodeMessage(statusCode);
          break;
        case DioExceptionType.cancel:
          message = 'Request was cancelled';
          break;
        default:
          message = AppConstants.errorGeneric;
      }

      return ApiResponse<T>(
        success: false,
        message: message,
        statusCode: statusCode,
        error: error.response?.data,
      );
    }

    return ApiResponse<T>(
      success: false,
      message: AppConstants.errorGeneric,
      error: error.toString(),
    );
  }

  /// Extract error message from response
  String? _getErrorMessage(dynamic responseData) {
    if (responseData is Map<String, dynamic>) {
      return responseData['message'] as String? ??
             responseData['error'] as String? ??
             responseData['detail'] as String?;
    }
    return null;
  }

  /// Get error message based on status code
  String _getStatusCodeMessage(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request';
      case 401:
        return AppConstants.errorUnauthorized;
      case 403:
        return AppConstants.errorForbidden;
      case 404:
        return AppConstants.errorNotFound;
      case 500:
        return AppConstants.errorServerError;
      default:
        return AppConstants.errorGeneric;
    }
  }

  /// Upload file
  Future<ApiResponse<T>> uploadFile<T>(
    String path,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final file = File(filePath);
      final fileName = file.path.split('/').last;
      
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
        ...?data,
      });

      final response = await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );

      return _handleResponse<T>(response);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Download file
  Future<ApiResponse<String>> downloadFile(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      await _dio.download(
        url,
        savePath,
        onReceiveProgress: onReceiveProgress,
      );

      return ApiResponse<String>(
        success: true,
        data: savePath,
        message: 'File downloaded successfully',
      );
    } catch (e) {
      return _handleError<String>(e);
    }
  }
}

/// API Response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String message;
  final int? statusCode;
  final dynamic error;

  ApiResponse({
    required this.success,
    this.data,
    required this.message,
    this.statusCode,
    this.error,
  });

  bool get isSuccess => success;
  bool get isError => !success;
  bool get hasData => data != null;

  @override
  String toString() {
    return 'ApiResponse(success: $success, message: $message, statusCode: $statusCode)';
  }
}