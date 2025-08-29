// src/lib/usage.ts

export type FeatureName = 'contacts' | 'broadcast' | 'flows' | 'templates';

export interface FeatureUsage {
  feature: FeatureName;
  used: number;
  limit: number;
}

/**
 * Limites padrão para o plano grátis (podes ajustar/conectar ao backend depois).
 * Mantém 20 contatos como usado no BroadcastsPage.
 */
const FREE_LIMITS: Record<FeatureName, number> = {
  contacts: 20,
  broadcast: 10,   // exemplo (não usado diretamente no teu código atual)
  flows: 3,        // exemplo
  templates: 5,    // exemplo
};

/**
 * (Opcional) armazenamento local de "used" para permitir simulação no front
 * enquanto o backend não retorna métricas reais.
 */
const USED_KEYS: Record<FeatureName, string> = {
  contacts: 'usage.contacts.used',
  broadcast: 'usage.broadcast.used',
  flows: 'usage.flows.used',
  templates: 'usage.templates.used',
};

function readUsed(feature: FeatureName): number {
  try {
    const raw = localStorage.getItem(USED_KEYS[feature]);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeUsed(feature: FeatureName, value: number) {
  try {
    localStorage.setItem(USED_KEYS[feature], String(Math.max(0, Math.floor(value))));
  } catch {
    /* ignore */
  }
}

/**
 * Retorna { used, limit } para a feature.
 * No futuro, podes alterar para buscar do backend (e.g., /me/usage).
 */
export function featureUsage(feature: FeatureName): FeatureUsage {
  const limit = FREE_LIMITS[feature] ?? 0;
  const used = readUsed(feature);
  return { feature, used, limit };
}

/**
 * Helper para verificar se está perto do limite (>= 80% por padrão).
 */
export function nearLimit(used: number, limit: number, threshold = 0.8): boolean {
  if (limit <= 0) return false; // evita divisão por zero e 'alertas' indevidos
  return used / limit >= threshold && used < limit;
}

/**
 * Helper para verificar se atingiu o limite.
 */
export function atLimit(used: number, limit: number): boolean {
  return limit > 0 && used >= limit;
}

/**
 * Exibe um “nudge” (aviso/upgrade) apenas uma vez por chave.
 * Retorna true na primeira chamada para a mesma chave nesta máquina/navegador.
 */
export function shouldNudgeOnce(key: string): boolean {
  const k = `nudge.${key}`;
  try {
    if (localStorage.getItem(k) === '1') return false;
    localStorage.setItem(k, '1');
    return true;
  } catch {
    // Se localStorage falhar, deixa passar o nudge
    return true;
  }
}

/**
 * (Opcional) incrementa/decrementa o 'used' localmente — útil
 * para simulações no front sem backend.
 */
export function bumpUsage(feature: FeatureName, delta: number) {
  const cur = readUsed(feature);
  writeUsed(feature, Math.max(0, cur + delta));
}

/**
 * (Opcional) define explicitamente o 'used' — útil para sincronizar
 * quando o backend começar a retornar métricas reais.
 */
export function setUsage(feature: FeatureName, used: number) {
  writeUsed(feature, used);
}
