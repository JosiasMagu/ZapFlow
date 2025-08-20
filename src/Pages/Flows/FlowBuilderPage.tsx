// src/Pages/Dashboard/Flows/FlowBuilderPage.tsx
import { useEffect, useState } from 'react'
import { Plus, RefreshCcw } from 'lucide-react'
import { createFlow, listFlows } from '../../lib/api'
import type { BotFlow } from '../../lib/types'
import { useNavigate } from 'react-router-dom'

export default function FlowBuilderPage() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [flows, setFlows] = useState<BotFlow[]>([])

  const load = async () => {
    setLoading(true)
    const data = await listFlows()
    setFlows(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    const flow = await createFlow(name.trim())
    setName('')
    await load()
    nav(`/dashboard/flows/${flow.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Flows</h1>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm hover:bg-green-500/10"
        >
          <RefreshCcw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      <div className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do novo flow"
            className="flex-1 rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Criar & abrir
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-green-500/20 bg-gray-950 animate-pulse" />
            ))
          : flows.map((f) => (
              <div key={f.id} className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-xs text-gray-400">
                      {f.status.toUpperCase()} • {new Date(f.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => nav(`/dashboard/flows/${f.id}`)}
                    className="rounded-full border border-green-500/30 px-3 py-1 text-xs text-green-300 hover:bg-green-500/10"
                  >
                    Abrir builder
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
