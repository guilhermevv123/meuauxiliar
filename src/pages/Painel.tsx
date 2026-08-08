import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Home, CalendarDays, StickyNote, BellRing, Sparkles, LogOut, BellPlus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { ativarNotificacoes, statusNotificacoes } from '@/lib/push'
import { cacheLimpar, iniciarSincronizacaoAutomatica } from '@/lib/offline'
import FaixaOffline from '@/components/FaixaOffline'
import AbaInicio from '@/components/abas/AbaInicio'
import AbaAgenda from '@/components/abas/AbaAgenda'
import AbaNotas from '@/components/abas/AbaNotas'
import AbaLembretes from '@/components/abas/AbaLembretes'
import AbaAssistente from '@/components/abas/AbaAssistente'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Aba = 'inicio' | 'agenda' | 'notas' | 'lembretes' | 'assistente'

const ABAS: Array<{ id: Aba; rotulo: string; Icone: typeof CalendarDays }> = [
  { id: 'inicio', rotulo: 'Início', Icone: Home },
  { id: 'agenda', rotulo: 'Agenda', Icone: CalendarDays },
  { id: 'notas', rotulo: 'Notas', Icone: StickyNote },
  { id: 'lembretes', rotulo: 'Lembretes', Icone: BellRing },
  { id: 'assistente', rotulo: 'Assistente', Icone: Sparkles },
]

/**
 * Shell claro: sidebar de vidro no desktop, barra inferior de vidro no celular.
 * As abas montam uma vez e ficam vivas escondidas — trocar de aba não perde o
 * rascunho da nota nem recarrega a agenda.
 */
export default function Painel({ sessao }: { sessao: Session }) {
  const [aba, setAba] = useState<Aba>('inicio')
  const [temPush, setTemPush] = useState<boolean | null>(null)

  const nome =
    (sessao.user.user_metadata?.nome as string) ||
    sessao.user.email?.split('@')[0] ||
    'você'

  useEffect(() => { statusNotificacoes().then(setTemPush) }, [])

  // Fila sobe ao abrir o app, ao voltar a internet e ao voltar pro app.
  useEffect(() => { iniciarSincronizacaoAutomatica() }, [])

  const ligarPush = async () => {
    try {
      await ativarNotificacoes()
      setTemPush(true)
      toast.success('Notificações ativadas neste aparelho!')
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Não consegui ativar as notificações.')
    }
  }

  // Cache local morre junto com a sessão: dado de uma conta não pode sobrar
  // pra próxima pessoa que entrar neste aparelho.
  const sair = async () => { cacheLimpar(); await supabase.auth.signOut() }

  const inicial = nome.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r glass p-4 gap-1 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-3">
          <img src="/icon-diamond.svg" alt="" className="w-8 h-8" />
          <div className="leading-tight">
            <p className="font-black text-navy-900">Diamond Lembretes</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">by Diamond</p>
          </div>
        </div>
        {ABAS.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              aba === id
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/25'
                : 'text-slate-500 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <Icone size={18} />
            {rotulo}
          </button>
        ))}
        <div className="mt-auto space-y-2">
          {temPush === false && (
            <button
              onClick={ligarPush}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <BellPlus size={15} /> Ativar notificações
            </button>
          )}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200">
            <div className="min-w-0">
              <p className="text-xs font-bold text-navy-900 truncate">{nome}</p>
              <p className="text-[10px] text-slate-400 truncate">{sessao.user.email}</p>
            </div>
            <button onClick={sair} title="Sair" className="text-slate-400 hover:text-danger p-1.5 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topo (celular) */}
        <header className="lg:hidden pt-safe sticky top-0 z-20 glass border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <img src="/icon-diamond.svg" alt="" className="w-7 h-7" />
              <span className="font-black text-navy-900">Diamond Lembretes</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-black grid place-items-center shadow-sm">
                {inicial}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold text-navy-900">{nome}</p>
                  <p className="text-xs text-slate-400">{sessao.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={ligarPush} disabled={temPush === true} className="gap-2">
                  {temPush ? <Check size={15} className="text-success" /> : <BellPlus size={15} />}
                  {temPush ? 'Notificações ativas' : 'Ativar notificações'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={sair} className="gap-2 text-danger focus:text-danger">
                  <LogOut size={15} /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Estado real da conexão E da fila (a faixa antiga só prometia). */}
        <FaixaOffline />

        {/* Abas vivas: esconder com hidden preserva estado. */}
        <main className="flex-1 min-h-0 pb-24 lg:pb-0">
          <div hidden={aba !== 'inicio'} className="h-full">
            <AbaInicio ativa={aba === 'inicio'} nome={nome} irPara={setAba} />
          </div>
          <div hidden={aba !== 'agenda'} className="h-full"><AbaAgenda ativa={aba === 'agenda'} /></div>
          <div hidden={aba !== 'notas'} className="h-full"><AbaNotas ativa={aba === 'notas'} /></div>
          <div hidden={aba !== 'lembretes'} className="h-full"><AbaLembretes ativa={aba === 'lembretes'} /></div>
          <div hidden={aba !== 'assistente'} className="h-full">
            <AbaAssistente ativa={aba === 'assistente'} nome={nome} />
          </div>
        </main>

        {/* Barra inferior (celular) */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 glass border-t pb-safe">
          <div className="grid grid-cols-5">
            {ABAS.map(({ id, rotulo, Icone }) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className="relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors"
              >
                {/* indicador de aba ativa */}
                {aba === id && (
                  <span className="absolute -top-px h-1 w-8 rounded-full bg-gradient-to-r from-primary to-primary-dark" />
                )}
                <Icone size={20} className={aba === id ? 'text-primary' : 'text-slate-400'} />
                <span className={aba === id ? 'text-primary' : 'text-slate-400'}>{rotulo}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
