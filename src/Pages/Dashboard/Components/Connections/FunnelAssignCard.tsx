import React from "react";
import { Filter, Plus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Funnel {
  id: string;
  name: string;
  published: boolean;
}

interface Props {
  funnels: Funnel[];               // somente publicados chegam aqui
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const FunnelAssignCard: React.FC<Props> = ({ funnels, selectedId, onSelect }) => {
  const navigate = useNavigate();

  const empty = funnels.length === 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-green-400" />
          <h3 className="text-white text-lg font-semibold">Associação do número ao funil</h3>
        </div>
      </div>

      {empty ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="mb-2">Não há funis publicados.</p>
            <button
              onClick={() => navigate("/dashboard/funis")}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Criar funil
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="block text-sm text-gray-300 mb-1 font-medium">Funil padrão deste número</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => onSelect(e.target.value || null)}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-green-500 outline-none"
          >
            {funnels.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Todas as mensagens recebidas serão enviadas a este funil.
          </p>
        </>
      )}
    </div>
  );
};

export default FunnelAssignCard;
