// Token management utilities
export interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  email: string;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  // Get token from localStorage
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Set token in localStorage
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get refresh token from localStorage
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Set refresh token in localStorage
  static setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Remove all tokens
  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Decode JWT token (basic implementation)
  static decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    
    return currentTime >= expiryTime;
  }

  // Check if token needs refresh (within buffer time)
  static needsRefresh(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    
    return currentTime >= (expiryTime - this.TOKEN_EXPIRY_BUFFER);
  }

  // Validate token format
  static isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  }

  // Get user info from token
  static getUserFromToken(token: string): { userId: string; email: string } | null {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  }
}

// Token refresh service
export class TokenRefreshService {
  private static refreshPromise: Promise<string> | null = null;

  static async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async performTokenRefresh(refreshToken: string): Promise<string> {
    const response = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update tokens in storage
    TokenManager.setToken(data.token);
    if (data.refreshToken) {
      TokenManager.setRefreshToken(data.refreshToken);
    }

    return data.token;
  }
}