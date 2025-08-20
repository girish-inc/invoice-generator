import { ApiError } from './apiClient';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Formats API errors into user-friendly messages
   */
  static formatApiError(error: any): ErrorResponse {
    // Handle ApiError instances
    if (error instanceof ApiError) {
      return {
        message: this.getUserFriendlyMessage(error.message, error.status),
        code: error.status.toString(),
        details: error.data
      };
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR'
      };
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        return {
          message: 'Please check your input and try again.',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        };
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      return {
        message: 'Your session has expired. Please log in again.',
        code: 'AUTH_ERROR'
      };
    }

    // Handle authorization errors
    if (error.response?.status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_ERROR'
      };
    }

    // Handle not found errors
    if (error.response?.status === 404) {
      return {
        message: 'The requested resource was not found.',
        code: 'NOT_FOUND_ERROR'
      };
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return {
        message: 'Server error. Please try again later or contact support.',
        code: 'SERVER_ERROR'
      };
    }

    // Handle generic errors
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return {
      message: this.getUserFriendlyMessage(message),
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Converts technical error messages to user-friendly ones
   */
  private static getUserFriendlyMessage(message: string, status?: number): string {
    const lowerMessage = message.toLowerCase();

    // Authentication related
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('invalid token')) {
      return 'Your session has expired. Please log in again.';
    }

    if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('wrong password')) {
      return 'Invalid email or password. Please try again.';
    }

    // Validation related
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid input')) {
      return 'Please check your input and try again.';
    }

    if (lowerMessage.includes('required field') || lowerMessage.includes('missing')) {
      return 'Please fill in all required fields.';
    }

    // Network related
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return 'Network error. Please check your internet connection.';
    }

    if (lowerMessage.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    // Server related
    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }

    // Return original message if no specific mapping found
    return message;
  }

  /**
   * Logs errors for debugging purposes
   */
  static logError(error: any, context?: string) {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? `[${context}]` : '';
    
    console.group(`🚨 Error ${contextInfo} - ${timestamp}`);
    console.error('Error object:', error);
    
    if (error instanceof ApiError) {
      console.error('API Error Details:', {
        status: error.status,
        message: error.message,
        data: error.data
      });
    }
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    console.groupEnd();
  }

  /**
   * Determines if an error is retryable
   */
  static isRetryableError(error: any): boolean {
    // Network errors are usually retryable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }

    // Timeout errors are retryable
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return true;
    }

    // Server errors (5xx) are usually retryable
    if (error.response?.status >= 500) {
      return true;
    }

    // Rate limiting (429) is retryable after a delay
    if (error.response?.status === 429) {
      return true;
    }

    return false;
  }
}

export default ErrorHandler;