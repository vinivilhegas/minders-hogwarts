import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { initAmplitude } from './analytics';

// use env var adequada à sua build tool:
// Vite -> import.meta.env.VITE_AMPLITUDE_API_KEY
// CRA  -> process.env.REACT_APP_AMPLITUDE_API_KEY
const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '';

console.log('[DEBUG] VITE_AMPLITUDE_API_KEY =', import.meta.env?.VITE_AMPLITUDE_API_KEY);
console.log('[DEBUG] AMPLITUDE_API_KEY (final) =', AMPLITUDE_API_KEY);

/**
 * Inicializa Amplitude em anonymous (sem userId).
 * Roda antes da renderização para capturar pageviews/autocapture logo no load.
 */
initAmplitude(AMPLITUDE_API_KEY);

const rootEl = document.getElementById('root')
console.log('rootEl:', rootEl)

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)