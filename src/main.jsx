import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Auto-reparación de la PWA: cuando un Service Worker nuevo toma control, recargamos
// una vez para servir la versión actualizada y evitar pantallas en negro por assets
// viejos cacheados. El flag previene bucles de recarga (tras recargar, el SW nuevo
// ya controla desde el arranque y no vuelve a disparar el evento).
if ('serviceWorker' in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
