// src/lib/api.ts
import type {
  UserSession,
  DashboardSnapshot,
  Activity,
  BotFlow,
  Broadcast,
  Contact,
  ImportResult,
} from './types'
import type { FlowModel, FlowNode, NodeKind, FlowEdge } from './types'
export const SESSION_KEY = 'zapflow_session'
const CONTACTS_KEY = 'zapflow_contacts'
const FLOWS_KEY = 'zapflow_flows'
const BROADCASTS_KEY = 'zapflow_broadcasts'
const FLOWDATA_PREFIX = 'zapflow_flowdata_'

/* ===========================
   Sessão (Passo 1/2)
   =========================== */

function seedTrialSession(): UserSession {
  const in14d = new Date()
  in14d.setDate(in14d.getDate() + 14)
  const session: UserSession = {
    userId: 'demo-user',
    email: 'demo@zapflow.mz',
    plan: 'trial',
    trialEndsAt: in14d.toISOString(),
    token: 'demo-token',
  }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
  return session
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return seedTrialSession()
    const parsed = JSON.parse(raw) as UserSession
    return parsed ?? seedTrialSession()
  } catch {
    return seedTrialSession()
  }
}

export async function loginWithEmail(email: string, _password: string): Promise<UserSession> {
  await sleep(300)
  const existing = getSession()
  const session: UserSession = {
    userId: existing?.userId ?? (crypto.randomUUID?.() ?? String(Date.now())),
    email,
    plan: existing?.plan ?? 'trial',
    trialEndsAt: existing?.trialEndsAt,
    token: existing?.token ?? 'demo-token',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}

/* ===========================
   Helpers
   =========================== */
function id(): string {
  return crypto.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
function nowISO() { return new Date().toISOString() }
function sleep(ms = 250) { return new Promise((r) => setTimeout(r, ms)) }

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
function setJSON<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

/* ===========================
   Dashboard mocks (Passo 2)
   =========================== */
function n(base: number, jitter = 0.08): number {
  const f = 1 + (Math.random() * 2 - 1) * jitter
  return Math.max(0, Math.round(base * f))
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  await sleep(250)
  return {
    totals: {
      automations: n(2847, 0.12),
      successRate: Math.min(100, Math.max(92, Math.round(95 + Math.random() * 4))),
      contacts: n(12680, 0.1),
      messages: n(45210, 0.1),
    },
    trend: {
      automations7d: Array.from({ length: 7 }, (_, i) => n(250 + i * 10, 0.2)),
      messages7d: Array.from({ length: 7 }, (_, i) => n(5800 + i * 120, 0.2)),
    },
  }
}

export async function listRecentActivity(): Promise<Activity[]> {
  await sleep(250)
  const now = Date.now()
  const mins = (m: number) => new Date(now - m * 60 * 1000).toISOString()
  return [
    { id: 'a1', type: 'broadcast', title: 'Campanha “Welcome Series” enviada', description: 'Disparada para 1.250 contatos', ts: mins(12), status: 'success' },
    { id: 'a2', type: 'bot_run', title: 'Fluxo “Qualificação de Lead” executado', description: '31 leads qualificados', ts: mins(45), status: 'success' },
    { id: 'a3', type: 'contact_import', title: 'Importação de contatos (CSV)', description: '582 novos contatos adicionados', ts: mins(90), status: 'warning' },
    { id: 'a4', type: 'flow_published', title: 'Novo fluxo publicado', description: '“Carrinho Abandonado v2”', ts: mins(180), status: 'success' },
  ]
}

/* ===========================
   Contacts (Passo 3)
   =========================== */
export async function listContacts(): Promise<Contact[]> {
  await sleep(200)
  const seed: Contact[] = [
    { id: id(), name: 'Carlos Mussa', phone: '+258840000001', tags: ['lead'], createdAt: nowISO() },
    { id: id(), name: 'Ana Joaquim', phone: '+258840000002', tags: ['cliente','vip'], createdAt: nowISO() },
    { id: id(), name: 'Ricardo Nhantumbo', phone: '+258840000003', tags: ['lead','newsletter'], createdAt: nowISO() },
  ]
  return getJSON<Contact[]>(CONTACTS_KEY, seed)
}

export async function importContacts(csvText: string): Promise<ImportResult> {
  await sleep(300)
  const rows = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  // formato esperado: name,phone[,tags]
  let imported = 0, duplicates = 0, failed = 0
  const current = await listContacts()
  const existingPhones = new Set(current.map(c => c.phone))

  for (const line of rows) {
    const [name, phone, tagsStr] = line.split(',').map(s => s?.trim() ?? '')
    if (!name || !phone) { failed++; continue }
    if (existingPhones.has(phone)) { duplicates++; continue }

    current.push({
      id: id(),
      name,
      phone,
      tags: (tagsStr ? tagsStr.split('|').map(t => t.trim()).filter(Boolean) : []),
      createdAt: nowISO(),
    })
    existingPhones.add(phone)
    imported++
  }

  setJSON(CONTACTS_KEY, current)
  return { imported, duplicates, failed }
}

/* ===========================
   Flows (Passo 3)
   =========================== */
export async function listFlows(): Promise<BotFlow[]> {
  await sleep(200)
  const seed: BotFlow[] = [
    { id: id(), name: 'Qualificação de Lead', status: 'active', updatedAt: nowISO() },
    { id: id(), name: 'Onboarding Inicial', status: 'draft', updatedAt: nowISO() },
  ]
  return getJSON<BotFlow[]>(FLOWS_KEY, seed)
}

export async function createFlow(name: string): Promise<BotFlow> {
  await sleep(250)
  const all = await listFlows()
  const flow: BotFlow = { id: id(), name, status: 'draft', updatedAt: nowISO() }
  const next = [flow, ...all]
  setJSON(FLOWS_KEY, next)
  return flow
}

/* ===========================
   Broadcasts (Passo 3)
   =========================== */
export async function listBroadcasts(): Promise<Broadcast[]> {
  await sleep(200)
  const seed: Broadcast[] = [
    { id: id(), name: 'Welcome Series', status: 'sent', createdAt: nowISO(), scheduledAt: nowISO() },
    { id: id(), name: 'Promo Sexta', status: 'scheduled', createdAt: nowISO(), scheduledAt: new Date(Date.now()+3600e3).toISOString() },
  ]
  return getJSON<Broadcast[]>(BROADCASTS_KEY, seed)
}

export async function createBroadcast(name: string, scheduleISO?: string): Promise<Broadcast> {
  await sleep(250)
  const all = await listBroadcasts()
  const b: Broadcast = {
    id: id(),
    name,
    status: scheduleISO ? 'scheduled' : 'draft',
    createdAt: nowISO(),
    scheduledAt: scheduleISO,
  }
  setJSON(BROADCASTS_KEY, [b, ...all])
  return b
}

export async function scheduleBroadcast(idToSchedule: string, whenISO: string): Promise<Broadcast | null> {
  await sleep(200)
  const all = await listBroadcasts()
  const idx = all.findIndex(b => b.id === idToSchedule)
  if (idx === -1) return null
  all[idx] = { ...all[idx], status: 'scheduled', scheduledAt: whenISO }
  setJSON(BROADCASTS_KEY, all)
  return all[idx]
}

// src/lib/api.ts (adicione isto)
export async function createTrialSession(email: string): Promise<UserSession> {
  await sleep(300)

  const ok = /\S+@\S+\.\S+/.test(email)
  if (!ok) throw new Error('E-mail inválido')

  const in14d = new Date()
  in14d.setDate(in14d.getDate() + 14)

  const session: UserSession = {
    userId: crypto.randomUUID?.() ?? String(Date.now()),
    email,
    plan: 'trial',
    trialEndsAt: in14d.toISOString(),
    token: 'demo-token',
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}

  return session
}

// src/lib/api.ts (adicione em qualquer lugar das exports)

export function updateEdgeLabel(model: FlowModel, edgeId: string, label: string) {
  const e = model.edges.find(e => e.id === edgeId)
  if (!e) return
  e.label = label
  model.updatedAt = new Date().toISOString()
}


export function loadFlowModel(flowId: string): FlowModel {
  const key = FLOWDATA_PREFIX + flowId
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as FlowModel
  } catch {}

  // seed inicial com nó Start
  const model: FlowModel = {
    id: flowId,
    nodes: [
      {
        id: id(),
        kind: 'start',
        x: 120,
        y: 120,
        data: { label: 'Início' },
      },
    ],
    edges: [],
    updatedAt: nowISO(),
  }
  try { localStorage.setItem(key, JSON.stringify(model)) } catch {}
  return model
}

export function saveFlowModel(model: FlowModel) {
  model.updatedAt = nowISO()
  const key = FLOWDATA_PREFIX + model.id
  try { localStorage.setItem(key, JSON.stringify(model)) } catch {}
}

export function addNode(model: FlowModel, kind: NodeKind, x: number, y: number): FlowNode {
  const node: FlowNode = {
    id: id(),
    kind,
    x, y,
    data: {
      label: kind === 'start' ? 'Início' : kind === 'message' ? 'Mensagem' : 'Escolha',
      text: kind === 'message' ? 'Texto da mensagem...' : undefined,
      options: kind === 'choice' ? ['Opção A', 'Opção B'] : undefined,
    },
  }
  model.nodes.push(node)
  return node
}

export function updateNode(model: FlowModel, nodeId: string, patch: Partial<FlowNode>) {
  const i = model.nodes.findIndex(n => n.id === nodeId)
  if (i >= 0) model.nodes[i] = { ...model.nodes[i], ...patch, data: { ...model.nodes[i].data, ...patch.data } }
}

export function removeNode(model: FlowModel, nodeId: string) {
  model.nodes = model.nodes.filter(n => n.id !== nodeId)
  model.edges = model.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
}

export function addEdge(model: FlowModel, from: string, to: string): FlowEdge | null {
  if (from === to) return null
  if (!model.nodes.find(n => n.id === from) || !model.nodes.find(n => n.id === to)) return null
  const dup = model.edges.find(e => e.from === from && e.to === to)
  if (dup) return dup
  const edge: FlowEdge = { id: id(), from, to }
  model.edges.push(edge)
  return edge
}

export function removeEdge(model: FlowModel, edgeId: string) {
  model.edges = model.edges.filter(e => e.id !== edgeId)
}
