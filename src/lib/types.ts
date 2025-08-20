// src/lib/types.ts
export type Plan = 'trial' | 'starter' | 'professional' | 'enterprise'

export interface UserSession {
  userId: string
  email: string
  plan: Plan
  trialEndsAt?: string // ISO quando plan === 'trial'
  token?: string
}

/** Features p/ gating */
export type FeatureKey = 'bot' | 'broadcast' | 'contacts' | 'advanced'

/** Dashboard (Passo 2) */
export interface DashboardSnapshot {
  totals: {
    automations: number
    successRate: number // 0..100
    contacts: number
    messages: number
  }
  trend: {
    automations7d: number[]
    messages7d: number[]
  }
}

export type ActivityType = 'bot_run' | 'broadcast' | 'contact_import' | 'flow_published'
export type ActivityStatus = 'success' | 'warning' | 'error'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  ts: string
  status?: ActivityStatus
}

/** ===== Passo 3: Flows, Broadcasts, Contacts ===== */
export type FlowStatus = 'draft' | 'active'
export interface BotFlow {
  id: string
  name: string
  status: FlowStatus
  updatedAt: string // ISO
}

export type BroadcastStatus = 'draft' | 'scheduled' | 'sent'
export interface Broadcast {
  id: string
  name: string
  status: BroadcastStatus
  createdAt: string // ISO
  scheduledAt?: string // ISO
}

export interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
  createdAt: string // ISO
}

export interface ImportResult {
  imported: number
  duplicates: number
  failed: number
}

// ===== Passo 4: Flow Model =====
export type NodeKind = 'start' | 'message' | 'choice'

export interface FlowNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  data: {
    label?: string
    text?: string
    options?: string[] // para 'choice'
  }
}

export interface FlowEdge {
  id: string
  from: string
    to: string
  label?: string
}

export interface FlowModel {
  id: string           // flowId
  nodes: FlowNode[]
  edges: FlowEdge[]
  updatedAt: string
}
