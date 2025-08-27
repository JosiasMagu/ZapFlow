import { useEffect, useState } from 'react'
import { createBroadcast, listBroadcasts, scheduleBroadcast } from '../../lib/api'
import type { Broadcast } from '../../lib/types'
import { Calendar, Plus, RefreshCcw, Users, AlertTriangle } from 'lucide-react'
import { featureUsage, nearLimit, atLimit, shouldNudgeOnce } from '../../lib/usage'
import { useUpgrade } from '../Context/UpgradeContext'

export default function BroadcastsPage() {
  const { open: openUpgrade } = useUpgrade()
  const [items, setItems] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; name: string; when: string }>({
    open: false,
    name: '',
    when: '',
  })

  const load = async () => {
    setLoading(true)
    const data = await listBroadcasts()
    setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!modal.name.trim()) return

    const u = featureUsage('contacts')
    if (atLimit(u.used, u.limit)) {
      openUpgrade('broadcast')
      alert('Você atingiu o limite de 20 contatos no plano grátis. Faça upgrade para continuar.')
      return
    }
    if (nearLimit(u.used + 1, u.limit) && shouldNudgeOnce('broadcast_80_nudge')) {
      openUpgrade('broadcast')
    }

    setLoading(true)
    await createBroadcast(modal.name.trim(), modal.when || undefined)
    setModal({ open: false, name: '', when: '' })
    await load()
  }

  const handleSchedule = async (id: string) => {
    const u = featureUsage('contacts')
    if (atLimit(u.used, u.limit)) {
      openUpgrade('broadcast')
      alert('Limite de contatos atingido no plano grátis. Faça upgrade para enviar.')
      return
    }
    if (nearLimit(u.used, u.limit) && shouldNudgeOnce('broadcast_80_schedule')) {
      openUpgrade('broadcast')
    }

    const defVal = new Date(Date.now() + 3600e3).toISOString().slice(0, 16).replace('T', ' ')
    const when = prompt('Agendar para (ISO ou YYYY-MM-DD HH:mm):', defVal)
    if (!when) return
    const iso = when.includes('T') ? when : when.replace(' ', 'T')
    setLoading(true)
    await scheduleBroadcast(id, iso)
    await load()
  }

  // UI de quota (contatos)
  const u = featureUsage('contacts')
  const pct = Math.min(100, Math.round((u.used / Math.max(1, u.limit)) * 100))
  const c = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Broadcasts</h1>
            <p className="text-sm text-gray-400">Crie campanhas e envie mensagens para seus contatos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm hover:bg-green-500/10"
          >
            <RefreshCcw className="h-4 w-4" /> Atualizar
          </button>
          <button
            onClick={() => {
              const u0 = featureUsage('contacts')
              if (atLimit(u0.used, u0.limit)) {
                openUpgrade('broadcast')
                alert('Limite de 20 contatos no plano grátis. Faça upgrade para importar mais.')
                return
              }
              if (nearLimit(u0.used, u0.limit) && shouldNudgeOnce('broadcast_80_import')) {
                openUpgrade('broadcast')
              }
              // Aqui você pode navegar para /dashboard/contacts, se desejar:
              // navigate('/dashboard/contacts')
            }}
            className="rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500/10"
          >
            Importar contatos
          </button>
          <button
            onClick={() => setModal({ open: true, name: '', when: '' })}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
          >
            <Plus className="h-4 w-4" /> Nova campanha
          </button>
        </div>
      </div>

      {/* Quota de contatos */}
      <div className="rounded-xl border border-green-500/20 bg-gray-950 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-200">Contatos (plano grátis)</span>
            {pct >= 80 && <AlertTriangle className={`h-4 w-4 ${pct >= 100 ? 'text-red-400' : 'text-yellow-400'}`} />}
          </div>
          <span className="text-gray-400">{u.used}/{u.limit}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded bg-gray-800 overflow-hidden">
          <div className={`h-2 ${c}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          {pct >= 100 ? 'Limite atingido: faça upgrade para importar mais contatos.' :
           pct >= 80 ? 'Quase lá! Faça upgrade para evitar bloqueios.' :
           'Você pode importar até 20 contatos no plano grátis.'}
        </div>
      </div>

      {/* Lista */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-green-500/20 bg-gray-950 animate-pulse" />
            ))
          : items.map((b) => (
              <div key={b.id} className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-gray-400">
                      {b.status.toUpperCase()} {('scheduledAt' in b && (b as any).scheduledAt) ? `• ${new Date((b as any).scheduledAt).toLocaleString()}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status !== 'scheduled' && (
                      <button
                        onClick={() => handleSchedule(b.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-green-500/30 px-3 py-1 text-xs hover:bg-green-500/10"
                      >
                        <Calendar className="h-3 w-3" /> Agendar
                      </button>
                    )}
                    <button className="rounded-full border border-green-500/30 px-3 py-1 text-xs text-gray-300">Detalhes</button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Modal Nova Campanha */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="w-full max-w-md rounded-xl border border-green-500/30 bg-gray-950 p-4">
            <div className="font-semibold mb-2">Nova campanha</div>
            <div className="space-y-3">
              <input
                value={modal.name}
                onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                placeholder="Nome da campanha"
                className="w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                value={modal.when}
                onChange={(e) => setModal((m) => ({ ...m, when: e.target.value }))}
                placeholder="Agendar (opcional) ex: 2025-08-20 15:00"
                className="w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setModal({ open: false, name: '', when: '' })} className="rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500/10">Cancelar</button>
              <button
                onClick={handleCreate}
                disabled={!modal.name.trim()}
                className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
