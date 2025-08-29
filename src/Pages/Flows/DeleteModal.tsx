import React from "react";
import { X, AlertCircle } from "lucide-react";

const DeleteModal: React.FC<{
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, name, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md mx-4 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Excluir funil</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg p-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <p className="text-sm text-red-200">
            Tem certeza que deseja excluir <b>{name || "este funil"}</b>? Essa ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
