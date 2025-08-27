// FILE: src/Pages/Provider/AuthProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react'

import { createTrialSession, loginWithEmail, getSession } from '../../lib/api'
import type { Plan, UserSession } from '../../lib/types'
import type { ApiResult } from '../../lib/types'

/**
 * User "leve" para o frontend (derivado de UserSession).
 * Mantém a compatibilidade com telas que usam `user`.
 */
type User = {
  id: string
  email: string
  plan: Plan
}

type AuthContextType = {
  user: User | null
  token: string | null
  trialExpiresAt: string | null
  isTrialActive: boolean
  signOut: () => void
  startTrial: (p: { name: string; email: string; password?: string }) => Promise<void>
  signIn: (p: { email: string; password: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSessionToUser(s: UserSession): User {
  return { id: s.userId, email: s.email, plan: s.plan }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Se você não usa token real neste MVP, mantemos null.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState<User | null>(() => {
    const s = getSession()
    return s ? mapSessionToUser(s) : null
  })
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(() => {
    const s = getSession()
    return s?.trialEndsAt ?? localStorage.getItem('trial_expiresAt')
  })

  // Garantir que, ao montar, a gente sincronize o estado com o que estiver salvo
  useEffect(() => {
    const s = getSession()
    if (s) {
      setUser(mapSessionToUser(s))
      setTrialExpiresAt(s.trialEndsAt ?? null)
      // token "fake" para compatibilidade (opcional)
      if (!token) {
        setToken('local')
        localStorage.setItem('auth_token', 'local')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isTrialActive = useMemo(() => {
    if (!trialExpiresAt) return false
    return new Date(trialExpiresAt).getTime() > Date.now()
  }, [trialExpiresAt])

  // Persiste a partir de um UserSession (retornado pelos métodos do api.ts)
  const persistFromSession = useCallback((s: UserSession) => {
    setUser(mapSessionToUser(s))
    setTrialExpiresAt(s.trialEndsAt ?? null)

    // Compat extra p/ telas antigas:
    localStorage.setItem('auth_user', JSON.stringify(mapSessionToUser(s)))
    if (s.trialEndsAt) localStorage.setItem('trial_expiresAt', s.trialEndsAt)
    // Token "local" só para manter mesma API do contexto
    setToken('local')
    localStorage.setItem('auth_token', 'local')
  }, [])

  const startTrial = useCallback(
    async (p: { name: string; email: string; password?: string }) => {
      // api.ts espera apenas o e-mail (conforme seu erro TS2345)
      const res: ApiResult<UserSession> = await createTrialSession(p.email)
      if (!res.ok || !res.data) throw new Error(res.error ?? 'Falha ao iniciar trial')
      persistFromSession(res.data)
    },
    [persistFromSession]
  )

  const signIn = useCallback(
    async (p: { email: string; password: string }) => {
      const res: ApiResult<UserSession> = await loginWithEmail(p.email, p.password)
      if (!res.ok || !res.data) throw new Error(res.error ?? 'Falha ao entrar')
      persistFromSession(res.data)
    },
    [persistFromSession]
  )

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
    setTrialExpiresAt(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('trial_expiresAt')
    // Se o seu api.ts salvar a sessão em outra chave, limpe aqui também:
    localStorage.removeItem('mock_session') // opcional, dependendo do seu api.ts
  }, [])

  const value: AuthContextType = {
    user,
    token,
    trialExpiresAt,
    isTrialActive,
    signOut,
    startTrial,
    signIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
