import React from "react";
import { QrCode, RefreshCw, Unplug, Smartphone, Loader } from "lucide-react";
import type { ConnectionStatus } from "./StatusCard";

interface Props {
  status: ConnectionStatus;
  isScanning: boolean;
  qrProgress: number; // 0..100
  onGenerateQR: () => void;
  onDisconnect: () => void;
}

const WhatsAppWebCard: React.FC<Props> = ({
  status,
  isScanning,
  qrProgress,
  onGenerateQR,
  onDisconnect,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">WhatsApp Web (QR)</h3>
            <p className="text-green-300 text-xs font-medium">MVP • com QR placeholder</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* QR placeholder / progress */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-xl bg-white flex items-center justify-center">
              {status === "connecting" || isScanning ? (
                <Loader className="w-10 h-10 text-gray-400 animate-spin" />
              ) : (
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 ${i % 3 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Anel de progresso */}
            {(status === "connecting" || isScanning) && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgb(55,65,81)" strokeWidth="4" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgb(16,185,129)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45 * (qrProgress / 100)} ${2 * Math.PI * 45}`}
                  className="transition-all duration-300"
                />
              </svg>
            )}
          </div>

          <div className="mt-3 text-center">
            {status === "qr" && <p className="text-gray-300 text-sm">QR gerado • válido por 60s</p>}
            {status === "connecting" && <p className="text-gray-300 text-sm">Gerando QR… {qrProgress}%</p>}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Smartphone className="w-4 h-4 text-green-400" />
            <h4 className="text-white font-medium text-sm">Dica</h4>
          </div>
          <p className="text-gray-300 text-sm">
            Abra o WhatsApp no celular → <b>Aparelhos conectados</b> → <b>Conectar aparelho</b> → escaneie o QR.
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <button
            onClick={onGenerateQR}
            disabled={isScanning || status === "connecting"}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            Recarregar / Gerar QR
          </button>

          {status === "connected" && (
            <button
              onClick={onDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Unplug className="w-4 h-4" />
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppWebCard;
