// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
console.log('rootEl:', rootEl)

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)