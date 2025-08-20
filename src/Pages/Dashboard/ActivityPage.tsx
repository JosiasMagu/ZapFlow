// src/Pages/Dashboard/ActivityPage.tsx
import  { useEffect, useState } from 'react'
import { listRecentActivity } from '../../lib/api'
import type { Activity } from '../../lib/types'
import { Bot, Send, Upload, Sparkles, Clock } from 'lucide-react'

export default function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      setItems(await listRecentActivity())
      setLoading(false)
    })()
  }, [])

  const iconMap = {
    bot_run: <Bot className="h-4 w-4" />,
    broadcast: <Send className="h-4 w-4" />,
    contact_import: <Upload className="h-4 w-4" />,
    flow_published: <Sparkles className="h-4 w-4" />,
  } as const

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Atividade — Tudo</h1>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-green-500/20 bg-gray-950 animate-pulse" />
        ))
      ) : (
        items.map((a) => (
          <div key={a.id} className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-400">{iconMap[a.type]}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-gray-400">{a.description}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(a.ts).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
