import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, Eye, EyeOff, CalendarDays, StickyNote, BellRing, Sparkles } from 'lucide-react'

/**
 * Login no estilo do Diamond CRM: painel azul com a marca à esquerda,
 * formulário limpo à direita, em tema CLARO. No celular o painel da marca vira
 * um cabeçalho compacto — ninguém rola tela pra achar o botão.
 *
 * O mesmo formulário cria conta (app de 2 pessoas); alternar é um link.
 */
export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome } },
        })
        if (error) throw error
        toast.success('Conta criada! Entrando…')
      }
    } catch (err: unknown) {
      const m = (err as { message?: string })?.message || ''
      const traduzido =
        m.includes('Invalid login credentials') ? 'E-mail ou senha incorretos.'
        : m.includes('already registered') ? 'Este e-mail já tem conta — use "Entrar".'
        : m.includes('at least 6 characters') ? 'A senha precisa de pelo menos 6 caracteres.'
        : m || 'Não foi possível entrar. Tente de novo.'
      toast.error(traduzido)
    } finally {
      setEnviando(false)
    }
  }

  const RECURSOS = [
    { Icone: CalendarDays, texto: 'Agenda' },
    { Icone: StickyNote, texto: 'Notas' },
    { Icone: BellRing, texto: 'Lembretes' },
    { Icone: Sparkles, texto: 'Assistente' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Painel da marca — azul Diamond com brilho */}
      <div className="relative overflow-hidden lg:flex-1 flex items-center justify-center px-8 py-12 lg:py-0
                      bg-gradient-to-br from-[#04365c] via-[#0077b6] to-[#00b4d8]">
        {/* orbes de luz */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative text-center lg:max-w-md">
          <img
            src="/logo-diamond-dark.png"
            alt="Diamond"
            className="h-11 lg:h-14 mx-auto mb-5 lg:mb-8 drop-shadow-lg"
          />
          <h1 className="hidden lg:block text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
            Seu dia,<br /><span className="text-cyan-200">no controle.</span>
          </h1>
          <p className="hidden lg:block text-sky-100/90 font-medium mb-8">
            Agenda, notas, lembretes e uma assistente que entende você — por voz.
          </p>

          {/* pílulas dos recursos */}
          <div className="flex flex-wrap justify-center gap-2">
            {RECURSOS.map(({ Icone, texto }) => (
              <span
                key={texto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                           bg-white/15 text-white backdrop-blur-sm border border-white/10"
              >
                <Icone size={13} /> {texto}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#f6f7f8]">
        <form onSubmit={enviar} className="w-full max-w-sm space-y-5 animate-rise">
          <div>
            <h2 className="text-3xl font-black text-navy-900">
              {modo === 'entrar' ? (
                <>Bem-vindo <span className="text-primary">de volta</span></>
              ) : (
                <>Criar sua <span className="text-primary">conta</span></>
              )}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {modo === 'entrar' ? 'Entre e continue de onde parou.' : 'Leva menos de um minuto.'}
            </p>
          </div>

          {modo === 'criar' && (
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-slate-600">Seu nome</Label>
              <Input
                id="nome" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Como a assistente deve te chamar" autoComplete="name" required
                className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-600">E-mail</Label>
            <Input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com" autoComplete="email" required
              className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha" className="text-slate-600">Senha</Label>
            <div className="relative">
              <Input
                id="senha" type={verSenha ? 'text' : 'password'} value={senha}
                onChange={(e) => setSenha(e.target.value)} placeholder="••••••••"
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                required minLength={6}
                className="h-12 bg-white border-slate-200 rounded-xl pr-12 focus-visible:ring-primary"
              />
              <button
                type="button" onClick={() => setVerSenha(!verSenha)}
                aria-label={verSenha ? 'Esconder senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={enviando} className="w-full h-12 btn-gradient text-base">
            {enviando ? <Loader2 className="animate-spin" /> : (
              <>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}<ArrowRight size={18} /></>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500">
            {modo === 'entrar' ? 'Primeira vez aqui? ' : 'Já tem conta? '}
            <button
              type="button" onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}
              className="text-primary font-bold hover:underline"
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
