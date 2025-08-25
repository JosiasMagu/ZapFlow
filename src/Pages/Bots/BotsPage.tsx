// src/Pages/Dashboard/Bots/BotsPage.tsx
import  { useEffect, useMemo, useState } from 'react'
import { Plus, Power, Trash2, Bot as BotIcon } from 'lucide-react'
import type { Bot } from '../../lib/types'
import { getSession, listBots, createBot, toggleBot, deleteBot } from '../../lib/api'
import { useUpgrade } from '../Context/UpgradeContext'

const TRIAL_BOT_LIMIT = 1

export default function BotsPage() {
  const { open: openUpgrade } = useUpgrade()
  const session = getSession()
  const isTrial = session?.plan === 'trial'

  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const canCreate = useMemo(() => {
    if (!isTrial) return true
    return bots.length < TRIAL_BOT_LIMIT
  }, [isTrial, bots.length])

  async function refresh() {
    setLoading(true)
    const res = await listBots()
    if (res.ok && res.data) setBots(res.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onCreate() {
    if (!canCreate) {
      openUpgrade('bot')
      return
    }
    if (!name.trim()) return
    setCreating(true)
    const res = await createBot(name.trim())
    setCreating(false)
    if (res.ok) {
      setName('')
      refresh()
    }
  }

  async function onToggle(id: string) {
    const res = await toggleBot(id)
    if (res.ok) refresh()
  }

  async function onDelete(id: string) {
    if (!confirm('Deseja mesmo apagar este bot?')) return
    const res = await deleteBot(id)
    if (res.ok) refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <BotIcon className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Bots (IA)</h1>
            <p className="text-sm text-gray-400">Automatize atendimento e respostas no WhatsApp.</p>
          </div>
        </div>

        <button
          onClick={() => (canCreate ? onCreate() : openUpgrade('bot'))}
          disabled={creating}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition
            ${canCreate ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-gray-800 text-gray-400 cursor-pointer'}`}
          title={canCreate ? 'Criar novo bot' : 'Limite do trial atingido'}
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {creating ? 'Criando...' : 'Novo Bot'}
          </div>
        </button>
      </div>

      {/* Aviso de trial/limite */}
      {isTrial && (
        <div className="text-xs text-gray-400">
          Trial: {bots.length}/{TRIAL_BOT_LIMIT} bot(s). Para criar mais, faça upgrade.
        </div>
      )}

      {/* Campo de nome (inline) */}
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex h-10 w-full max-w-md rounded-md border border-green-500/20 bg-black px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Nome do bot (ex: Suporte WhatsApp)"
        />
        <button
          onClick={() => (canCreate ? onCreate() : openUpgrade('bot'))}
          disabled={creating}
          className={`rounded-md px-3 h-10 text-sm font-semibold transition
            ${canCreate ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-gray-800 text-gray-400 cursor-pointer'}`}
        >
          Adicionar
        </button>
      </div>

      {/* Tabela/Listagem */}
      <div className="rounded-xl border border-green-500/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-950/60 border-b border-green-500/20">
            <tr className="text-left">
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Criado em</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Carregando...</td>
              </tr>
            ) : bots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  Nenhum bot criado ainda.
                </td>
              </tr>
            ) : (
              bots.map((b) => (
                <tr key={b.id} className="border-t border-green-500/10">
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                      b.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {b.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggle(b.id)}
                        className="rounded-md border border-green-500/30 px-3 py-1.5 hover:border-green-400 flex items-center gap-1"
                        title={b.status === 'active' ? 'Pausar' : 'Ativar'}
                      >
                        <Power className="h-4 w-4" />
                        {b.status === 'active' ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => onDelete(b.id)}
                        className="rounded-md border border-red-500/30 px-3 py-1.5 hover:border-red-400 flex items-center gap-1"
                        title="Apagar"
                      >
                        <Trash2 className="h-4 w-4" />
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
