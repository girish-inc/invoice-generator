import { TokenManager, TokenRefreshService } from './tokenManager';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { ErrorHandler } from './errorHandler';

// Base API URL - use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Enhanced API client with automatic token refresh
export class ApiClient {
  private static async makeRequest(
    url: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<any> {
    let token = TokenManager.getToken();
    
    // Check if token needs refresh
    if (requiresAuth && token && TokenManager.needsRefresh(token)) {
      try {
        token = await TokenRefreshService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Logout user if refresh fails
        store.dispatch(logout());
        throw new ApiError('Authentication expired. Please login again.', 401);
      }
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists and auth is required
    if (requiresAuth && token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      ErrorHandler.logError(fetchError, `API Request: ${url}`);
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'An error occurred' };
      }

      const apiError = new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );

      // Log the error for debugging
      ErrorHandler.logError(apiError, `API Response: ${url}`);

      // Handle 401 errors (unauthorized)
      if (response.status === 401) {
        TokenManager.clearTokens();
        store.dispatch(logout());
      }

      throw apiError;
    }

    // Handle different content types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('application/pdf') || contentType?.includes('application/octet-stream')) {
      return response.blob();
    } else {
      return response.text();
    }
  }

  // GET request
  static async get(url: string, requiresAuth: boolean = true): Promise<any> {
    return this.makeRequest(url, { method: 'GET' }, requiresAuth);
  }

  // POST request
  static async post(url: string, data?: any, requiresAuth: boolean = true): Promise<any> {
    return this.makeRequest(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  // PUT request
  static async put(url: string, data?: any, requiresAuth: boolean = true): Promise<any> {
    return this.makeRequest(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  // DELETE request
  static async delete(url: string, requiresAuth: boolean = true): Promise<any> {
    return this.makeRequest(url, { method: 'DELETE' }, requiresAuth);
  }

  // PATCH request
  static async patch(url: string, data?: any, requiresAuth: boolean = true): Promise<any> {
    return this.makeRequest(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  // File upload request
  static async uploadFile(url: string, file: File, requiresAuth: boolean = true): Promise<any> {
    let token = TokenManager.getToken();
    
    // Check if token needs refresh
    if (requiresAuth && token && TokenManager.needsRefresh(token)) {
      try {
        token = await TokenRefreshService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        store.dispatch(logout());
        throw new ApiError('Authentication expired. Please login again.', 401);
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'File upload failed' };
      }

      if (response.status === 401) {
        TokenManager.clearTokens();
        store.dispatch(logout());
        throw new ApiError('Authentication required. Please login again.', 401, errorData);
      }

      throw new ApiError(
        errorData.message || `Upload failed! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }
}

// Export default instance
export default ApiClient;