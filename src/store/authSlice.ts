import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TokenManager } from '../utils/tokenManager';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize state with token validation
const initializeAuthState = (): AuthState => {
  const token = TokenManager.getToken();
  
  if (token && TokenManager.isValidTokenFormat(token) && !TokenManager.isTokenExpired(token)) {
    const userInfo = TokenManager.getUserFromToken(token);
    return {
      user: userInfo ? { id: userInfo.userId, name: '', email: userInfo.email } : null,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
  }
  
  // Clear invalid or expired tokens
  TokenManager.clearTokens();
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = initializeAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Use TokenManager for secure token storage
      TokenManager.setToken(action.payload.token);
      if (action.payload.refreshToken) {
        TokenManager.setRefreshToken(action.payload.refreshToken);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      TokenManager.clearTokens();
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      TokenManager.clearTokens();
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Use TokenManager for secure token storage
      TokenManager.setToken(action.payload.token);
      if (action.payload.refreshToken) {
        TokenManager.setRefreshToken(action.payload.refreshToken);
      }
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      TokenManager.clearTokens();
    },
    
    // New action for token refresh
    refreshTokenSuccess: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
      state.token = action.payload.token;
      TokenManager.setToken(action.payload.token);
      if (action.payload.refreshToken) {
        TokenManager.setRefreshToken(action.payload.refreshToken);
      }
    },
    
    // Action to update user info
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

export default authSlice.reducer;