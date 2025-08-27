// FILE: src/Layouts/DashboardLayouts.tsx
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BarChart3, Cable, GitBranch, Send, Users, GraduationCap,
  Megaphone, Gift, MessageCircle, Puzzle, LogOut
} from 'lucide-react'
import { getWhatsappStatus, type WhatsappStatus } from '@/lib/api'
import type { ApiResult } from '@/lib/types'

const nav = [
  { to: '/dashboard', label: 'Métricas', icon: BarChart3 },
  { to: '/dashboard/connection', label: 'Conexão', icon: Cable },            // (rota opcional)
  { to: '/dashboard/flows', label: 'Funis', icon: GitBranch },
  { to: '/dashboard/broadcasts', label: 'Disparos', icon: Send, beta: true },
  { to: '/dashboard/contacts', label: 'Contatos', icon: Users },
  { to: '/dashboard/training', label: 'Treinamento', icon: GraduationCap },   // (rota opcional)
  { to: '/dashboard/campaigns', label: 'Campanhas', icon: Megaphone },        // (rota opcional)
  { to: '/dashboard/refer', label: 'Indique e ganhe', icon: Gift },           // (rota opcional)
  { to: '/dashboard/livechat', label: 'Bate-papo ao vivo', icon: MessageCircle }, // (rota opcional)
  { to: '/dashboard/extension', label: 'Extensão', icon: Puzzle },            // (rota opcional)
]

export default function DashboardLayout() {
  const [wpp, setWpp] = useState<WhatsappStatus>('disconnected')

  useEffect(() => {
    // Carrega uma vez; se quiser, transforme em polling com setInterval
    getWhatsappStatus().then((r: ApiResult<{ status: WhatsappStatus }>) => {
      if (r.ok && r.data) setWpp(r.data.status)
    })
  }, [])

  const statusColor =
    wpp === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : wpp === 'qr' || wpp === 'connecting' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
    : 'bg-red-500/10 text-red-300 border-red-500/30'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Topbar */}
      <header className="h-14 border-b border-green-500/20 bg-gray-950/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-semibold tracking-tight">ZapFlow</Link>
            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor}`}>
              {wpp === 'connected' ? 'conectado' : wpp}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            Conta: <span className="inline-block rounded-md border border-green-500/30 px-2 py-0.5 bg-black/50">Principal</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-green-500/20 bg-gray-950/40">
          <nav className="p-2">
            {nav.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-lg px-3 py-2 text-sm
                     ${isActive ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
                                : 'text-gray-300 hover:bg-green-500/10 border border-transparent'}`
                  }
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-green-400" />
                    {item.label}
                  </span>
                  {item.beta && (
                    <span className="text-[10px] rounded-full border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-yellow-300">
                      Beta
                    </span>
                  )}
                </NavLink>
              )
            })}
            <div className="h-px my-2 bg-green-500/20" />
            <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-red-500/10">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* Botão de ajuda (WhatsApp) */}
      <a
        href="#"
        className="fixed right-4 bottom-4 rounded-full bg-emerald-500 text-black font-semibold px-4 py-2 shadow-lg hover:bg-emerald-400"
      >
        Precisa de ajuda?
      </a>
    </div>
  )
}
