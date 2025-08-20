// import { StrictMode } from 'react' // Removed - was causing double renders
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/main.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
