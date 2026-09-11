// UI iframe entrypoint for the Origam DS Sync Figma plugin.
//
// Phase 2: mount the 3-tab shell (Generate / Export / Sync). Business
// logic stays in @/lib/* — this file is purely the React mount point.

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './ui/App'
import './ui.css'

const container = document.getElementById('app')
if (!container) {
  throw new Error('[origam-ds-sync] #app mount node not found')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
