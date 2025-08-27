// FILE: src/Pages/Dashboard/TemplatePage.tsx
import { Sparkles, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createFlow, loadFlowModel, saveFlowModel } from '../../lib/api'
import type { FlowModel } from '../../lib/types'

type TemplateId = 'leads_basico' | 'suporte_basico'
const templates: { id: TemplateId; name: string; desc: string }[] = [
  { id: 'leads_basico', name: 'Captação de Leads', desc: 'Pergunta nome + telefone e envia boas-vindas.' },
  { id: 'suporte_basico', name: 'Suporte Rápido', desc: 'Menu de opções (dúvidas/preços).' },
]

export default function TemplatePage() {
  const nav = useNavigate()

  function applyTemplate(model: FlowModel, tpl: TemplateId) {
    model.nodes = []
    model.edges = []
    const now = new Date().toISOString()

    if (tpl === 'leads_basico') {
      const s = { id: 's1', kind: 'start' as const, x: 120, y: 120, data: { label: 'Início' } }
      const m = {
        id: 'm1',
        kind: 'message' as const,
        x: 380,
        y: 120,
        data: { label: 'Boas-vindas', text: 'Olá! Como posso te chamar e qual é seu WhatsApp?' }
      }
      model.nodes.push(s, m)
      model.edges.push({ id: 'e1', from: s.id, to: m.id })
    } else {
      const s = { id: 's2', kind: 'start' as const, x: 120, y: 120, data: { label: 'Início' } }
      const c = { id: 'c2', kind: 'choice' as const, x: 380, y: 100, data: { label: 'Menu', options: ['Dúvidas', 'Preços'] } }
      model.nodes.push(s, c)
      model.edges.push({ id: 'e2', from: s.id, to: c.id })
    }

    model.updatedAt = now
    saveFlowModel(model)
  }

  async function createFromTemplate(id: TemplateId) {
    const flow = await createFlow(`Funil • ${templates.find(t => t.id === id)?.name}`)
    const m = loadFlowModel(flow.id)
    applyTemplate(m, id)
    nav(`/dashboard/flows/${flow.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Modelos</h1>
        <a href="/dashboard/flows" className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center">
          Voltar para Funis <ChevronRight className="h-3.5 w-3.5" />
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
  )
}
