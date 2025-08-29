import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const RenameModal: React.FC<{
  open: boolean;
  initialName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}> = ({ open, initialName, onConfirm, onCancel }) => {
  const [name, setName] = useState(initialName || "");

  useEffect(() => setName(initialName || ""), [initialName, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md mx-4 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Renomear funil</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm text-gray-300 mb-1 font-medium">Novo nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um novo nome"
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-60"
            disabled={!name.trim()}
          >
            Renomear
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;
