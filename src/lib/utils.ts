// src/lib/utils.ts

// Dias restantes de um ISO (ex.: data do fim do trial)
export function daysLeft(iso?: string): number {
  if (!iso) return 0
  const end = new Date(iso)
  const now = new Date()
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// (mantenha aqui os outros helpers que você já tinha, se houver)
// ex. cn/formatCurrency/etc.
