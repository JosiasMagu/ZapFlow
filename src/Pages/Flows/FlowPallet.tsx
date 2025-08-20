import { Play, MessageSquare, GitBranch } from 'lucide-react'
import type { NodeKind } from '../../lib/types'

export default function FlowPalette({ onAdd }: { onAdd: (kind: NodeKind) => void }) {
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
        onClick={() => onAdd('message')}
        className="w-full flex items-center gap-2 rounded-lg border border-green-500/30 p-2 text-sm hover:bg-green-500/10"
      >
        <MessageSquare className="h-4 w-4 text-green-400" /> Mensagem
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
