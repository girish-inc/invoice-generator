// import { useState } from 'react' // Removed unused import
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
// import StateTest from './components/StateTest' // Removed unused import
import Login from './pages/Login'
import Register from './pages/Register'
import AddProducts from './pages/AddProducts'
import GeneratePdf from './pages/GeneratePdf'
// import reactLogo from './assets/react.svg' // Removed unused import
// import viteLogo from '/vite.svg' // Removed unused import
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



function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-products" element={<AddProducts />} />
            <Route path="/generate-pdf" element={<GeneratePdf />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
