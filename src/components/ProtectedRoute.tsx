import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { TokenManager } from '../utils/tokenManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  
  // Check if user is authenticated and token is valid
  const isValidAuth = isAuthenticated && 
                     token && 
                     TokenManager.isValidTokenFormat(token) && 
                     !TokenManager.isTokenExpired(token);
  
  if (!isValidAuth) {
    // Clear invalid tokens
    TokenManager.clearTokens();
    
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;