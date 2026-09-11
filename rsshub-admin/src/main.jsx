/* ============================================================================
 * RSSHub Enhanced — Application Bootstrap (main.jsx)
 * ============================================================================ */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* Enable immediate WebKit CSS :active pseudo-class response on touch devices */
if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', () => {}, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
