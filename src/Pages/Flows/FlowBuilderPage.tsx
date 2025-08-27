// FILE: src/Pages/Flows/FlowBuilderPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GitBranch, Pencil, Trash2, Copy, PlayCircle, Sparkles, ChevronRight, Clock } from 'lucide-react'
import {
  listFlows, createFlow, renameFlow, deleteFlow, duplicateFlow,
  loadFlowModel, saveFlowModel
} from '../../lib/api'
import type { BotFlow, FlowModel } from '../../lib/types'
import { featureUsage, nearLimit, atLimit } from '../../lib/usage'
import QuotaBar from '../Dashboard/Components/Quotabar'

type TemplateId = 'leads_basico' | 'suporte_basico'
type UIFlow = BotFlow & { nodesCount: number; edgesCount: number }

const templates: { id: TemplateId; name: string; desc: string }[] = [
  { id: 'leads_basico', name: 'Captação de Leads', desc: 'Pergunta nome + telefone e envia mensagem de boas-vindas.' },
  { id: 'suporte_basico', name: 'Suporte Rápido', desc: 'Menu de opções (duvidas, preços, contato humano).' },
]

export default function FlowBuilderPage() {
  const nav = useNavigate()
  const [items, setItems] = useState<UIFlow[]>([])
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)

  // USO/LIMITES (trial: 1 funil / 10 mensagens no fluxo)
  const flowUsage = featureUsage('flow') // { used, limit, pct, extra: { flows, flowMessageNodes } }
  const hint = useMemo(() => {
    const extra = (flowUsage as any).extra
    if (!extra) return undefined
    return `Fluxos: ${extra.flows}/${flowUsage.limit} • Mensagens de fluxo: ${extra.flowMessageNodes}/10`
  }, [flowUsage])

  async function reload() {
    const idx = await listFlows() // BotFlow[]
    const enriched: UIFlow[] = idx.map((f: BotFlow) => {
      const m = loadFlowModel(f.id)
      return { ...f, nodesCount: m.nodes.length, edgesCount: m.edges.length }
    })
    setItems(enriched)
  }
  useEffect(() => { reload() }, [])

  function goCanvas(id: string) {
    nav(`/dashboard/flows/${id}`)
  }

  async function handleCreate() {
    if (atLimit(flowUsage.used, flowUsage.limit)) {
      alert('Limite do plano grátis atingido. Faça upgrade para criar mais funis.')
      return
    }
    const flow = await createFlow('Novo funil')
    goCanvas(flow.id)
  }

  function applyTemplate(model: FlowModel, tpl: TemplateId) {
    // zera
    model.nodes = []
    model.edges = []

    if (tpl === 'leads_basico') {
      // start -> msg -> choice (simples)
      const s = { id: crypto.randomUUID?.() ?? 's1', kind: 'start' as const, x: 120, y: 120, data: { label: 'Início' } }
      const m1 = { id: crypto.randomUUID?.() ?? 'm1', kind: 'message' as const, x: 380, y: 110, data: { label: 'Boas-vindas', text: 'Olá! Sou o assistente. Como posso te chamar e qual seu WhatsApp?' } }
      const c1 = { id: crypto.randomUUID?.() ?? 'c1', kind: 'choice' as const, x: 660, y: 110, data: { label: 'Confirmação', options: ['Enviar meus dados', 'Depois'] } }
      model.nodes.push(s, m1, c1)
      model.edges.push({ id: 'e1', from: s.id, to: m1.id }, { id: 'e2', from: m1.id, to: c1.id })
    }

    if (tpl === 'suporte_basico') {
      const s = { id: crypto.randomUUID?.() ?? 's1', kind: 'start' as const, x: 120, y: 120, data: { label: 'Início' } }
      const c1 = { id: crypto.randomUUID?.() ?? 'c1', kind: 'choice' as const, x: 380, y: 100, data: { label: 'Menu', options: ['Dúvidas', 'Preços'] } }
      const mA = { id: crypto.randomUUID?.() ?? 'mA', kind: 'message' as const, x: 660, y: 60, data: { label: 'Dúvidas', text: 'Envie sua dúvida e responderei já já!' } }
      const mB = { id: crypto.randomUUID?.() ?? 'mB', kind: 'message' as const, x: 660, y: 160, data: { label: 'Preços', text: 'Nossos planos começam em 350 MT/mês.' } }
      model.nodes.push(s, c1, mA, mB)
      model.edges.push({ id: 'e1', from: s.id, to: c1.id }, { id: 'e2', from: c1.id, to: mA.id, label: 'Dúvidas' }, { id: 'e3', from: c1.id, to: mB.id, label: 'Preços' })
    }

    model.updatedAt = new Date().toISOString()
    saveFlowModel(model)
  }

  async function createFromTemplate(tpl: TemplateId) {
    if (atLimit(flowUsage.used, flowUsage.limit)) {
      alert('Limite do plano grátis atingido. Faça upgrade para usar modelos.')
      return
    }
    const flow = await createFlow(`Funil • ${templates.find(t => t.id === tpl)?.name}`)
    const m = loadFlowModel(flow.id)
    applyTemplate(m, tpl)
    goCanvas(flow.id)
  }

  async function onDuplicate(id: string) {
    await duplicateFlow(id)
    await reload()
  }

  async function onRenameSubmit() {
    if (!renaming) return
    await renameFlow(renaming.id, renaming.name)
    setRenaming(null)
    await reload()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Funis</h1>
            <p className="text-sm text-gray-400">Crie fluxos de atendimento e captação com poucos cliques.</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-black hover:bg-green-400"
        >
          <Plus className="h-4 w-4" /> Novo Funil
        </button>
      </div>

      {/* Quota (trial) */}
      <QuotaBar
        label="Limites do plano grátis"
        used={flowUsage.used}
        limit={flowUsage.limit}
        hint={hint}
      />
      {nearLimit(flowUsage.used, flowUsage.limit) && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          ⚠️ Você está perto do limite do seu plano. Faça upgrade para criar mais funis/mensagens no fluxo.
        </div>
      )}

      {/* Grid dos funis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Card: Novo Funil */}
        <button
          onClick={handleCreate}
          className="group h-40 rounded-xl border-2 border-dashed border-green-500/40 bg-gray-950 hover:border-green-400 hover:bg-green-500/5 transition-colors flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full border-2 border-dashed border-green-500/50 flex items-center justify-center group-hover:border-green-400">
            <Plus className="h-6 w-6 text-green-400" />
          </div>
          <div className="mt-3 text-sm font-semibold text-green-300">Novo Funil</div>
          <div className="text-[11px] text-gray-400">Comece do zero</div>
        </button>

        {/* Cards dos funis existentes */}
        {items.map((f: UIFlow) => (
          <div key={f.id} className="h-40 rounded-xl border border-green-500/20 bg-gray-950 p-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5">Nós: {f.nodesCount}</span>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5">Arestas: {f.edgesCount}</span>
                </div>
              </div>
              <button
                className="rounded-md p-1 hover:bg-green-500/10"
                title="Renomear"
                onClick={() => setRenaming({ id: f.id, name: f.name })}
              >
                <Pencil className="h-4 w-4 text-gray-300" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Atualizado: {new Date(f.updatedAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goCanvas(f.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-black hover:bg-green-400"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> Abrir
                </button>
                <button
                  onClick={() => onDuplicate(f.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-green-500/30 px-3 py-1 hover:bg-green-500/10"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicar
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Excluir este funil?')) {
                      await deleteFlow(f.id)
                      await reload()
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 hover:bg-red-500/10 text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modelos */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Modelos prontos</div>
          <a href="#templates" className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center">
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-green-400" />
                </div>
                <div className="font-medium">{t.name}</div>
              </div>
              <div className="mt-2 text-sm text-gray-400">{t.desc}</div>
              <div className="mt-4">
                <button
                  onClick={() => createFromTemplate(t.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm hover:bg-green-500/10"
                >
                  Usar modelo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renomear */}
      {renaming && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={() => setRenaming(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-green-500/30 bg-gray-950 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold mb-2">Renomear funil</div>
            <input
              autoFocus
              value={renaming.name}
              onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
              className="w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setRenaming(null)}
                className="rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500/10"
              >
                Cancelar
              </button>
              <button
                onClick={onRenameSubmit}
                className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
