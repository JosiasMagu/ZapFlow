// FILE: src/lib/api.ts
import {
  type UserSession,
  type Bot,
  type Broadcast,
  type FlowModel,
  type FlowNode,
  type NodeKind,
  type FlowEdge,
  type DashboardSnapshot,
  type Activity,
  type ActivityType,
  type ApiResult,
} from './types'
import { readJSON, writeJSON, uid } from './utils'

// =========================
// LocalStorage Keys
// =========================
const LS_SESSION = 'mock_session'
const LS_BOTS = 'mock_bots'
const LS_BROADCASTS = 'mock_broadcasts'
const LS_CONTACTS = 'mock_contacts'
const LS_FLOW_MODELS = 'mock_flow_models' // Record<string, FlowModel>

// =========================
// Helpers
// =========================
function nowISO() {
  return new Date().toISOString()
}

function ensureStore<T>(key: string, def: T): T {
  const v = readJSON<T | undefined>(key, def as any)
  if (v === undefined) {
    writeJSON(key, def)
    return def
  }
  return v
}

function upsertRecord<T extends object>(key: string, id: string, value: T) {
  const store = readJSON<Record<string, T>>(key, {}) ?? {}
  store[id] = value
  writeJSON(key, store)
  return value
}

function removeRecord<T>(key: string, id: string) {
  const store = readJSON<Record<string, T>>(key, {}) ?? {}
  delete store[id]
  writeJSON(key, store)
}

function getRecord<T>(key: string, id: string): T | null {
  const store = readJSON<Record<string, T>>(key, {}) ?? {}
  return store[id] ?? null
}

function getAllRecords<T>(key: string): Record<string, T> {
  return readJSON<Record<string, T>>(key, {}) ?? {}
}

// =========================
export function getSession(): UserSession | null {
  const s = readJSON<UserSession | null | undefined>(LS_SESSION, null as any)
  return s ?? null
}

export function setSession(s: UserSession | null) {
  if (!s) localStorage.removeItem(LS_SESSION)
  else writeJSON(LS_SESSION, s)
}

// Compat: tipo User “leve” para o AuthProvider
export type User = {
  id: string
  email: string
  plan: UserSession['plan']
  name?: string
  phone?: string
}

/**
 * Cria sessão de teste (trial).
 */
export async function createTrialSession(
  argsOrName: { name: string; email: string; password?: string; phone?: string } | string,
  emailMaybe?: string,
  _passwordMaybe?: string,
  phoneMaybe?: string
): Promise<ApiResult<UserSession>> {
  let name: string
  let email: string
  let phone: string | undefined

  if (typeof argsOrName === 'string') {
    name = argsOrName || 'Usuário'
    email = emailMaybe || `${(crypto as any).randomUUID?.() ?? Date.now()}@example.test`
    phone = phoneMaybe
  } else {
    ({ name, email, phone } = argsOrName)
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
  const session: UserSession = {
    userId: 'usr_' + uid(),
    email,
    plan: 'trial',
    trialEndsAt,
  }
  writeJSON(LS_SESSION, session)

  const profile = { id: session.userId, email: session.email, plan: session.plan, name, phone }
  writeJSON('mock_profile', profile)

  return { ok: true, data: session }
}

export async function loginWithEmail(
  email: string,
  _password: string
): Promise<ApiResult<UserSession>> {
  const existing = getSession()
  if (!existing) {
    const r = await createTrialSession({ name: email.split('@')[0] || 'Usuário', email })
    return r
  }
  let session: UserSession = existing
  if (session.email !== email) {
    session = { ...session, email }
    writeJSON(LS_SESSION, session)
  }
  return { ok: true, data: session }
}

export async function getMe(_token: string) {
  const s = getSession()
  if (!s) return null
  const profile = readJSON<any>('mock_profile', null as any)
  return profile ?? { id: s.userId, email: s.email, plan: s.plan }
}

// =========================
// WhatsApp status (mock)
// =========================
export type WhatsappStatus = 'disconnected' | 'connecting' | 'qr' | 'connected'

export async function getWhatsappStatus(): Promise<{ ok: true; data: { status: WhatsappStatus } }> {
  const statuses: WhatsappStatus[] = ['disconnected', 'connecting', 'qr', 'connected']
  const idx = Math.min(Math.floor((Date.now() / 5000) % statuses.length), statuses.length - 1)
  return { ok: true, data: { status: statuses[idx] } }
}

// =========================
// Bots (IA) — CRUD simples
// =========================
function readBots(): Bot[] {
  return ensureStore<Bot[]>(LS_BOTS, [])
}
function writeBots(arr: Bot[]) {
  writeJSON(LS_BOTS, arr)
}

export async function listBots(): Promise<{ ok: true; data: Bot[] }> {
  return { ok: true, data: readBots() }
}

export async function createBot(name: string): Promise<{ ok: true; data: Bot }> {
  const all = readBots()
  const b: Bot = { id: 'bot_' + uid(), name, status: 'active', createdAt: nowISO() }
  all.unshift(b)
  writeBots(all)
  return { ok: true, data: b }
}

export async function toggleBot(id: string): Promise<{ ok: true }> {
  const all = readBots()
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    all[i] = { ...all[i], status: all[i].status === 'active' ? 'paused' : 'active' }
    writeBots(all)
  }
  return { ok: true }
}

