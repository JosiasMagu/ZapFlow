// src/Pages/Auth/SignUpPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrialSession } from '../../lib/api'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // cria sessão trial (lança erro se e-mail inválido)
      await createTrialSession(email || 'trial@zapflow.co.mz')
      // se chegou aqui, sessão foi criada e salva no localStorage
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Falha ao criar conta de teste'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 border border-green-500/20 rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold">Criar conta (teste)</h1>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <input
          type="email"
          placeholder="voce@empresa.co.mz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-green-500/30 bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-500 text-black font-semibold py-2 hover:bg-green-400 disabled:opacity-60"
        >
          {loading ? 'Criando…' : 'Criar e entrar'}
        </button>
      </form>
    </div>
  )
}
