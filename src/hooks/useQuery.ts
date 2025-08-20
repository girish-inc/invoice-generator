import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure, registerSuccess, registerFailure } from '../store/authSlice';
import { fetchProductsSuccess } from '../store/productsSlice';
import ApiClient from '../utils/apiClient';

// Auth hooks
export const useLogin = () => {
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return ApiClient.post('/auth/login', { email, password });
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
      return ApiClient.post('/auth/register', { name, email, password });
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
      const data = await ApiClient.get('/products');
      // Extract products array from response object
      const products = data.products || [];
      dispatch(fetchProductsSuccess(products));
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: any) => {
      return ApiClient.post('/products', product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      return ApiClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// PDF generation hook
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      // Make a direct POST request for PDF generation
      const response = await fetch('http://localhost:5000/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      return response.blob();
    },
  });
};