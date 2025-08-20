import { NavLink, Outlet } from 'react-router-dom'
import TrialBanner from '../Pages/Dashboard/Components/TrialBanner'
import { Bot, Send, Users, LayoutDashboard, Sparkles } from 'lucide-react'

const linkBase = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition'
const linkAct = 'bg-green-500/20 text-green-300 border border-green-500/30'
const linkInact = 'text-gray-300 hover:text-green-300 hover:bg-green-500/10'

export default function DashboardLayouts() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-green-500/20 min-h-screen p-4">
          <div className="text-lg font-bold mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-green-400" />
            Dashboard
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `${linkBase} ${isActive ? linkAct : linkInact}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Início
            </NavLink>

            <NavLink
              to="/dashboard/flows"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAct : linkInact}`}
            >
              <Bot className="h-4 w-4" /> Flows
            </NavLink>

            <NavLink
              to="/dashboard/broadcasts"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAct : linkInact}`}
            >
              <Send className="h-4 w-4" /> Broadcasts
            </NavLink>

            <NavLink
              to="/dashboard/contacts"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAct : linkInact}`}
            >
              <Users className="h-4 w-4" /> Contacts
            </NavLink>

            <NavLink
              to="/dashboard/templates"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAct : linkInact}`}
            >
              <Sparkles className="h-4 w-4" /> Templates
            </NavLink>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="bg-gray-900 border-b border-green-500/20 p-4">
            {/* Topbar simples ou filtros no futuro */}
            <div className="text-sm text-gray-400">ZapFlow • Painel</div>
          </header>

          <div className="p-4 md:p-6">
            <TrialBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
