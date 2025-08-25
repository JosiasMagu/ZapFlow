// src/lib/api.ts
import type { UserSession, Bot, ApiResult } from './types'

// Chaves de armazenamento
const LS = {
  session: 'zf_session',
  bots: 'zf_bots',
}

// Util simples (sem dependências)
function newId() {
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
function sleep(ms = 350) {
  return new Promise((res) => setTimeout(res, ms))
}
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

// --------- SESSÃO (MOCK) ----------
export function getSession(): UserSession | null {
  return read<UserSession | null>(LS.session, null)
}

export function setSession(session: UserSession | null) {
  if (!session) {
    localStorage.removeItem(LS.session)
    return
  }
  write(LS.session, session)
}

// Login fake (aceita qualquer email/senha válidos)
export async function loginWithEmail(email: string, _password: string): Promise<UserSession> {
  await sleep(400)
  // Se não existir sessão, cria trial 14 dias
  let session = getSession()
  if (!session) {
    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 14)
    session = {
      userId: newId(),
      email,
      plan: 'trial',
      trialEndsAt: trialEnds.toISOString(),
    }
    setSession(session)
  } else {
    // atualiza email apenas para refletir o último login
    session.email = email
    setSession(session)
  }
  return session
}

export function logout() {
  setSession(null)
}

// --------- BOTS (MOCK CRUD) ----------
function seedBots() {
  const seeded = read<Bot[]>(LS.bots, [])
  if (seeded.length === 0) {
    const now = new Date().toISOString()
    const demo: Bot[] = [
      { id: newId(), name: 'Atendimento WhatsApp', status: 'active', createdAt: now },
    ]
    write(LS.bots, demo)
    return demo
  }
  return seeded
}

export async function listBots(): Promise<ApiResult<Bot[]>> {
  await sleep()
  const bots = seedBots()
  return { ok: true, data: bots }
}

export async function createBot(name: string): Promise<ApiResult<Bot>> {
  await sleep()
  const bots = seedBots()
  const bot: Bot = {
    id: newId(),
    name: name.trim() || 'Novo Bot',
    status: 'paused',
    createdAt: new Date().toISOString(),
  }
  const updated = [bot, ...bots]
  write(LS.bots, updated)
  return { ok: true, data: bot }
}

export async function toggleBot(id: string): Promise<ApiResult<Bot | null>> {
  await sleep(250)
  const bots = seedBots()
  const idx = bots.findIndex((b) => b.id === id)
  if (idx === -1) return { ok: false, error: 'Bot não encontrado' }
  const b = bots[idx]
  const updated: Bot = { ...b, status: b.status === 'active' ? 'paused' : 'active' }
  bots[idx] = updated
  write(LS.bots, bots)
  return { ok: true, data: updated }
}

export async function deleteBot(id: string): Promise<ApiResult<boolean>> {
  await sleep(250)
  const bots = seedBots()
  const next = bots.filter((b) => b.id !== id)
  write(LS.bots, next)
  return { ok: true, data: true }
}