export async function deleteBot(id: string): Promise<{ ok: true }> {
  const all = readBots().filter((x) => x.id !== id)
  writeBots(all)
  return { ok: true }
}

// =========================
// Broadcasts
// =========================
function readBroadcasts(): Broadcast[] {
  return ensureStore<Broadcast[]>(LS_BROADCASTS, [])
}
function writeBroadcasts(arr: Broadcast[]) {
  writeJSON(LS_BROADCASTS, arr)
}

export async function listBroadcasts(): Promise<Broadcast[]> {
  return readBroadcasts()
}

export async function createBroadcast(name: string, whenISO?: string): Promise<void> {
  const arr = readBroadcasts()
  const item: Broadcast = {
    id: 'brd_' + uid(),
    name,
    createdAt: nowISO(),
    totalRecipients: 0,
    status: whenISO ? 'scheduled' : 'draft',
    scheduledAt: whenISO,
  }
  arr.unshift(item)
  writeBroadcasts(arr)
}

export async function scheduleBroadcast(id: string, whenISO: string): Promise<void> {
  const arr = readBroadcasts()
  const i = arr.findIndex((x) => x.id === id)
  if (i >= 0) {
    arr[i] = { ...arr[i], status: 'scheduled', scheduledAt: whenISO }
    writeBroadcasts(arr)
  }
}

