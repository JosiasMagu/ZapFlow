// FILE: src/lib/utils.ts
// Helpers de uso geral para o frontend (compatível com named e default import)

// ---------- IDs ----------
export function uid() {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------- LocalStorage JSON ----------
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // no-op
  }
}

// ---------- Datas / Trial ----------
export function daysLeft(iso?: string) {
  if (!iso) return 0
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

// ---------- Default export (opcional) ----------
const utils = { uid, readJSON, writeJSON, daysLeft }
export default utils
