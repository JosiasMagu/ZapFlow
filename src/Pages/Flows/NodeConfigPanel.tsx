// FILE: src/Pages/Flows/NodeConfigPanel.tsx
import type { FlowNode } from '../../lib/types'

export default function NodeConfigPanel({
  node, onChange, onDelete,
}: { node: FlowNode | null; onChange: (patch: Partial<FlowNode>) => void; onDelete: () => void }) {
  if (!node) {
    return (
      <aside className="w-72 border-l border-green-500/20 bg-gray-950 p-3 text-sm text-gray-400">
        Selecione um nó para editar
      </aside>
    )
  }

  return (
    <aside className="w-72 border-l border-green-500/20 bg-gray-950 p-3 space-y-3">
      <div className="text-xs text-gray-400 px-1">Configuração</div>

      <div>
        <label className="text-xs text-gray-300">Rótulo</label>
        <input
          value={node.data.label ?? ''}
          onChange={(e) => onChange({ data: { label: e.target.value } as any })}
          className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {node.kind === 'message' && (
        <div>
          <label className="text-xs text-gray-300">Texto</label>
          <textarea
            rows={5}
            value={node.data.text ?? ''}
            onChange={(e) => onChange({ data: { text: e.target.value } as any })}
            className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      {node.kind === 'choice' && (
        <div>
          <label className="text-xs text-gray-300">Opções (uma por linha)</label>
          <textarea
            rows={4}
            value={(node.data.options ?? []).join('\n')}
            onChange={(e) => onChange({ data: { options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) } as any })}
            className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      <div className="pt-2 border-t border-green-500/20">
        <button onClick={onDelete} className="w-full rounded-lg border border-red-500/30 text-red-300 text-sm py-2 hover:bg-red-500/10">
          Remover nó
        </button>
      </div>
    </aside>
  )
}