// =========================
// Flows / Funis (modelo)
// =========================
export function listFlows(): Array<{ id: string; name: string; nodesCount: number; edgesCount: number; updatedAt: string }> {
  const models = getAllRecords<FlowModel>(LS_FLOW_MODELS)
  const list = Object.values(models).map((m) => ({
    id: m.id,
    name: m.name ?? 'Funil sem nome',
    nodesCount: m.nodes.length,
    edgesCount: m.edges.length,
    updatedAt: m.updatedAt,
  }))
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function createFlow(name = 'Novo funil'): { id: string } {
  const id = 'flow_' + uid()
  const model: FlowModel = {
    id,
    name,
    nodes: [],
    edges: [],
    updatedAt: nowISO(),
    createdAt: nowISO(),
  }
  upsertRecord<FlowModel>(LS_FLOW_MODELS, id, model)
  return { id }
}

export function renameFlow(id: string, name: string): void {
  const m = getRecord<FlowModel>(LS_FLOW_MODELS, id)
  if (!m) return
  m.name = name
  m.updatedAt = nowISO()
  upsertRecord(LS_FLOW_MODELS, id, m)
}

export function deleteFlow(id: string): void {
  removeRecord<FlowModel>(LS_FLOW_MODELS, id)
}

export function duplicateFlow(id: string): { id: string } | null {
  const m = getRecord<FlowModel>(LS_FLOW_MODELS, id)
  if (!m) return null
  const newId = 'flow_' + uid()
  const clone: FlowModel = {
    ...m,
    id: newId,
    name: `${m.name ?? 'Funil'} (cópia)`,
    updatedAt: nowISO(),
    createdAt: nowISO(),
  }
  upsertRecord<FlowModel>(LS_FLOW_MODELS, newId, clone)
  return { id: newId }
}

export function loadFlowModel(id: string): FlowModel {
  const m = getRecord<FlowModel>(LS_FLOW_MODELS, id)
  if (m) return m
  const created: FlowModel = {
    id,
    name: 'Funil',
    nodes: [],
    edges: [],
    updatedAt: nowISO(),
    createdAt: nowISO(),
  }
  upsertRecord<FlowModel>(LS_FLOW_MODELS, id, created)
  return created
}

export function saveFlowModel(model: FlowModel): void {
  model.updatedAt = nowISO()
  upsertRecord<FlowModel>(LS_FLOW_MODELS, model.id, model)
}

// ===== Canvas helpers (modelo) =====
export function addNode(model: FlowModel, kind: NodeKind, x: number, y: number): FlowNode {
  const id = 'n_' + uid()
  const data: FlowNode['data'] =
    kind === 'message'
      ? { label: 'Mensagem', text: 'Texto da mensagem...' }
      : kind === 'choice'
      ? { label: 'Escolha', options: ['Opção 1', 'Opção 2'] }
      : { label: 'Início' }

  const node: FlowNode = { id, kind, x, y, data }
  model.nodes.push(node)
  model.updatedAt = nowISO()
  return node
}

export function updateNode(model: FlowModel, nodeId: string, patch: Partial<FlowNode>) {
  const i = model.nodes.findIndex((n) => n.id === nodeId)
  if (i < 0) return
  model.nodes[i] = { ...model.nodes[i], ...patch, data: { ...model.nodes[i].data, ...(patch.data ?? {}) } }
  model.updatedAt = nowISO()
}

export function removeNode(model: FlowModel, nodeId: string) {
  model.nodes = model.nodes.filter((n) => n.id !== nodeId)
  model.edges = model.edges.filter((e) => e.from !== nodeId && e.to !== nodeId)
  model.updatedAt = nowISO()
}

export function addEdge(model: FlowModel, fromId: string, toId: string) {
  const exists = model.edges.some((e) => e.from === fromId && e.to === toId)
  if (exists) return
  const edge: FlowEdge = { id: 'e_' + uid(), from: fromId, to: toId }
  model.edges.push(edge)
  model.updatedAt = nowISO()
}

export function removeEdge(model: FlowModel, edgeId: string) {
  model.edges = model.edges.filter((e) => e.id !== edgeId)
  model.updatedAt = nowISO()
}

export function updateEdgeLabel(model: FlowModel, edgeId: string, label: string) {
  const i = model.edges.findIndex((e) => e.id === edgeId)
  if (i < 0) return
  model.edges[i] = { ...model.edges[i], label }
  model.updatedAt = nowISO()
}

// =========================
// Dashboard snapshot
// =========================
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const bots = readBots().length
  const contacts = ensureStore<any[]>(LS_CONTACTS, []).length
  const messages = Object.values(getAllRecords<FlowModel>(LS_FLOW_MODELS)).reduce((acc, m) => {
    return acc + (m.nodes?.filter((n) => n.kind === 'message').length ?? 0)
  }, 0)

  const successRate = bots > 0 || messages > 0 ? 92 : 0

  return {
    totals: {
      automations: bots,
      successRate,
      contacts,
      messages,
    },
  }
}

// =========================
// Atividade recente (mock)
// =========================
export async function listRecentActivity(): Promise<Activity[]> {
  const acts: Activity[] = []

  const flows = getAllRecords<FlowModel>(LS_FLOW_MODELS)
  Object.values(flows)
    .slice(0, 3)
    .forEach((m) => {
      acts.push({
        id: 'act_' + uid(),
        type: 'flow_published' as ActivityType,
        ts: nowISO(),
        title: `Fluxo atualizado: ${m.name || m.id}`,
        description: `${m.nodes.length} nós, ${m.edges.length} arestas.`,
        status: 'ok',
      })
    })

  readBroadcasts()
    .slice(0, 2)
    .forEach((b) => {
      acts.push({
        id: 'act_' + uid(),
        type: 'broadcast',
        ts: nowISO(),
        title: `Campanha: ${b.name}`,
        description: b.status === 'scheduled' ? 'Agendada' : 'Rascunho',
        status: b.status === 'failed' ? 'error' : 'ok',
      })
    })

  readBots()
    .slice(0, 2)
    .forEach((b) => {
      acts.push({
        id: 'act_' + uid(),
        type: 'bot_run',
        ts: nowISO(),
        title: `Bot ${b.name} processou mensagens`,
        description: 'Simulação local',
        status: 'ok',
      })
    })

  acts.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  return acts
}
