// src/Pages/Dashboard/Broadcasts/UploadContacts.tsx
import  { useState } from 'react'
import { importContacts } from '../../lib/api'

export default function UploadContacts({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [csv, setCsv] = useState('Nome, +258840000010, lead|newsletter\nMaria, +258840000011, cliente')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; duplicates: number; failed: number } | null>(null)

  const handleImport = async () => {
    setLoading(true)
    const r = await importContacts(csv)
    setResult(r)
    setLoading(false)
    onImported()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="w-full max-w-lg rounded-xl border border-green-500/30 bg-gray-950 p-4">
        <div className="font-semibold mb-2">Importar contatos (CSV simples)</div>
        <p className="text-xs text-gray-400 mb-3">
          Formato: <code>name, phone, tags|separadas|por|pipe</code>. Uma linha por contato.
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {result && (
          <div className="mt-3 text-xs text-gray-300">
            Importados: <b className="text-green-300">{result.imported}</b> • Duplicados: <b className="text-yellow-300">{result.duplicates}</b> • Falhas: <b className="text-red-300">{result.failed}</b>
          </div>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500/10">Fechar</button>
          <button
            onClick={handleImport}
            disabled={loading || !csv.trim()}
            className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  )
}
