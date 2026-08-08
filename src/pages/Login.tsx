import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'

/**
 * Login no estilo do Diamond CRM: painel azul com a marca à esquerda,
 * formulário limpo à direita ("Bem-vindo de volta"). No celular o painel
 * da marca vira um cabeçalho compacto — ninguém rola tela pra achar o botão.
 *
 * O mesmo formulário cria conta: o app é para duas pessoas (dono + amigo),
 * então um fluxo separado de cadastro seria cerimônia. Alternar é um link.
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
      // sucesso: o observador de sessão no App.tsx faz o redirect sozinho
    } catch (err: unknown) {
      const m = (err as { message?: string })?.message || ''
      // Traduz os erros que o usuário realmente vê — mensagem crua do
      // Supabase em inglês na cara do usuário é meio caminho pro suporte.
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-navy-950">
      {/* Painel da marca */}
      <div className="lg:flex-1 flex items-center justify-center bg-gradient-to-br from-[#03253f] via-[#04365c] to-[#0077b6] px-8 py-10 lg:py-0">
        <div className="text-center lg:max-w-md">
          <img
            src="/logo-diamond-dark.png"
            alt="Diamond"
            className="h-12 lg:h-16 mx-auto mb-4 lg:mb-8 drop-shadow-lg"
          />
          <h1 className="hidden lg:block text-4xl font-black text-white leading-tight mb-4">
            Seu dia, <span className="text-primary-light">organizado.</span>
          </h1>
          <p className="hidden lg:block text-sky-100/80 font-medium">
            Agenda, notas, lembretes e uma assistente que entende você — por voz.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-3xl font-black text-white">
              {modo === 'entrar' ? (
                <>Bem-vindo <span className="text-primary">de volta</span></>
              ) : (
                <>Criar sua <span className="text-primary">conta</span></>
              )}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {modo === 'entrar'
                ? 'Entre e continue de onde parou.'
                : 'Leva menos de um minuto.'}
            </p>
          </div>

          {modo === 'criar' && (
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-slate-300">Seu nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como a assistente deve te chamar"
                autoComplete="name"
                required
                className="h-12 bg-navy-900 border-navy-700 text-white placeholder:text-slate-500 rounded-xl"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
              required
              className="h-12 bg-navy-900 border-navy-700 text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha" className="text-slate-300">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={verSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className="h-12 bg-navy-900 border-navy-700 text-white placeholder:text-slate-500 rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                aria-label={verSenha ? 'Esconder senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={enviando}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white font-black text-base"
          >
            {enviando ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
                <ArrowRight size={18} />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-slate-400">
            {modo === 'entrar' ? 'Primeira vez aqui? ' : 'Já tem conta? '}
            <button
              type="button"
              onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}
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
