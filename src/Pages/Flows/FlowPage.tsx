import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Filter as FilterIcon,
  Search,
  Sparkles,
  Wand2,
  BarChart3,
  Crown,
  Layers,
  Star,
  ArrowRight,
} from "lucide-react";

import type { Flow, Template } from "../../lib/types";
import FlowCard from "./FlowCard";
import TemplateCard from "./TemplateCard";
import DeleteModal from "./DeleteModal";
import RenameModal from "./RenameModal";
import QuotaBar from "../Dashboard/Components/Quotabar"; // reuso do componente

import {
  TrendingUp,
  MessageSquare,
  GraduationCap,
  ShoppingCart,
  Brain,
  Target,
} from "lucide-react";

const FlowsPage: React.FC = () => {
  const navigate = useNavigate();

  // estados de UI
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameInitial, setRenameInitial] = useState<string>("");

  // mock (poderá vir de api.ts no futuro)
  const templates: Template[] = [
    {
      id: "1",
      name: "Captação de Leads Ultra",
      description: "Template avançado para capturar e qualificar leads com IA",
      category: "marketing",
      nodes: 15,
      difficulty: "intermediate",
      rating: 4.9,
      uses: 2847,
      preview: "Início → Qualificação → Nutrição → Conversão",
      color: "from-green-500 to-emerald-600",
      icon: Target,
      premium: true,
    },
    {
      id: "2",
      name: "Suporte Instantâneo Pro",
      description: "Atendimento 24/7 com respostas automáticas inteligentes",
      category: "suporte",
      nodes: 12,
      difficulty: "beginner",
      rating: 4.8,
      uses: 1923,
      preview: "Saudação → Triagem → Solução → Follow-up",
      color: "from-blue-500 to-cyan-600",
      icon: MessageSquare,
    },
    {
      id: "3",
      name: "Vendas Consultivas Elite",
      description: "Processo completo de vendas B2B com automação premium",
      category: "vendas",
      nodes: 28,
      difficulty: "advanced",
      rating: 4.9,
      uses: 1456,
      preview: "Prospecção → Diagnóstico → Proposta → Fechamento",
      color: "from-purple-500 to-pink-600",
      icon: TrendingUp,
      premium: true,
    },
    {
      id: "4",
      name: "Onboarding Automático",
      description: "Guia novos clientes automaticamente pelo produto",
      category: "atendimento",
      nodes: 10,
      difficulty: "beginner",
      rating: 4.7,
      uses: 987,
      preview: "Boas-vindas → Tutorial → Configuração → Ativação",
      color: "from-orange-500 to-red-600",
      icon: GraduationCap,
    },
  ];

  // carrega os funis (mock)
  useEffect(() => {
    setLoading(true);
    setLoadError(null);

    const mockFlows: Flow[] = [
      {
        id: "1",
        name: "Atendimento VIP Premium",
        description: "Fluxo completo para clientes premium com IA integrada",
        nodes: 24,
        edges: 18,
        lastUpdated: new Date(Date.now() - 300000),
        status: "published",
        performance: { views: 1247, conversions: 892, rate: 71.6 },
        color: "from-green-500 to-emerald-600",
        icon: Crown,
      },
      {
        id: "2",
        name: "Vendas Black Friday Ultra",
        description: "Campanha de vendas com automação avançada",
        nodes: 18,
        edges: 15,
        lastUpdated: new Date(Date.now() - 1800000),
        status: "published",
        performance: { views: 2341, conversions: 1876, rate: 80.1 },
        color: "from-purple-500 to-violet-600",
        icon: ShoppingCart,
      },
      {
        id: "3",
        name: "Qualificação AI Leads",
        description: "Fluxo inteligente para qualificar leads automaticamente",
        nodes: 12,
        edges: 9,
        lastUpdated: new Date(Date.now() - 3600000),
        status: "draft",
        performance: { views: 0, conversions: 0, rate: 0 },
        color: "from-blue-500 to-cyan-600",
        icon: Brain,
      },
    ];

    const timer = setTimeout(() => {
      // simula sucesso
      setFlows(mockFlows);
      setLoading(false);
      // para simular erro, comente acima e descomente estas duas linhas:
      // setLoadError("Falha ao listar funis. Tente novamente.");
      // setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // quotas trial calculadas em tempo real
  const trial = useMemo(() => {
    const usedFlows = flows.length;
    const usedNodes = flows.reduce((acc, f) => acc + f.nodes, 0);
    const usedPublished = flows.filter((f) => f.status === "published").length;
    return {
      flows: { used: usedFlows, limit: 3 },
      nodes: { used: usedNodes, limit: 50 },
      publishedFlows: { used: usedPublished, limit: 2 },
    };
  }, [flows]);

  const atFlowLimit = trial.flows.used >= trial.flows.limit;

  // filtros
  const filtered = flows.filter((f) => {
    const okSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const okFilter = selectedFilter === "all" ? true : f.status === selectedFilter;
    return okSearch && okFilter;
  });

  // ações
  const createNewFlow = () => {
    if (atFlowLimit) return;
    const id = String(Date.now());
    const fresh: Flow = {
      id,
      name: "Novo Funil",
      description: "Fluxo em branco",
      nodes: 1,
      edges: 0,
      lastUpdated: new Date(),
      status: "draft",
      performance: { views: 0, conversions: 0, rate: 0 },
      color: "from-purple-500 to-pink-600",
      icon: Wand2,
    };
    setFlows([fresh, ...flows]);
    navigate(`/dashboard/flows/canvas/${id}`);
  };

  const openFlow = (flow: Flow) => {
    navigate(`/dashboard/flows/canvas/${flow.id}`);
  };

  const duplicateFlow = (flow: Flow) => {
    const id = String(Date.now());
    const copy: Flow = {
      ...flow,
      id,
      name: `${flow.name} (Cópia)`,
      status: "draft",
      lastUpdated: new Date(),
      performance: { views: 0, conversions: 0, rate: 0 },
    };
    setFlows([copy, ...flows]);
  };

  const askRename = (flow: Flow) => {
    setRenameId(flow.id);
    setRenameInitial(flow.name);
  };

  const confirmRename = (name: string) => {
    if (!renameId) return;
    setFlows((prev) => prev.map((f) => (f.id === renameId ? { ...f, name, lastUpdated: new Date() } : f)));
    setRenameId(null);
  };

  const askDelete = (flow: Flow) => setDeleteId(flow.id);

  const confirmDelete = () => {
    if (!deleteId) return;
    setFlows((prev) => prev.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const useTemplate = (tpl: Template) => {
    if (atFlowLimit) return;
    const id = String(Date.now());
    const flow: Flow = {
      id,
      name: tpl.name,
      description: tpl.description,
      nodes: tpl.nodes,
      edges: Math.max(0, tpl.nodes - 3),
      lastUpdated: new Date(),
      status: "draft",
      performance: { views: 0, conversions: 0, rate: 0 },
      color: tpl.color,
      icon: tpl.icon,
    };
    setFlows([flow, ...flows]);
    navigate(`/dashboard/flows/canvas/${id}`);
  };

  // helpers
  const formatTime = (d: Date) => {
    const now = new Date().getTime();
    const diff = now - d.getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return d.toLocaleDateString("pt-BR");
  };

  // Loading
  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
          <div className="h-12 bg-gray-700 rounded-lg w-64" />
          <div className="h-4 bg-gray-700 rounded w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Erro ao listar
  if (loadError) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-200">
            <p className="font-semibold">Erro ao listar</p>
            <p className="text-sm mt-1">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Página
  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-purple-400 font-semibold">ZapFlow Automation Studio</span>
            <Wand2 className="w-5 h-5 text-pink-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Funis
          </h1>
          <p className="text-gray-400 mt-2">Gerir funis; crie do zero ou por modelo.</p>
        </div>

        {/* Action bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar funis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Filtro */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="archived">Arquivados</option>
            </select>
          </div>

          {/* Novo Funil */}
          <button
            onClick={createNewFlow}
            disabled={atFlowLimit}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg ${
              atFlowLimit
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-purple-500/25 transform hover:scale-105"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Novo Funil</span>
            {atFlowLimit && <Crown className="w-4 h-4" />}
          </button>
        </div>

        {/* Quota Trial */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Limite do Plano Trial</h3>
                <p className="text-orange-300 text-sm">Upgrade para recursos ilimitados</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
              Fazer Upgrade
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuotaBar name="Funis" used={trial.flows.used} limit={trial.flows.limit} />
            <QuotaBar name="Nós" used={trial.nodes.used} limit={trial.nodes.limit} />
            <QuotaBar name="Funis publicados" used={trial.publishedFlows.used} limit={trial.publishedFlows.limit} />
          </div>
        </div>

        {/* Conteúdo principal */}
        {flows.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mx-auto flex items-center justify-center">
                <FilterIcon className="w-16 h-16 text-purple-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Nenhum funil criado ainda</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Comece criando seu primeiro funil ou use um dos nossos modelos prontos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={createNewFlow}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-60"
                disabled={atFlowLimit}
              >
                Criar Primeiro Funil
              </button>
              <button className="border border-purple-500/50 text-purple-400 px-8 py-3 rounded-xl font-bold hover:bg-purple-500/10 transition-all">
                Explorar Modelos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Grid de funis */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Layers className="w-6 h-6 text-purple-400" />
                <span>Seus Funis</span>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {filtered.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Card de criação */}
                <div
                  onClick={createNewFlow}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 group cursor-pointer ${
                    atFlowLimit ? "border-gray-600 opacity-60 cursor-not-allowed" : "border-gray-600 hover:border-purple-500/50 hover:bg-purple-500/5"
                  }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Criar Novo Funil</h3>
                  <p className="text-gray-400 text-sm">Construa do zero com nosso editor visual</p>
                </div>

                {/* Cards */}
                {filtered.map((flow) => (
                  <FlowCard
                    key={flow.id}
                    flow={flow}
                    formatTime={formatTime}
                    onOpen={() => openFlow(flow)}
                    onDuplicate={() => duplicateFlow(flow)}
                    onRename={() => askRename(flow)}
                    onDelete={() => askDelete(flow)}
                  />
                ))}
              </div>
            </section>

            {/* Galeria de modelos */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span>Modelos prontos</span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Novos!
                  </span>
                </h2>
                <button className="text-yellow-400 hover:text-yellow-300 font-semibold flex items-center space-x-1">
                  <span>Ver todos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {templates.map((tpl) => (
                  <TemplateCard key={tpl.id} template={tpl} onUse={() => useTemplate(tpl)} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Modais */}
      <DeleteModal
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        name={flows.find((f) => f.id === deleteId)?.name || ""}
      />
      <RenameModal
        open={!!renameId}
        initialName={renameInitial}
        onCancel={() => setRenameId(null)}
        onConfirm={confirmRename}
      />
    </div>
  );
};

export default FlowsPage;
