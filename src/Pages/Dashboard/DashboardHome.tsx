import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Plus,
  ArrowRight,
  BarChart3,
  Bot,
  Send,
  Import,
  Layout,
  Crown,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity as ActivityIcon,
  Lightbulb,
  Star,
  Rocket
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Componentes reutilizáveis na tua estrutura:
import TrialBanner from "./Components/TrialBanner";
import QuotaBar from "./Components/Quotabar";
import UpgradeModal from "../../components/UpgradeModal";

type ChangeType = "positive" | "negative" | "neutral";
type ActivityType = "automation" | "message" | "contact" | "campaign";
type ActivityStatus = "success" | "warning" | "error" | "info";

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changeType: ChangeType;
  icon: React.ElementType;
  color: string; // tailwind text-*
}

interface QuotaItem {
  name: string;
  used: number;
  limit: number;
  color: string; // tailwind bg-*
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  status: ActivityStatus;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // tailwind gradient
  route: string;
  locked?: boolean;
}

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const trialDays = 14;
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  // Dados de exemplo (últimos 15 dias)
  const chartData = useMemo(
    () => [
      { day: "15", sent: 120, received: 95 },
      { day: "14", sent: 145, received: 110 },
      { day: "13", sent: 98, received: 87 },
      { day: "12", sent: 167, received: 123 },
      { day: "11", sent: 134, received: 98 },
      { day: "10", sent: 189, received: 145 },
      { day: "9", sent: 156, received: 134 },
      { day: "8", sent: 178, received: 156 },
      { day: "7", sent: 203, received: 167 },
      { day: "6", sent: 198, received: 178 },
      { day: "5", sent: 234, received: 189 },
      { day: "4", sent: 267, received: 203 },
      { day: "3", sent: 289, received: 234 },
      { day: "2", sent: 312, received: 267 },
      { day: "1", sent: 345, received: 298 }
    ],
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const metrics: MetricCard[] = [
    {
      title: "Automações",
      value: 247,
      change: "+12% vs mês anterior",
      changeType: "positive",
      icon: Zap,
      color: "text-blue-400"
    },
    {
      title: "Taxa de Sucesso",
      value: "94.2%",
      change: "+2.1% vs mês anterior",
      changeType: "positive",
      icon: BarChart3,
      color: "text-green-400"
    },
    {
      title: "Contatos Ativos",
      value: "1,834",
      change: "+8% vs mês anterior",
      changeType: "positive",
      icon: Users,
      color: "text-purple-400"
    },
    {
      title: "Mensagens (30d)",
      value: "12,547",
      change: "+15% vs mês anterior",
      changeType: "positive",
      icon: MessageSquare,
      color: "text-orange-400"
    }
  ];

  const quotaUsage: QuotaItem[] = [
    { name: "Funis", used: 1, limit: 1, color: "bg-blue-500" },
    { name: "Nós de Mensagem", used: 7, limit: 10, color: "bg-green-500" },
    { name: "Contatos", used: 15, limit: 20, color: "bg-purple-500" },
    { name: "Disparos", used: 3, limit: 10, color: "bg-orange-500" }
  ];

  const quickActions: QuickAction[] = [
    {
      title: "Criar Fluxo com Bot",
      description: "Configure automações inteligentes",
      icon: Bot,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      route: "/dashboard/funis"
    },
    {
      title: "Campanha Manual",
      description: "Envie mensagens em massa",
      icon: Send,
      color: "bg-gradient-to-r from-green-600 to-green-700",
      route: "/dashboard/disparos"
    },
    {
      title: "Importar Contatos",
      description: "Adicione sua base de clientes",
      icon: Import,
      color: "bg-gradient-to-r from-purple-600 to-purple-700",
      route: "/dashboard/contatos"
    },
    {
      title: "Modelos Prontos",
      description: "Templates pré-configurados",
      icon: Layout,
      color: "bg-gradient-to-r from-orange-600 to-orange-700",
      route: "/dashboard/templates",
      locked: true
    }
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "automation",
      title: 'Automação "Boas-vindas" executada',
      description: "Para 15 novos contatos",
      timestamp: new Date(Date.now() - 300000),
      status: "success"
    },
    {
      id: "2",
      type: "campaign",
      title: 'Campanha "Promoção Black Friday" enviada',
      description: "Para 847 contatos",
      timestamp: new Date(Date.now() - 900000),
      status: "success"
    },
    {
      id: "3",
      type: "contact",
      title: "12 novos contatos adicionados",
      description: "Via integração do site",
      timestamp: new Date(Date.now() - 1800000),
      status: "info"
    },
    {
      id: "4",
      type: "message",
      title: "Falha no envio de mensagem",
      description: "Contato +55 11 99999-9999",
      timestamp: new Date(Date.now() - 3600000),
      status: "error"
    }
  ];

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "automation":
        return Zap;
      case "message":
        return MessageSquare;
      case "contact":
        return Users;
      case "campaign":
        return Send;
      default:
        return ActivityIcon;
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "error":
        return XCircle;
      case "info":
        return ActivityIcon;
      default:
        return Clock;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  // Skeleton (loading)
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-green-500 rounded w-64 mb-4" />
            <div className="h-10 bg-green-500 rounded w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-700 rounded w-24" />
                  <div className="h-8 w-8 bg-gray-700 rounded-lg" />
                </div>
                <div className="h-8 bg-gray-700 rounded w-20 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho de boas-vindas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo ao ZapFlow! 👋
            </h1>
            <p className="text-gray-400">
              Aqui está um resumo da sua performance e próximos passos
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Plano Trial</span>
          </div>
        </div>

        {/* Banner de Trial (componente) */}
        <TrialBanner
          daysLeft={trialDays}
          onUpgradeClick={() => setShowUpgrade(true)}
          ctaIcon={<Rocket className="w-4 h-4" />}
        />

        {/* Cards de Métrica */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-300 font-medium">{metric.title}</h3>
                  <div className={`p-2 rounded-lg bg-gray-700 ${metric.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <p className="text-xs text-green-400">{metric.change}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Uso & Ações rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Uso do Plano */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Uso do Plano</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {quotaUsage.map((item, i) => (
                <QuotaBar key={i} name={item.name} used={item.used} limit={item.limit} colorClass={item.color} />
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 <strong>Dica:</strong> Faça upgrade para limites maiores e recursos avançados
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Ações Rápidas</h3>
              <Plus className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                const locked = !!action.locked;

                const onClick = () => {
                  if (locked) {
                    setShowUpgrade(true);
                    return;
                  }
                  navigate(action.route);
                };

                return (
                  <div key={idx} className="relative group">
                    <button
                      onClick={onClick}
                      disabled={locked}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                        locked
                          ? "bg-gray-700 opacity-50 cursor-not-allowed"
                          : `${action.color} hover:shadow-lg`
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className="w-5 h-5 text-white" />
                        {locked && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <h4 className="font-semibold text-white text-sm mb-1">{action.title}</h4>
                      <p className="text-xs text-white/80">{action.description}</p>
                    </button>

                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 border border-gray-600 rounded-lg p-2">
                          <p className="text-xs text-yellow-400 font-medium">
                            Plano grátis — Faça upgrade
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Mensagens por Dia</h3>
              <p className="text-gray-400 text-sm">Últimos 30 dias</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-400">Enviadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-400">Recebidas</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB"
                  }}
                />
                <Area type="monotone" dataKey="received" stroke="#3B82F6" strokeWidth={2} fill="url(#receivedGradient)" />
                <Area type="monotone" dataKey="sent" stroke="#10B981" strokeWidth={2} fill="url(#sentGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividade & Destaques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atividade Recente */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Atividade Recente</h3>
              <button
                className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                onClick={() => navigate("/dashboard/disparos")}
              >
                <span>Ver tudo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="bg-gray-700 rounded-lg p-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          <StatusIcon className={`w-3 h-3 ${getStatusColor(activity.status)}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{activity.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destaques */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500/20 rounded-lg p-2">
                  <Lightbulb className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="font-semibold text-white">💡 Dica de ROI</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Automações bem configuradas podem aumentar suas conversões em até 300%.
              </p>
              <button
                className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                onClick={() => navigate("/dashboard/funis")}
              >
                <span>Saiba mais</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-500/20 rounded-lg p-2">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">⭐ Recomendado</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Experimente o modelo "Qualificação Rápida" para identificar leads quentes.
              </p>
              <button
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1"
                onClick={() => navigate("/dashboard/templates")}
              >
                <span>Usar modelo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade (premium) */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default DashboardHome;
