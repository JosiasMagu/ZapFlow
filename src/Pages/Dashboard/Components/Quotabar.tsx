// FILE: src/components/QuotaBar.tsx
// Barrinha de progresso para o Dashboard

export default function QuotaBar({
  label, used, limit, hint,
}: { label: string; used: number; limit: number; hint?: string }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100))
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="rounded-xl border border-green-500/20 bg-gray-950 p-3">
      <div className="flex justify-between text-sm">
        <div className="text-gray-200">{label}</div>
        <div className="text-gray-400">{used}/{limit}</div>
      </div>
      <div className="mt-2 h-2 w-full rounded bg-gray-800">
        <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {hint && <div className="mt-1 text-[11px] text-gray-400">{hint}</div>}
    </div>
  )
}
