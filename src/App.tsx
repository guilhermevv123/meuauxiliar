import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import Login from '@/pages/Login'
import Painel from '@/pages/Painel'
import DiamondLoader from '@/components/DiamondLoader'

/**
 * Só duas rotas: /login e o app. A sessão vem do Supabase e é observada — o
 * logout em outra aba derruba esta também. `carregando` evita o flash de tela
 * de login para quem JÁ está logado (a sessão é lida do storage de forma
 * assíncrona na primeira pintura).
 */
export default function App() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSessao(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (carregando) {
    return <DiamondLoader fullScreen size={128} label="Carregando" />
  }

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={sessao ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/*" element={sessao ? <Painel sessao={sessao} /> : <Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  )
}
