import React, { useState } from "react";
import { Cloud, Key, Phone, Link as LinkIcon, Save, TestTube, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { ConnectionStatus } from "./StatusCard";

export interface CloudApiFormData {
  accessToken: string;
  phoneNumberId: string;
  webhookUrl: string;   // somente visual no MVP
  verifyToken?: string; // opcional no MVP
}

interface Props {
  status: ConnectionStatus;
  isTesting: boolean;
  tokenError: string | null;
  onSave: (data: CloudApiFormData) => void;
  onTest: (data: CloudApiFormData) => void;
}

const CloudApiCard: React.FC<Props> = ({ isTesting, tokenError, onSave, onTest }) => {
  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState<CloudApiFormData>({
    accessToken: "",
    phoneNumberId: "",
    webhookUrl: "https://api.zapflow.com/webhook/whatsapp",
    verifyToken: "zapflow_secure",
  });

  const change = (k: keyof CloudApiFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => onSave(form);
  const handleTest = () => onTest(form);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">Cloud API (oficial)</h3>
            <p className="text-purple-300 text-xs font-medium">Campos do MVP (visual do webhook)</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {tokenError && (
          <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <div className="text-sm text-red-300">
              <p className="font-semibold">Erro de token</p>
              <p className="mt-1">
                {tokenError} • Passo a passo: 1) Gere/renove o token no Facebook Developers; 2) Copie e cole aqui; 3) Salve e teste novamente.
              </p>
            </div>
          </div>
        )}

        {/* Access Token */}
        <div>
          <label className="block text-sm text-gray-300 mb-1 font-medium flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" /> Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={form.accessToken}
              onChange={change("accessToken")}
              placeholder="Insira seu token"
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowToken((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
              aria-label={showToken ? "Ocultar token" : "Mostrar token"}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Phone Number ID */}
        <div>
          <label className="block text-sm text-gray-300 mb-1 font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" /> Phone Number ID
          </label>
          <input
            type="text"
            value={form.phoneNumberId}
            onChange={change("phoneNumberId")}
            placeholder="ID do número no WhatsApp Business"
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Webhook URL (somente visual no MVP) */}
        <div>
          <label className="block text-sm text-gray-300 mb-1 font-medium flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-green-400" /> Webhook URL (visual)
          </label>
          <input
            type="text"
            value={form.webhookUrl}
            onChange={change("webhookUrl")}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-green-500 outline-none"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">No MVP, exibimos apenas a URL sugerida.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar credenciais
          </button>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-4 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
          >
            <TestTube className={`w-4 h-4 ${isTesting ? "animate-spin" : ""}`} />
            {isTesting ? "Testando…" : "Testar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloudApiCard;
