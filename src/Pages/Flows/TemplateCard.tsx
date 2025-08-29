import React from "react";
import type { Template } from "../../lib/types";
import { Crown, Star } from "lucide-react";

const TemplateCard: React.FC<{
  template: Template;
  onUse: () => void;
}> = ({ template, onUse }) => {
  const Icon = template.icon;

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-yellow-500/30 group">
      {/* header */}
      <div className={`bg-gradient-to-r ${template.color} p-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <Icon className="w-4 h-4 text-white" />
            </div>
            {template.premium && (
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Crown className="w-3 h-3 text-yellow-400" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 text-white">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold">{template.rating}</span>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <h3 className="font-bold text-white mb-2 text-sm">{template.name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{template.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{template.nodes} nós</span>
          <span className={diffColor(template.difficulty)}>{template.difficulty}</span>
          <span>{template.uses} usos</span>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-2 mb-3">
          <div className="text-xs text-gray-300 font-mono">{template.preview}</div>
        </div>

        <button
          onClick={!template.premium ? onUse : undefined}
          disabled={template.premium}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
            template.premium
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white hover:shadow-lg"
          }`}
        >
          {template.premium ? (
            <div className="flex items-center justify-center gap-1">
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </div>
          ) : (
            "Usar Modelo"
          )}
        </button>
      </div>
    </div>
  );
};

function diffColor(d: Template["difficulty"]) {
  switch (d) {
    case "beginner":
      return "text-green-400";
    case "intermediate":
      return "text-yellow-400";
    case "advanced":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export default TemplateCard;
