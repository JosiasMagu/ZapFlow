import React from "react";
import { X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md mx-4 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Faça Upgrade do seu Plano</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 text-sm mb-6">
          Desbloqueie recursos premium como modelos prontos, limites maiores e automações avançadas.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Agora não
          </button>
          <a
            href="#"
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            Ver planos
          </a>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
