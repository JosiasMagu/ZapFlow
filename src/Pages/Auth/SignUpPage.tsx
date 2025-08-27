// FILE: src/Pages/Auth/SignUpPage.tsx
// Versão simples com campo WhatsApp (phone). Usa createTrialSession do api.ts.

import { useState } from 'react'
import { createTrialSession } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      await createTrialSession({ name, email, password, phone })
      nav('/dashboard')
    } catch (e: any) {
      setErr(e?.message || 'Falha ao criar conta.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-16 rounded-xl border border-green-500/20 bg-gray-950 p-6">
      <h1 className="text-xl font-semibold mb-4">Crie sua conta (Teste grátis)</h1>
      {err && <div className="mb-3 text-sm text-red-300">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-300">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-300">E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-300">WhatsApp</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+258 84 000 0000" className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-300">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-green-500/20 bg-black p-2 text-sm" />
        </div>
        <button disabled={loading} className="w-full rounded-lg bg-green-500 text-black font-semibold py-2 hover:bg-green-400 disabled:opacity-60">
          {loading ? 'Criando...' : 'Começar teste grátis'}
        </button>
      </form>
    </div>
  )
}
