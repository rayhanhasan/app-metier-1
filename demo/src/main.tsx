import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FicheSheets } from './pages/FichePage'

// ?fiche : affiche uniquement la fiche A4 (impression / export PDF)
const ficheOnly = new URLSearchParams(location.search).has('fiche')
if (ficheOnly) document.documentElement.classList.add('fiche-mode')

createRoot(document.getElementById('root')!).render(<StrictMode>{ficheOnly ? <FicheSheets /> : <App />}</StrictMode>)
