import { useState } from 'react'
import { LayoutList, Columns3 } from 'lucide-react'

export type Visao = 'lista' | 'kanban'

/**
 * Alternador Lista/Kanban.
 *
 * A escolha fica no localStorage POR TELA (`aux.visao.notas`,
 * `aux.visao.lembretes`): quem gosta de kanban nas notas pode preferir lista
 * nos lembretes, e ninguém quer reescolher a cada vez que abre o app.
 */
export function useVisao(tela: string, padrao: Visao = 'lista') {
  const chave = `aux.visao.${tela}`
  const [visao, setVisaoState] = useState<Visao>(
    () => (localStorage.getItem(chave) as Visao) || padrao
  )
  const setVisao = (v: Visao) => {
    setVisaoState(v)
    localStorage.setItem(chave, v)
  }
  return { visao, setVisao }
}

export default function AlternadorVisao({
  visao, onMudar,
}: {
  visao: Visao
  onMudar: (v: Visao) => void
}) {
  const opcoes: Array<{ id: Visao; rotulo: string; Icone: typeof LayoutList }> = [
    { id: 'lista', rotulo: 'Lista', Icone: LayoutList },
    { id: 'kanban', rotulo: 'Kanban', Icone: Columns3 },
  ]
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="inline-flex shrink-0 rounded-xl bg-slate-100 p-0.5"
    >
      {opcoes.map(({ id, rotulo, Icone }) => {
        const ativo = visao === id
        return (
          <button
            key={id}
            onClick={() => onMudar(id)}
            aria-pressed={ativo}
            title={rotulo}
            className={`flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-bold transition-all ${
              ativo ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <Icone size={15} />
            {/* O rótulo some no celular: dois ícones bastam e a barra não quebra */}
            <span className="hidden sm:inline">{rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Coluna de kanban. Recebe os eventos de arrastar já prontos — o pai só diz
 * o que fazer quando um card cai aqui.
 *
 * `min-w-[15rem]` + o pai com `overflow-x-auto`: no celular as colunas rolam
 * na horizontal em vez de espremer o conteúdo até ficar ilegível.
 */
export function ColunaKanban({
  titulo, cor, contagem, children, onSoltar,
}: {
  titulo: string
  cor?: string
  contagem: number
  children: React.ReactNode
  onSoltar?: () => void
}) {
  const [sobre, setSobre] = useState(false)
  return (
    <div
      onDragOver={(e) => { if (onSoltar) { e.preventDefault(); setSobre(true) } }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => { if (onSoltar) { e.preventDefault(); setSobre(false); onSoltar() } }}
      className={`flex w-[15rem] shrink-0 flex-col gap-2 rounded-2xl p-2 transition-colors sm:w-[16rem] ${
        sobre ? 'bg-primary/10 ring-2 ring-primary/40' : 'bg-slate-50/80'
      }`}
    >
      <div className="flex items-center gap-1.5 px-1.5 pt-1">
        {cor && <span className={`h-2 w-2 shrink-0 rounded-full ${cor}`} />}
        <p className="truncate text-[11px] font-black uppercase tracking-wider text-slate-500">
          {titulo}
        </p>
        <span className="ml-auto rounded-full bg-white px-1.5 text-[10px] font-black text-slate-400">
          {contagem}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
