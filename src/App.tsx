import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
import type { RootState } from './store'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import Register from './pages/Register'
import AddProducts from './pages/AddProducts'
import GeneratePdf from './pages/GeneratePdf'
import './App.css'

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})



// Component to handle initial route based on auth state
const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/add-products" 
        element={
          <ProtectedRoute>
            <AddProducts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/generate-pdf" 
        element={
          <ProtectedRoute>
            <GeneratePdf />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/add-products" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <AppRoutes />
            </Router>
          </QueryClientProvider>
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
