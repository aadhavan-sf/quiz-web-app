import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { isSpeechDevRoute } from './devRouting'
import { SpeechTestPage } from './pages/dev/SpeechTestPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  isSpeechDevRoute() ? (
    <SpeechTestPage />
  ) : (
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  ),
)
