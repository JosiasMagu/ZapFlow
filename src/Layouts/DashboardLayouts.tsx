import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import TrialBanner from '../Pages/Dashboard/Components/TrialBanner'
import { UpgradeProvider } from '../Pages/Context/UpgradeContext'
import UpgradeModal from '../components/UpgradeModal'
import { MessageSquare } from 'lucide-react'

export default function DashboardLayouts() {
  return (
    <UpgradeProvider>
      <div className="min-h-screen bg-black text-white flex">

        {/* Sidebar */}
        <aside className="w-64 border-r border-green-500/20 bg-gray-950 hidden md:flex md:flex-col">
          <div className="h-14 px-4 border-b border-green-500/20 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-green-500 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-black" />
            </div>
            <div className="font-bold">ZapFlow</div>
          </div>

          <nav className="p-3 space-y-1 text-sm">
            <Item to="/dashboard" end>Início</Item>
            <Item to="/dashboard/bots">Bots (IA)</Item>
            <Item to="/dashboard/flows">Fluxos (No-code)</Item>
            <Item to="/dashboard/broadcasts">Campanhas</Item>
            <Item to="/dashboard/contacts">Contactos</Item>
            <Item to="/dashboard/settings">Definições</Item>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Topbar simples */}
          <header className="h-14 border-b border-green-500/20 bg-gray-950/60 backdrop-blur flex items-center px-4">
            <div className="md:hidden font-semibold">Menu</div>
            <div className="ml-auto text-sm text-gray-400">
              Painel de controlo
            </div>
          </header>

          {/* Conteúdo */}
          <main className="p-4 md:p-6">
            <TrialBanner />
            <Outlet />
          </main>
        </div>
      </div>

      {/* Modal de Upgrade global */}
      <UpgradeModal />
    </UpgradeProvider>
  )
}

function Item({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 hover:bg-green-500/10 ${
          isActive ? 'bg-green-500/10 text-green-300' : 'text-gray-300'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
