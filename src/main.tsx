// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { AuthProvider } from './Pages/Provider/AuthProvider'
import { UpgradeProvider } from './Pages/Context/UpgradeContext' // ⟵ ADICIONADO

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UpgradeProvider> {/* ⟵ agora o Guard/useUpgrade funciona em toda a app */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UpgradeProvider>
    </AuthProvider>
  </React.StrictMode>
)
