import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('[Renderer] main.tsx loaded')
console.log('[Renderer] Electron API available:', !!(window as any).electron)

const rootElement = document.getElementById('root')
console.log('[Renderer] Root element:', rootElement)

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('[Renderer] App rendered')
} else {
  console.error('[Renderer] Root element not found!')
}
