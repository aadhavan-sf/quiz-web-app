import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { isSpeechDevRoute } from './devRouting'
import { SpeechTestPage } from './pages/dev/SpeechTestPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  isSpeechDevRoute() ? (
    <SpeechTestPage />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
