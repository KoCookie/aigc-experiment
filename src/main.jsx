import React from 'react'
import ReactDOM from 'react-dom/client'
// NOTE: Do not wrap App with BrowserRouter here; App.jsx already provides the router.
// import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Global error logging to help diagnose runtime issues
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e?.error || e?.message || e)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Rejection]', e?.reason || e)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)