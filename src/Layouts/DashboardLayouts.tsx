// FILE: src/Layouts/DashboardLayouts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Zap,
  Filter,
  Send,
  Users,
  GraduationCap,
  Megaphone,
  Gift,
  MessageCircle,
  Puzzle,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  X,
  // 👇 novos ícones para o toggle
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { getWhatsappStatus } from "../lib/api";

// Se preferir centralizar tipos, podes mover para src/lib/types.ts
export type WhatsAppStatus = "connected" | "connecting" | "qr" | "disconnected";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  to: string;
  enabled: boolean;
  tooltip?: string;
  key: string;
}

const DashboardLayouts: React.FC = () => {
  const navigate = useNavigate();

  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>("connected");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 👉 NOVO: estado da sidebar (aberta/fechada)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Polling do status WhatsApp a cada 5s
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await getWhatsappStatus();
        if (!alive) return;
        setWhatsappStatus(r.data.status as WhatsAppStatus);
      } catch {
        if (!alive) return;
        setWhatsappStatus("disconnected");
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const statusConfig = useMemo(() => {
    switch (whatsappStatus) {
      case "connected":
        return { dot: "bg-green-500", text: "Conectado", textColor: "text-green-400" };
      case "connecting":
        return { dot: "bg-yellow-500", text: "Conectando…", textColor: "text-yellow-400" };
      case "qr":
        return { dot: "bg-yellow-500", text: "Aguardando QR", textColor: "text-yellow-400" };
      case "disconnected":
      default:
        return { dot: "bg-red-500", text: "Desconectado", textColor: "text-red-400" };
    }
  }, [whatsappStatus]);

  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: "Métricas",   to: "/dashboard",         enabled: true,  key: "metricas"   },
    { icon: Zap,       label: "Conexão",    to: "/dashboard/conexao", enabled: true,  key: "conexao"    },
    { icon: Filter,    label: "Funis",      to: "/dashboard/funis",   enabled: true,  key: "funis"      },
    { icon: Send,      label: "Disparos",   to: "/dashboard/disparos",enabled: true,  key: "disparos"   },
    { icon: Users,     label: "Contatos",   to: "/dashboard/contatos",enabled: true,  key: "contatos"   },
    { icon: GraduationCap, label: "Treinamento", to: "#", enabled: false, tooltip: "Faça upgrade", key: "treinamento" },
    { icon: Megaphone, label: "Campanhas",  to: "#", enabled: false, tooltip: "Faça upgrade", key: "campanhas" },
    { icon: Gift,      label: "Indique e ganhe", to: "#", enabled: false, tooltip: "Faça upgrade", key: "indique" },
    { icon: MessageCircle, label: "Livechat", to: "#", enabled: false, tooltip: "Faça upgrade", key: "livechat" },
    { icon: Puzzle,    label: "Extensão",   to: "#", enabled: false, tooltip: "Faça upgrade", key: "extensao" },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={[
          "bg-gray-800 flex flex-col border-r border-gray-700 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        {/* Topo da sidebar (logo/brand + toggle quando colapsada) */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            {/* Oculta o texto quando colapsada */}
            {!sidebarCollapsed && <h2 className="text-xl font-bold text-white">ZapFlow</h2>}
          </div>

          {/* Botão de colapsar/expandir dentro da própria sidebar (opcional)
          <button
            onClick={() => setSidebarCollapsed((s) => !s)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button> */}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (!item.enabled) {
              const tooltipId = `tt-${item.key}`;
              return (
                <div
                  key={item.key}
                  className="relative mb-1"
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    className={[
                      "w-full flex items-center px-2 py-2.5 rounded-lg text-left text-gray-600 cursor-not-allowed opacity-50 border border-transparent",
                      sidebarCollapsed ? "justify-center" : "space-x-3",
                    ].join(" ")}
                    aria-describedby={hoveredItem === item.key ? tooltipId : undefined}
                    title={sidebarCollapsed ? (item.tooltip || item.label) : undefined}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>

                  {/* Tooltip somente quando expandida e item desabilitado, para manter acessível */}
                  {!sidebarCollapsed && hoveredItem === item.key && item.tooltip && (
                    <div
                      role="tooltip"
                      id={tooltipId}
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
                    >
                      <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-gray-600">
                        {item.tooltip}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                end={item.to === "/dashboard"}
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "w-full flex items-center px-2 py-2.5 rounded-lg text-left transition-all duration-200 mb-1",
                    sidebarCollapsed ? "justify-center" : "space-x-3",
                    isActive
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  ].join(" ")
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {!sidebarCollapsed && <span className="font-medium truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={[
              "w-full flex items-center px-2 py-2.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200",
              sidebarCollapsed ? "justify-center" : "space-x-3",
            ].join(" ")}
            title={sidebarCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              {/* 👇 Botão global para abrir/fechar a sidebar */}
              <button
                onClick={() => setSidebarCollapsed((s) => !s)}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>

              <div className="hidden sm:flex items-center space-x-3">
                <img
                  src="/src/assets/logo.jpeg"
                  alt="ZapFlow"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-white font-semibold">ZapFlow</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig.dot} animate-pulse`} />
                <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                  WhatsApp: {statusConfig.text}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown((s) => !s)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-white text-sm font-medium">Conta: Principal</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white">
                        Conta: Principal
                      </button>
                      <div className="border-t border-gray-600" />
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                        aria-disabled="true"
                        tabIndex={-1}
                      >
                        Adicionar conta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-900">
          <Outlet />
        </main>
      </section>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Confirmar Logout</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-6">Tem certeza que deseja sair da sua conta?</p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAccountDropdown(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayouts;
