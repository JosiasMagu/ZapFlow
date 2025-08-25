// src/lib/types.ts

export type Plan = 'trial' | 'pro' | 'enterprise'

export interface UserSession {
  userId: string
  email: string
  plan: Plan
  trialEndsAt?: string // ISO
}

// ---- ENTIDADES DO MVP (front types/DTO) ----
export interface Bot {
  id: string
  name: string
  status: 'active' | 'paused'
  createdAt: string // ISO
}

export interface Broadcast {
  id: string
  name: string
  createdAt: string
  totalRecipients: number
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
}

export interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
  createdAt: string
}

// Para futuros endpoints mockados:
export interface ApiResult<T> {
  ok: boolean
  data?: T
  error?: string
}
