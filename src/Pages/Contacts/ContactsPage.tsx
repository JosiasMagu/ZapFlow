// src/Pages/Dashboard/Contacts/ContactsPage.tsx
import { useEffect, useMemo, useState, useDeferredValue } from 'react'
import { listContacts } from '../../lib/api'
import type { Contact } from '../../lib/types'
import UploadContacts from '../Broadcasts/UploadsContacts'
import { RefreshCcw, Search } from 'lucide-react'

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]) 
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const qDeferred = useDeferredValue(q) // ⬅️ evita travar enquanto digita
  const [showImport, setShowImport] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await listContacts()
    setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const qq = qDeferred.trim().toLowerCase()
    if (!qq) return items
    return items.filter(c =>
      c.name.toLowerCase().includes(qq) ||
      c.phone.toLowerCase().includes(qq) ||
      c.tags.join(' ').toLowerCase().includes(qq)
    )
  }, [qDeferred, items])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome, número ou tag..."
              className="pl-7 rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm hover:bg-green-500/10"
          >
            <RefreshCcw className="h-4 w-4" /> Atualizar
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
          >
            Importar CSV
          </button>
        </div>
      </div>

      {/* Tabela simples */}
      <div className="rounded-xl border border-green-500/20 bg-gray-950 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-300">
            <tr className="[&>th]:px-4 [&>th]:py-2 border-b border-green-500/20">
              <th>Nome</th>
              <th>Telefone</th>
              <th>Tags</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Nenhum contato encontrado</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t, i) => (
                        <span key={i} className="rounded-full border border-green-500/30 px-2 py-0.5 text-[11px] text-green-300">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showImport && (
        <UploadContacts
          onClose={() => setShowImport(false)}
          onImported={load}
        />
      )}
    </div>
  )
}
