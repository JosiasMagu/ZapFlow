// FILE: src/Pages/Flows/FlowCanvas.tsx
import React, { useState, useRef, useCallback } from "react";
import {
  Save,
  Play,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Trash2,
  Download,
  Settings,
  Edit3,
  Plus,
  MessageSquare,
  GitBranch,
  Clock,
  Brain,
  Globe,
  StopCircle,
  Image,
  Video,
  Mic,
  FileText,
  Hash,
  Check,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  Share2,
  Target,
  Move,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Tipos do Canvas (UI)
import type {
  FlowData,
  UINode as FlowNode,
  UIEdge as FlowEdge,
  NodeType,
} from "../../lib/types";

// =====================
// Configuração visual
// =====================
const nodeTypes = [
  { type: "start",   icon: Play,          label: "Início",    color: "from-green-500 to-emerald-600", description: "Ponto de entrada do funil" },
  { type: "message", icon: MessageSquare, label: "Mensagem",  color: "from-blue-500 to-cyan-600",     description: "Enviar texto/mídia" },
  { type: "choice",  icon: GitBranch,     label: "Escolha",   color: "from-purple-500 to-violet-600", description: "Múltiplas opções" },
  { type: "collect", icon: Hash,          label: "Coletar",   color: "from-orange-500 to-red-600",    description: "Capturar dados" },
  { type: "delay",   icon: Clock,         label: "Aguardar",  color: "from-yellow-500 to-amber-600",  description: "Pausa/delay" },
  { type: "ai",      icon: Brain,         label: "IA",        color: "from-pink-500 to-rose-600",     description: "Chamar IA (placeholder)" },
  { type: "http",    icon: Globe,         label: "HTTP",      color: "from-indigo-500 to-blue-700",   description: "Requisição externa" },
  { type: "end",     icon: StopCircle,    label: "Finalizar", color: "from-gray-500 to-slate-600",    description: "Encerrar fluxo" },
] as const;

// geometria do cartão (para âncoras e handles)
// min-w-40 = 10rem = 160px
const CARD_WIDTH = 180;   // ligeiramente maior
const CARD_HEIGHT = 120;  // mais alto p/ caber preview
type HandleSide = "left" | "right" | "top" | "bottom";

type ConnectState =
  | { active: false }
  | {
      active: true;
      sourceId: string;
      sourceSide: HandleSide;
      start: { x: number; y: number };
      mouse: { x: number; y: number };
      hover: { nodeId: string; side: HandleSide } | null;
    };

// =====================

const FlowCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [flowData, setFlowData] = useState<FlowData>({
    id: id || "new",
    name: "Novo Funil",
    nodes: [
      {
        id: "n1",
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Start" },
      },
    ],
    edges: [],
    version: "1.0.0",
    lastSaved: null,
    isDirty: false,
    isPublished: false,
    labels: [],
    internalNote: "",
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(flowData.name);
  const [draggedNodeType, setDraggedNodeType] = useState<NodeType | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // simulador (rodapé)
  const [showSimulator, setShowSimulator] = useState(false);
  const [simMsgs, setSimMsgs] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: Date }>>([]);
  const [simInput, setSimInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // painel de propriedades (colapsável)
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const panning = useRef(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ===== Persistência =====
  const handleSave = useCallback(() => {
    setFlowData((prev) => ({ ...prev, lastSaved: new Date(), isDirty: false }));
  }, []);

  const bumpMinor = (v: string) => {
    const [maj, min, pat] = v.split(".").map((n) => parseInt(n || "0", 10));
    return `${maj}.${(min || 0) + 1}.${pat || 0}`;
  };

  const handlePublish = useCallback(() => {
    setFlowData((prev) => ({
      ...prev,
      isPublished: true,
      lastSaved: new Date(),
      isDirty: false,
      version: bumpMinor(prev.version),
    }));
  }, []);

  // ===== Helpers de posição =====
  const getAnchor = (node: FlowNode, side: HandleSide) => {
    switch (side) {
      case "left":
        return { x: node.position.x, y: node.position.y + CARD_HEIGHT / 2 };
      case "right":
        return { x: node.position.x + CARD_WIDTH, y: node.position.y + CARD_HEIGHT / 2 };
      case "top":
        return { x: node.position.x + CARD_WIDTH / 2, y: node.position.y };
      case "bottom":
        return { x: node.position.x + CARD_WIDTH / 2, y: node.position.y + CARD_HEIGHT };
    }
  };

  const pathFor = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const curve = Math.max(40, dist * 0.5);

    if (Math.abs(dx) >= Math.abs(dy)) {
      const c1x = a.x + (dx >= 0 ? curve : -curve);
      const c2x = b.x - (dx >= 0 ? curve : -curve);
      return `M ${a.x},${a.y} C ${c1x},${a.y} ${c2x},${b.y} ${b.x},${b.y}`;
    } else {
      const c1y = a.y + (dy >= 0 ? curve : -curve);
      const c2y = b.y - (dy >= 0 ? curve : -curve);
      return `M ${a.x},${a.y} C ${a.x},${c1y} ${b.x},${c2y} ${b.x},${b.y}`;
    }
  };

  const screenToCanvas = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // ===== Nós/Arestas =====
  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `n${Date.now()}`,
      type,
      position,
      data: {
        label: nodeTypes.find((n) => n.type === type)?.label ?? "Nó",
        ...(type === "message" && { message: "Digite sua mensagem aqui... Use {nome}" }),
        ...(type === "choice" && { choices: ["Opção 1", "Opção 2"] }),
        ...(type === "delay" && { delay: 3, showTyping: true }),
        ...(type === "collect" && { validation: "text" as const }),
        ...(type === "ai" && { aiPrompt: "Analise a mensagem do usuário..." }),
        ...(type === "http" && { httpMethod: "GET" as const, httpUrl: "https://api.exemplo.com" }),
      },
    };
    setFlowData((prev) => ({ ...prev, nodes: [...prev.nodes, newNode], isDirty: true }));
    setSelectedNodeId(newNode.id);
  }, []);

  const updateNodeData = useCallback((nodeId: string, updates: Partial<FlowNode["data"]>) => {
    setFlowData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n)),
      isDirty: true,
    }));
  }, []);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setFlowData((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== nodeId),
        edges: prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        isDirty: true,
      }));
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [selectedNodeId]
  );

  const addEdge = (sourceId: string, targetId: string, sourceHandle: HandleSide, targetHandle: HandleSide) => {
    if (sourceId === targetId) return;
    setFlowData((prev) => {
      const exists = prev.edges.some(
        (e) =>
          e.source === sourceId &&
          e.target === targetId &&
          e.sourceHandle === sourceHandle &&
          e.targetHandle === targetHandle
      );
      if (exists) return prev;
      const edge: FlowEdge = {
        id: `e${Date.now()}`,
        source: sourceId,
        target: targetId,
        label: "",
        sourceHandle,
        targetHandle,
      };
      return { ...prev, edges: [...prev.edges, edge], isDirty: true };
    });
  };

  const deleteEdge = (edgeId: string) => {
    setFlowData((prev) => ({ ...prev, edges: prev.edges.filter((e) => e.id !== edgeId), isDirty: true }));
  };

  // ===== Conexão por handles (4 lados) =====
  const [connect, setConnect] = useState<ConnectState>({ active: false });

  const beginConnectFrom = (nodeId: string, side: HandleSide) => {
    const node = flowData.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const start = getAnchor(node, side);
    setConnect({ active: true, sourceId: nodeId, sourceSide: side, start, mouse: start, hover: null });
  };

  const markHoverTarget = (nodeId: string | null, side?: HandleSide) => {
    setConnect((c) => (c.active ? { ...c, hover: nodeId && side ? { nodeId, side } : null } : c));
  };

  const finalizeConnectionIfAny = () => {
    setConnect((c) => {
      if (!c.active) return c;
      if (c.hover && (c.hover.nodeId !== c.sourceId || c.sourceSide !== c.hover.side)) {
        addEdge(c.sourceId, c.hover.nodeId, c.sourceSide, c.hover.side);
      }
      return { active: false };
    });
  };

  // ===== Pan/Zoom e arrasto de nós =====
  const onWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(3, Math.max(0.3, z * factor)));
  };

  const onMouseDownCanvas = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-handle]")) return;
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    panning.current = true;
    panStart.current = { ...pan };
    mouseStart.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMoveCanvas = (e: React.MouseEvent) => {
    if (panning.current) {
      const dx = e.clientX - mouseStart.current.x;
      const dy = e.clientY - mouseStart.current.y;
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    }
    if (connect.active) {
      const p = screenToCanvas(e.clientX, e.clientY);
      setConnect((c) => (c.active ? { ...c, mouse: p } : c));
    }
  };
  const onMouseUpCanvas = () => {
    panning.current = false;
    if (connect.active) setConnect({ active: false });
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    if (!draggedNodeType || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
    addNode(draggedNodeType, pos);
    setDraggedNodeType(null);
  };

  const startNodeDrag = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-handle]")) return;
    e.stopPropagation();
    const node = flowData.nodes.find((n) => n.id === id);
    if (!node) return;
    const start = { x: e.clientX, y: e.clientY };
    const base = { ...node.position };
    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - start.x) / 1;
      const dy = (ev.clientY - start.y) / 1;
      setFlowData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position: { x: base.x + dx / zoom, y: base.y + dy / zoom } } : n)),
        isDirty: true,
      }));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // ===== Auto-layout/centralizar =====
  const centerView = () => {
    if (flowData.nodes.length === 0) return;
    const xs = flowData.nodes.map((n) => n.position.x);
    const ys = flowData.nodes.map((n) => n.position.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const contentW = maxX - minX + 300;
    const contentH = maxY - minY + 300;
    setZoom(Math.max(0.5, Math.min(1.2, Math.min(canvasRef.current!.clientWidth / contentW, canvasRef.current!.clientHeight / contentH))));
    setPan({ x: -minX + 150, y: -minY + 150 });
  };

  const autoLayout = () => {
    const spacingY = 160;
    const spacingX = 280;
    const order = [...flowData.nodes].sort((a, b) => a.type.localeCompare(b.type));
    const laid = order.map((n, i) => ({
      ...n,
      position: { x: 120 + (i % 3) * spacingX, y: 140 + Math.floor(i / 3) * spacingY },
    }));
    setFlowData((prev) => ({ ...prev, nodes: laid, isDirty: true }));
    setTimeout(centerView, 0);
  };

  // ===== Simulador (dummy) =====
  const simulateSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsSimulating(true);
    const userMsg = { id: String(Date.now()), text: trimmed, isUser: true as const, timestamp: new Date() };
    setSimMsgs((prev) => [...prev, userMsg]);
    setSimInput("");
    setTimeout(() => {
      const botMsg = {
        id: String(Date.now() + 1),
        text: "Obrigado! Este é um exemplo de resposta automática do funil.",
        isUser: false as const,
        timestamp: new Date(),
      };
      setSimMsgs((prev) => [...prev, botMsg]);
      setIsSimulating(false);
    }, 800);
  }, []);

  // ===== Validações =====
  const hasStart = flowData.nodes.some((n) => n.type === "start");
  const brokenEdges = flowData.edges.filter(
    (e) => !flowData.nodes.find((n) => n.id === e.source) || !flowData.nodes.find((n) => n.id === e.target)
  );
  const possibleLoop = flowData.edges.some((e) => e.source === e.target);

  const selectedNode = selectedNodeId ? flowData.nodes.find((n) => n.id === selectedNodeId) || null : null;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Nome do funil */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            {isEditingName ? (
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => {
                  setFlowData((p) => ({ ...p, name: tempName || p.name, isDirty: true }));
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setFlowData((p) => ({ ...p, name: tempName || p.name, isDirty: true }));
                    setIsEditingName(false);
                  }
                }}
                className="text-xl font-bold text-white bg-transparent border-b-2 border-purple-500 focus:outline-none px-2"
                autoFocus
              />
            ) : (
              <h1 onClick={() => setIsEditingName(true)} className="text-xl font-bold text-white cursor-pointer hover:text-purple-400">
                {flowData.name}
                <Edit3 className="w-4 h-4 inline ml-2 opacity-60" />
              </h1>
            )}

            {/* indicadores */}
            <div className="flex items-center gap-3">
              {flowData.isDirty && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Não salvo
                </span>
              )}
              {flowData.isPublished && (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <Check className="w-3 h-3" />
                  Publicado
                </span>
              )}
              <span className="text-xs text-gray-400">v{flowData.version}</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!flowData.isDirty}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </div>
            </button>

            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Publicar</span>
              </div>
            </button>

            <button
              onClick={() => setShowSimulator((s) => !s)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>Simular</span>
              </div>
            </button>

            {/* Mais */}
            <div className="relative group">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all z-50">
                <button className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button
                  onClick={() => navigate("/dashboard/connection")}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Conectar
                </button>
                <button
                  onClick={autoLayout}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Auto-layout
                </button>
                <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600/20 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* validações em destaque */}
        <div className="mt-3 flex gap-3">
          {!hasStart && banner("Falta nó Start (gatilho inicial).", "warning")}
          {brokenEdges.length > 0 && banner(`Arestas quebradas: ${brokenEdges.length}.`, "error")}
          {possibleLoop && banner("Possível loop detectado (aresta auto-referente).", "warning")}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Paleta */}
        <aside className="w-64 bg-gradient-to-b from-gray-800/90 to-gray-900/90 border-r border-gray-700/50 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Componentes
          </h3>
          <div className="space-y-2">
            {nodeTypes.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.type}
                  draggable
                  onDragStart={() => setDraggedNodeType(t.type)}
                  className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:border-gray-500/50 rounded-lg transition-all cursor-grab"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${t.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{t.label}</div>
                      <div className="text-xs text-gray-400">{t.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={centerView}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              Centralizar
            </button>
            <button
              onClick={autoLayout}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Auto-layout
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden bg-gray-900">
          {/* Controles de zoom */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-2">
            <button onClick={() => setZoom((z) => Math.min(3, z * 1.2))} className="p-1 hover:bg-white/10 rounded text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-white text-xs font-medium px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.max(0.3, z / 1.2))} className="p-1 hover:bg-white/10 rounded text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-600" />
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1 hover:bg-white/10 rounded text-white">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Grade */}
          <div
            ref={canvasRef}
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0),
                linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)
              `,
              backgroundSize: "20px 20px, 40px 40px",
              cursor: panning.current ? "grabbing" : "default",
            }}
            onWheel={onWheel}
            onMouseDown={onMouseDownCanvas}
            onMouseMove={onMouseMoveCanvas}
            onMouseUp={onMouseUpCanvas}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
              className="relative w-full h-full"
            >
              {/* Arestas */}
              <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                {flowData.edges.map((e) => {
                  const s = flowData.nodes.find((n) => n.id === e.source);
                  const t = flowData.nodes.find((n) => n.id === e.target);
                  if (!s || !t) return null;
                  const a = getAnchor(s, (e.sourceHandle as HandleSide) || "right");
                  const b = getAnchor(t, (e.targetHandle as HandleSide) || "left");
                  const d = pathFor(a, b);
                  return (
                    <g key={e.id}>
                      <path
                        d={d}
                        stroke="rgba(147,197,253,0.8)"
                        fill="none"
                        strokeWidth={2}
                        onClick={(ev) => {
                          if (ev.altKey) deleteEdge(e.id); // Alt+Click apaga
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </g>
                  );
                })}

                {/* Linha-guia durante a conexão */}
                {connect.active && (() => {
                  const a = connect.start;
                  const b = connect.mouse;
                  const d = pathFor(a, b);
                  return <path d={d} stroke="rgba(34,197,94,0.9)" fill="none" strokeWidth={2} strokeDasharray="6 4" />;
                })()}
              </svg>

              {/* Nós */}
              {flowData.nodes.map((node) => {
                const cfg = nodeTypes.find((n) => n.type === node.type)!;
                const Icon = cfg.icon;
                const selected = selectedNodeId === node.id;

                const isHover = (side: HandleSide) =>
                  connect.active && connect.hover?.nodeId === node.id && connect.hover?.side === side;

                const handleBase =
                  "absolute w-4 h-4 rounded-full border-2 transition-all";
                const glow = (color: string, strong = false) =>
                  ({ boxShadow: strong ? `0 0 0 4px ${color}` : `0 0 0 2px ${color}` });

                return (
                  <div
                    key={node.id}
                    data-node
                    className={`absolute ${selected ? "z-20" : "z-10"}`}
                    style={{ left: node.position.x, top: node.position.y }}
                    onMouseDown={(e) => startNodeDrag(node.id, e)}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div
                      className={`min-w-40 bg-gradient-to-br from-gray-800 to-gray-900 border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm transition-all relative overflow-hidden ${
                        selected ? "border-purple-500" : "border-gray-600 hover:border-gray-500"
                      }`}
                      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                    >
                      {/* HANDLES (4 lados) */}
                      {/* LEFT */}
                      <div
                        data-handle
                        role="button"
                        aria-label="Handle left"
                        onMouseDown={(e) => { e.stopPropagation(); beginConnectFrom(node.id, "left"); }}
                        onMouseEnter={() => markHoverTarget(connect.active ? node.id : null, "left")}
                        onMouseLeave={() => markHoverTarget(null)}
                        onMouseUp={(e) => { e.stopPropagation(); finalizeConnectionIfAny(); }}
                        className={`${handleBase} -left-2 top-1/2 -translate-y-1/2 bg-sky-600 border-sky-300`}
                        style={glow("rgba(125,211,252,0.35)", isHover("left"))}
                        title="Conectar (esquerda)"
                      />
                      {/* RIGHT */}
                      <div
                        data-handle
                        role="button"
                        aria-label="Handle right"
                        onMouseDown={(e) => { e.stopPropagation(); beginConnectFrom(node.id, "right"); }}
                        onMouseEnter={() => markHoverTarget(connect.active ? node.id : null, "right")}
                        onMouseLeave={() => markHoverTarget(null)}
                        onMouseUp={(e) => { e.stopPropagation(); finalizeConnectionIfAny(); }}
                        className={`${handleBase} -right-2 top-1/2 -translate-y-1/2 bg-sky-600 border-sky-300`}
                        style={glow("rgba(125,211,252,0.35)", isHover("right"))}
                        title="Conectar (direita)"
                      />
                      {/* TOP */}
                      <div
                        data-handle
                        role="button"
                        aria-label="Handle top"
                        onMouseDown={(e) => { e.stopPropagation(); beginConnectFrom(node.id, "top"); }}
                        onMouseEnter={() => markHoverTarget(connect.active ? node.id : null, "top")}
                        onMouseLeave={() => markHoverTarget(null)}
                        onMouseUp={(e) => { e.stopPropagation(); finalizeConnectionIfAny(); }}
                        className={`${handleBase} left-1/2 -translate-x-1/2`}
                        style={{
                          top: "-0.5rem",
                          backgroundColor: "#0ea5e9",
                          borderColor: "#7dd3fc",
                          ...glow("rgba(125,211,252,0.35)", isHover("top")),
                        }}
                        title="Conectar (topo)"
                      />
                      {/* BOTTOM */}
                      <div
                        data-handle
                        role="button"
                        aria-label="Handle bottom"
                        onMouseDown={(e) => { e.stopPropagation(); beginConnectFrom(node.id, "bottom"); }}
                        onMouseEnter={() => markHoverTarget(connect.active ? node.id : null, "bottom")}
                        onMouseLeave={() => markHoverTarget(null)}
                        onMouseUp={(e) => { e.stopPropagation(); finalizeConnectionIfAny(); }}
                        className={`${handleBase} left-1/2 -translate-x-1/2`}
                        style={{
                          bottom: "-0.5rem",
                          backgroundColor: "#0ea5e9",
                          borderColor: "#7dd3fc",
                          ...glow("rgba(125,211,252,0.35)", isHover("bottom")),
                        }}
                        title="Conectar (base)"
                      />

                      {/* Header do card */}
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-8 h-8 bg-gradient-to-r ${cfg.color} rounded-lg flex items-center justify-center shadow-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{node.data.label}</div>
                          <div className="text-xs text-gray-400 truncate">{cfg.label}</div>
                        </div>
                        {selected && (
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              deleteNode(node.id);
                            }}
                            className="p-1 text-red-400 hover:bg-red-600/20 rounded"
                            title="Excluir nó"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Conteúdo SEM vazar da caixa */}
                      {node.type === "message" && (
                        <div className="text-xs text-gray-300 bg-gray-700/40 rounded p-2 mt-2 max-w-full max-h-16 overflow-auto">
                          {node.data.message || "Mensagem vazia..."}
                        </div>
                      )}
                      {node.type === "choice" && (
                        <div className="mt-2 space-y-1 max-h-16 overflow-auto pr-1">
                          {(node.data.choices ?? []).map((c: string, i: number) => (
                            <div key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded truncate">
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                      {node.type === "delay" && (
                        <div className="text-xs text-yellow-300 bg-yellow-600/20 rounded p-2 mt-2">
                          Aguardar {node.data.delay || 3}s {node.data.showTyping ? "• digitando…" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Inspector (colapsável) */}
        <aside
          className={`bg-gradient-to-b from-gray-800/90 to-gray-900/90 border-l border-gray-700/50 flex flex-col transition-all duration-200 ${
            inspectorOpen ? "w-80" : "w-10"
          }`}
        >
          <div className="p-2 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 pl-2">
              <Settings className="w-5 h-5 text-purple-400" />
              {inspectorOpen && <h3 className="text-lg font-bold text-white">Propriedades</h3>}
            </div>
            <button
              onClick={() => setInspectorOpen((v) => !v)}
              className="p-2 text-gray-300 hover:text-white"
              title={inspectorOpen ? "Fechar" : "Abrir"}
            >
              {inspectorOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {inspectorOpen && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {selectedNode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Label/Título</label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                    />
                  </div>

                  {selectedNode.type === "message" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Texto da mensagem</label>
                        <textarea
                          value={selectedNode.data.message || ""}
                          onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                          placeholder="Digite sua mensagem... Use {nome}"
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 h-24 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mídias</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="flex items-center justify-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                            <Image className="w-4 h-4" />
                            <span className="text-xs">Imagem</span>
                          </button>
                          <button className="flex items-center justify-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                            <Video className="w-4 h-4" />
                            <span className="text-xs">Vídeo</span>
                          </button>
                          <button className="flex items-center justify-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                            <Mic className="w-4 h-4" />
                            <span className="text-xs">Áudio</span>
                          </button>
                          <button className="flex items-center justify-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs">Arquivo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === "choice" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Opções</label>
                      <div className="space-y-2">
                        {(selectedNode.data.choices || []).map((choice: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => {
                                const copy = [...(selectedNode.data.choices || [])] as string[];
                                copy[idx] = e.target.value;
                                updateNodeData(selectedNode.id, { choices: copy });
                              }}
                              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                            />
                            <button
                              onClick={() => {
                                const copy = (selectedNode.data.choices || []).filter((_, i: number) => i !== idx) as string[];
                                updateNodeData(selectedNode.id, { choices: copy });
                              }}
                              className="p-2 text-red-400 hover:bg-red-600/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const copy = [...(selectedNode.data.choices || []), `Opção ${(selectedNode.data.choices?.length || 0) + 1}`] as string[];
                            updateNodeData(selectedNode.id, { choices: copy });
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-600 hover:border-purple-500 text-gray-400 hover:text-purple-400 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar opção
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === "collect" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Validação</label>
                      <select
                        value={selectedNode.data.validation || "text"}
                        onChange={(e) => updateNodeData(selectedNode.id, { validation: e.target.value as any })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                      >
                        <option value="text">Texto</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefone</option>
                      </select>
                    </div>
                  )}

                  {selectedNode.type === "delay" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Delay (segundos)</label>
                        <input
                          type="number"
                          value={selectedNode.data.delay || 3}
                          onChange={(e) => updateNodeData(selectedNode.id, { delay: parseInt(e.target.value || "0", 10) || 1 })}
                          min={1}
                          max={300}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Exibir “digitando…”</span>
                        <button
                          onClick={() => updateNodeData(selectedNode.id, { showTyping: !selectedNode.data.showTyping })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedNode.data.showTyping ? "bg-purple-600" : "bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedNode.data.showTyping ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === "ai" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Prompt (placeholder)</label>
                      <textarea
                        value={selectedNode.data.aiPrompt || ""}
                        onChange={(e) => updateNodeData(selectedNode.id, { aiPrompt: e.target.value })}
                        placeholder="Descreva a tarefa da IA…"
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 h-24 resize-none"
                      />
                    </div>
                  )}

                  {selectedNode.type === "http" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">URL</label>
                        <input
                          value={selectedNode.data.httpUrl || ""}
                          onChange={(e) => updateNodeData(selectedNode.id, { httpUrl: e.target.value })}
                          placeholder="https://api.exemplo.com"
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Método</label>
                        <select
                          value={selectedNode.data.httpMethod || "GET"}
                          onChange={(e) => updateNodeData(selectedNode.id, { httpMethod: e.target.value as any })}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500">Configuração real virá no backend. Aqui é apenas visual/MVP.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Propriedades do fluxo</h4>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Rótulos</label>
                    <input
                      value={(flowData.labels || []).join(", ")}
                      onChange={(e) =>
                        setFlowData((p) => ({ ...p, labels: e.target.value.split(",").map((s) => s.trim()), isDirty: true }))
                      }
                      placeholder="ex.: vendas, onboarding"
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nota interna</label>
                    <textarea
                      value={flowData.internalNote || ""}
                      onChange={(e) => setFlowData((p) => ({ ...p, internalNote: e.target.value, isDirty: true }))}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 h-24 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Simulador (rodapé) */}
      {showSimulator && (
        <div className="border-t border-gray-700/50 bg-gray-900">
          <div className="max-w-7xl mx-auto p-4">
            <h4 className="text-white font-semibold mb-3">Simular conversa</h4>
            <div className="h-40 overflow-y-auto bg-gray-800/60 rounded-lg p-3 border border-gray-700">
              {simMsgs.length === 0 && <p className="text-gray-400 text-sm">Sem mensagens ainda…</p>}
              {simMsgs.map((m) => (
                <div key={m.id} className={`mb-2 flex ${m.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      m.isUser ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && simulateSend(simInput)}
                placeholder="Digite como se fosse o usuário…"
                className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-500"
              />
              <button
                onClick={() => simulateSend(simInput)}
                disabled={isSimulating || !simInput.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-medium"
              >
                Enviar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Delays/“digitando…” são simulados de forma básica no MVP.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// banners de validação
function banner(text: string, _type: "warning" | "error") {
  const isError = _type === "error";
  return (
    <div
      className={
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm " +
        (isError
          ? "border border-red-500/40 bg-red-900/20 text-red-200"
          : "border border-yellow-500/40 bg-yellow-900/20 text-yellow-200")
      }
    >
      <AlertTriangle className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
}

export default FlowCanvas;
