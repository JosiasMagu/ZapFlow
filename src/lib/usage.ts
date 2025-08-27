// FILE: src/lib/usage.ts
// Cálculo de uso/limites do plano grátis (trial) e helpers de progresso/nudges.

import type { FlowModel } from './types'

export const FREE_LIMITS = {
  bots: 1,
  flows: 1,
  flowMessageNodes: 10, // Bot Fluxo → até 10 mensagens
  contacts: 20,         // Disparo → até 20 contatos
  botMessagesSent: 10,  // Bot IA → o bot pode mandar 10 msgs (aprox. pelo desenho do fluxo)
}

type UsageSnapshot = {
  bots: number
  flows: number
  flowMessageNodes: number
  contacts: number
  botMessagesSent: number
}

const LS_FLOW_MODELS = 'mock_flow_models'
const LS_BOTS = 'mock_bots'
const LS_CONTACTS = 'mock_contacts'
const LS_NUDGES = 'usage_nudges' // para não abrir o modal mil vezes

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export function getUsageSnapshot(): UsageSnapshot {
  const bots = readJSON<any[]>(LS_BOTS, []).length
  const contacts = readJSON<any[]>(LS_CONTACTS, []).length

  const models = readJSON<Record<string, FlowModel>>(LS_FLOW_MODELS, {})
  const flowIds = Object.keys(models)
  const flows = flowIds.length
  let flowMessageNodes = 0
  for (const id of flowIds) {
    const m = models[id]
    flowMessageNodes += (m?.nodes || []).filter(n => n.kind === 'message').length
  }

  // Para MVP offline, mensagens enviadas = número de 'message' nodes (estimativa)
  const botMessagesSent = flowMessageNodes

  return { bots, flows, flowMessageNodes, contacts, botMessagesSent }
}

export function percent(used: number, limit: number) {
  if (limit <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((used / limit) * 100)))
}

export function nearLimit(used: number, limit: number) {
  const p = percent(used, limit)
  return p >= 80 && p < 100
}
export function atLimit(used: number, limit: number) {
  return used >= limit
}

type FeatureKey = 'bot' | 'flow' | 'broadcast' | 'contacts'
export function featureUsage(feature: FeatureKey) {
  const u = getUsageSnapshot()
  if (feature === 'bot') return { used: u.bots, limit: FREE_LIMITS.bots, pct: percent(u.bots, FREE_LIMITS.bots) }
  if (feature === 'flow') {
    // limite “1 fluxo” OU “10 mensagens no fluxo (soma)”
    const used = Math.max(u.flows, Math.ceil(u.flowMessageNodes / FREE_LIMITS.flowMessageNodes))
    const limit = Math.max(FREE_LIMITS.flows, 1) // exibe como 1
    const pct = Math.max(percent(u.flows, FREE_LIMITS.flows), percent(u.flowMessageNodes, FREE_LIMITS.flowMessageNodes))
    return { used, limit, pct, extra: { flows: u.flows, flowMessageNodes: u.flowMessageNodes } }
  }
  if (feature === 'broadcast' || feature === 'contacts') {
    return { used: u.contacts, limit: FREE_LIMITS.contacts, pct: percent(u.contacts, FREE_LIMITS.contacts) }
  }
  return { used: 0, limit: 0, pct: 0 }
}

// Controle de “nudge” para não abrir modal repetidamente
type NudgeState = Record<string, boolean>
function readNudges(): NudgeState { return readJSON<NudgeState>(LS_NUDGES, {}) }
function writeNudges(n: NudgeState) { localStorage.setItem(LS_NUDGES, JSON.stringify(n)) }

export function shouldNudgeOnce(flag: string) {
  const n = readNudges()
  if (n[flag]) return false
  n[flag] = true
  writeNudges(n)
  return true
}
