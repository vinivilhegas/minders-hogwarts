import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { initAmplitude } from './analytics';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '';

initAmplitude(AMPLITUDE_API_KEY);

const rootEl = document.getElementById('root')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)