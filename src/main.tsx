import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bulma/css/bulma.min.css'
import './colors.css'
import './index.css'
import App from './App.tsx'
import { emulateAdBanner } from './adBanner.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BASE_URL follows vite.config.ts `base`, so GitHub Pages sub-paths work unchanged. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

emulateAdBanner()
