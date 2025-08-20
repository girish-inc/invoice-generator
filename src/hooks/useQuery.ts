import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure, registerSuccess, registerFailure } from '../store/authSlice';
import { fetchProductsSuccess, addProductSuccess, deleteProductSuccess } from '../store/productsSlice';
import ApiClient from '../utils/apiClient';
import { ErrorHandler } from '../utils/errorHandler';

// Auth hooks
export const useLogin = () => {
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        return await ApiClient.post('/auth/login', { email, password });
      } catch (error) {
        ErrorHandler.logError(error, 'Login');
        throw error;
      }
    },
    onSuccess: (data) => {
      dispatch(loginSuccess({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken
      }));
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.message || 'Login failed'));
    },
  });
};

export const useRegister = () => {
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      try {
        return await ApiClient.post('/auth/register', { name, email, password });
      } catch (error) {
        ErrorHandler.logError(error, 'Register');
        throw error;
      }
    },
    onSuccess: (data) => {
      dispatch(registerSuccess({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken
      }));
    },
    onError: (error: any) => {
      dispatch(registerFailure(error.message || 'Registration failed'));
    },
  });
};

// Products hooks
export const useProducts = () => {
  const dispatch = useDispatch();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const data = await ApiClient.get('/products');
        // Extract products array from response object
        const products = data.products || [];
        dispatch(fetchProductsSuccess(products));
        return data;
      } catch (error) {
        ErrorHandler.logError(error, 'Fetch Products');
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Retry up to 3 times for retryable errors
      return failureCount < 3 && ErrorHandler.isRetryableError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async (product: any) => {
      try {
        return await ApiClient.post('/products', product);
      } catch (error) {
        ErrorHandler.logError(error, 'Create Product');
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update Redux state immediately
      dispatch(addProductSuccess(data.product));
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    retry: (failureCount, error) => {
      return failureCount < 2 && ErrorHandler.isRetryableError(error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      try {
        return await ApiClient.delete(`/products/${productId}`);
      } catch (error) {
        ErrorHandler.logError(error, 'Delete Product');
        throw error;
      }
    },
    onSuccess: (_, productId) => {
      // Update Redux state immediately
      dispatch(deleteProductSuccess(productId));
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    retry: (failureCount, error) => {
      return failureCount < 2 && ErrorHandler.isRetryableError(error);
    },
  });
};

// PDF generation hook
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await ApiClient.post('/pdf/generate', data);
      } catch (error) {
        ErrorHandler.logError(error, 'Generate PDF');
        throw error;
      }
    },
    retry: (failureCount, error) => {
      return failureCount < 2 && ErrorHandler.isRetryableError(error);
    },
  });
};