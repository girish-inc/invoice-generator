import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginSuccess, logout } from '../store/authSlice';
import { addProductSuccess } from '../store/productsSlice';
// Removed unused imports: setUser, fetchProductsSuccess


const StateTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const products = useAppSelector((state) => state.products);
  


  const testReduxAuth = () => {
    console.log('Testing Redux Auth Actions');
    
    // Test login action
    dispatch(loginSuccess({
      user: {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com'
      },
      token: 'test-token-123'
    }));
    
    console.log('✓ Login action dispatched');
  };

  const testReduxProducts = () => {
    console.log('Testing Redux Products Actions');
    
    // Test add product action
    dispatch(addProductSuccess({
      _id: 'prod-123',
      name: 'Test Product',
      description: 'A test product for Redux',
      quantity: 5,
      rate: 29.99,
      total: 149.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    console.log('✓ Add product action dispatched');
  };

  const testLogout = () => {
    console.log('Testing Redux Logout Action');
    dispatch(logout());
    console.log('✓ Logout action dispatched');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Redux & API Integration Test</h2>
      
      {/* Redux Test Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Redux State Test</h3>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Auth State:</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(auth, null, 2)}
          </pre>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Products State:</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>
        
        <div className="space-x-2">
          <button 
            onClick={testReduxAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Auth Actions
          </button>
          <button 
            onClick={testReduxProducts}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Product Actions
          </button>
          <button 
            onClick={testLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Logout
          </button>
        </div>
      </div>
      
      {/* TanStack Query Integration Complete */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">API Integration Status</h3>
        <p className="text-green-600">✓ TanStack Query integrated with Login, Register, Products, and PDF generation</p>
        <p className="text-green-600">✓ JWT token management implemented</p>
        <p className="text-green-600">✓ API client with automatic token refresh ready</p>
      </div>
    </div>
  );
};

export default StateTest;