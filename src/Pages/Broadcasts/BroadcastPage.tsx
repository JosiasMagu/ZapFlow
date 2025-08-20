// src/Pages/Dashboard/Broadcasts/BroadcastsPage.tsx
import { useEffect, useState } from 'react'
import { createBroadcast, listBroadcasts, scheduleBroadcast } from '../../lib/api'
import type { Broadcast } from '../../lib/types'
import UploadContacts from './UploadsContacts'
import { Calendar, Plus, RefreshCcw } from 'lucide-react'

export default function BroadcastsPage() {
  const [items, setItems] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
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
    setLoading(true)
    await createBroadcast(modal.name.trim(), modal.when || undefined)
    setModal({ open: false, name: '', when: '' })
    await load()
  }

  const handleSchedule = async (id: string) => {
    const when = prompt('Agendar para (ISO ou YYYY-MM-DD HH:mm):', new Date(Date.now()+3600e3).toISOString().slice(0,16).replace('T',' '))
    if (!when) return
    // normalizar
    const iso = when.includes('T') ? when : when.replace(' ', 'T') + ':00'
    setLoading(true)
    await scheduleBroadcast(id, iso)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Broadcasts</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm hover:bg-green-500/10"
          >
            <RefreshCcw className="h-4 w-4" /> Atualizar
          </button>
          <button
            onClick={() => setShowImport(true)}
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
                      {b.status.toUpperCase()} {b.scheduledAt ? `• ${new Date(b.scheduledAt).toLocaleString()}` : ''}
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

      {/* Modal Importar Contatos */}
      {showImport && (
        <UploadContacts
          onClose={() => setShowImport(false)}
          onImported={() => setTimeout(() => setShowImport(false), 600)}
        />
      )}
    </div>
  )
}
