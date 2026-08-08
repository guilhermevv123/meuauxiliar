import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

document.documentElement.classList.add('dark')

// Service worker: é ele que recebe o push do lembrete mesmo com o site fechado
// (no celular, instalado pela tela de início). Registro no load pra não
// disputar banda com a primeira pintura.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sem SW o app segue funcionando — só perde push/instalação */
    })
  })
}

createRoot(document.getElementById('root')!).render(<App />)
