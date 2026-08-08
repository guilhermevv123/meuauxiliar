import { useEffect, useState } from 'react'
import { CloudOff, RefreshCw, Check } from 'lucide-react'
import { aoMudarFila, estaOnline, filaTamanho, sincronizar } from '@/lib/offline'

/**
 * Faixa de status da conexão.
 *
 * Só aparece quando há o que dizer: sem internet, ou com coisas na fila
 * esperando subir. O ponto é a pessoa saber que o que ela fez NÃO se perdeu —
 * sem isso, "salvei mas sumiu quando voltei" vira desconfiança no app inteiro.
 */
export default function FaixaOffline() {
  const [online, setOnline] = useState(estaOnline())
  const [pendentes, setPendentes] = useState(filaTamanho())
  const [subindo, setSubindo] = useState(false)
  const [acabouDeSincronizar, setAcabou] = useState(false)

  useEffect(() => {
    const mudou = () => setOnline(estaOnline())
    window.addEventListener('online', mudou)
    window.addEventListener('offline', mudou)
    const solta = aoMudarFila(() => setPendentes(filaTamanho()))
    return () => {
      window.removeEventListener('online', mudou)
      window.removeEventListener('offline', mudou)
      solta()
    }
  }, [])

  // Voltou a rede com fila cheia: sobe e confirma na tela.
  useEffect(() => {
    if (!online || pendentes === 0) return
    setSubindo(true)
    void sincronizar().then(({ enviadas }) => {
      setSubindo(false)
      setPendentes(filaTamanho())
      if (enviadas > 0) {
        setAcabou(true)
        setTimeout(() => setAcabou(false), 2600)
      }
    })
  }, [online, pendentes])

  if (online && pendentes === 0 && !acabouDeSincronizar) return null

  const [estilo, icone, texto] = !online
    ? ['bg-amber-50 text-amber-700 border-amber-200', <CloudOff key="i" size={14} />,
       pendentes > 0
         ? `Sem internet — ${pendentes} ${pendentes === 1 ? 'alteração salva' : 'alterações salvas'} aqui, sobem sozinhas depois`
         : 'Sem internet — você pode continuar usando normalmente']
    : subindo || pendentes > 0
      ? ['bg-primary/10 text-primary border-primary/20',
         <RefreshCw key="i" size={14} className="animate-spin" />,
         `Sincronizando ${pendentes} ${pendentes === 1 ? 'alteração' : 'alterações'}…`]
      : ['bg-emerald-50 text-emerald-700 border-emerald-200', <Check key="i" size={14} />,
         'Tudo sincronizado']

  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold border-b ${estilo} animate-fade-in`}
    >
      {icone}
      <span>{texto}</span>
    </div>
  )
}
