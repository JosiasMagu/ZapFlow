// FILE: src/lib/types.ts
// Tipos centrais do app (mantidos simples e compatíveis com seu código)

export type Plan = 'trial' | 'pro' | 'enterprise' // usamos 'trial' para o grátis

export interface UserSession {
  userId: string
  email: string
  plan: Plan
  trialEndsAt?: string // ISO
}

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
  scheduledAt?: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
  createdAt: string
}

export interface ApiResult<T> {
  ok: boolean
  data?: T
  error?: string
}

export type ActivityType = 'bot_run' | 'broadcast' | 'contact_import' | 'flow_published'

export interface Activity {
  id: string
  type: ActivityType
  ts: string
  title?: string
  description?: string
  status?: 'ok' | 'warning' | 'error'
  [key: string]: any
}

export interface DashboardSnapshot {
  totals: {
    automations: number
    successRate: number
    contacts: number
    messages: number
  }
  [key: string]: any
}

// --- FLOWS ---
export type NodeKind = 'start' | 'message' | 'choice'

export interface FlowNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  data: {
    label?: string
    text?: string           // p/ 'message'
    options?: string[]      // p/ 'choice'
    [key: string]: any
  }
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface FlowModel {
  id: string
  name?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  updatedAt: string
  createdAt?: string
}

export interface BotFlow {
  id: string
  name: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}
