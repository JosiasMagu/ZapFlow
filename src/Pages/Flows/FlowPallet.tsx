// FILE: src/Pages/Flows/FlowPallet.tsx
import { Play, MessageSquare, GitBranch } from 'lucide-react'
import type { NodeKind } from '../../lib/types'
import { getSession } from '../../lib/api'
import { FREE_LIMITS, getUsageSnapshot, atLimit } from '../../lib/usage'

export default function FlowPalette({ onAdd }: { onAdd: (kind: NodeKind) => void }) {
  const session = getSession()
  const trial = session.plan === 'trial'
  const usage = getUsageSnapshot()
  const msgDisabled = trial && atLimit(usage.flowMessageNodes, FREE_LIMITS.flowMessageNodes)

  return (
    <aside className="w-56 border-r border-green-500/20 bg-gray-950 p-3 space-y-3">
      <div className="text-xs text-gray-400 px-1">Palette</div>
      <button
        onClick={() => onAdd('start')}
        className="w-full flex items-center gap-2 rounded-lg border border-green-500/30 p-2 text-sm hover:bg-green-500/10"
      >
        <Play className="h-4 w-4 text-green-400" /> Nó Start
      </button>
      <button
        disabled={msgDisabled}
        onClick={() => !msgDisabled && onAdd('message')}
        className={`w-full flex items-center gap-2 rounded-lg border p-2 text-sm ${msgDisabled ? 'border-red-500/30 text-red-300 opacity-70' : 'border-green-500/30 hover:bg-green-500/10'}`}
        title={msgDisabled ? 'Limite do trial: até 10 mensagens no fluxo' : 'Adicionar mensagem'}
      >
        <MessageSquare className={`h-4 w-4 ${msgDisabled ? 'text-red-400' : 'text-green-400'}`} /> Mensagem
      </button>
      <button
        onClick={() => onAdd('choice')}
        className="w-full flex items-center gap-2 rounded-lg border border-green-500/30 p-2 text-sm hover:bg-green-500/10"
      >
        <GitBranch className="h-4 w-4 text-green-400" /> Escolha
      </button>
    </aside>
  )
}
