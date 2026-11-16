import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadIndex } from './assets'
import { createSim } from './store'

// L'index des modèles doit être connu avant de créer la simulation et la scène
loadIndex().then(() => {
  createSim()
  createRoot(document.getElementById('root')!).render(<App />)
})
