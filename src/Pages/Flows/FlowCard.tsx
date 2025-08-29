import React from "react";
import type { Flow } from "../../lib/types";
import { MoreVertical, Eye, Copy, Edit3, Trash2, Clock } from "lucide-react";

const statusBadge = (status: Flow["status"]) => {
  switch (status) {
    case "published":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "draft":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "archived":
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const statusText = (status: Flow["status"]) => {
  switch (status) {
    case "published":
      return "Publicado";
    case "draft":
      return "Rascunho";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
};

const FlowCard: React.FC<{
  flow: Flow;
  formatTime: (d: Date) => string;
  onOpen: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
}> = ({ flow, formatTime, onOpen, onDuplicate, onRename, onDelete }) => {
  const Icon = flow.icon;

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/30 group">
      {/* header */}
      <div className={`bg-gradient-to-r ${flow.color} p-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg truncate">{flow.name}</h3>
              <p className="text-white/80 text-xs">{flow.description}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* body */}
      <div className="p-6">
        {/* status + conversão */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(flow.status)}`}>
            {statusText(flow.status)}
          </span>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{flow.performance.rate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">conversão</div>
          </div>
        </div>

        {/* métricas */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Metric label="Nós" value={String(flow.nodes)} />
          <Metric label="Arestas" value={String(flow.edges)} />
          <Metric label="Visualizações" value={String(flow.performance.views)} accent />
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-4">
          <Clock className="w-3 h-3 mr-1" />
          Atualizado {formatTime(flow.lastUpdated)}
        </div>

        {/* ações */}
        <div className="flex gap-2">
          <button
            onClick={onOpen}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Abrir
          </button>
          <IconBtn onClick={onDuplicate}><Copy className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={onRename}><Edit3 className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={onDelete} danger><Trash2 className="w-4 h-4" /></IconBtn>
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${accent ? "text-purple-400" : "text-white"}`}>{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

const IconBtn: React.FC<{ onClick?: () => void; children: React.ReactNode; danger?: boolean }> = ({
  onClick,
  children,
  danger,
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors ${
      danger ? "bg-red-600/80 hover:bg-red-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
    }`}
  >
    {children}
  </button>
);

export default FlowCard;
