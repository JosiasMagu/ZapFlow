import React from "react";
import { Wifi, WifiOff, QrCode, Loader } from "lucide-react";

export type ConnectionStatus = "connected" | "connecting" | "qr" | "disconnected";

interface StatusCardProps {
  status: ConnectionStatus;
  phoneLabel?: string;
  metrics?: { uptime: string; responseMs: number; todayMsgs: number; errorRate: number };
}

const StatusCard: React.FC<StatusCardProps> = ({ status, phoneLabel, metrics }) => {
  const cfg = (() => {
    switch (status) {
      case "connected":
        return { Icon: Wifi, color: "text-green-400", bg: "from-green-500/10 to-emerald-600/10", label: "Conectado" };
      case "connecting":
        return { Icon: Loader, color: "text-yellow-400", bg: "from-yellow-500/10 to-amber-600/10", label: "Conectando…" };
      case "qr":
        return { Icon: QrCode, color: "text-yellow-400", bg: "from-yellow-500/10 to-amber-600/10", label: "Precisa escanear QR" };
      case "disconnected":
      default:
        return { Icon: WifiOff, color: "text-red-400", bg: "from-red-500/10 to-rose-600/10", label: "Desconectado" };
    }
  })();

  const { Icon } = cfg;

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} border border-gray-700 rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-4 bg-black/30 rounded-xl ${status === "connecting" ? "animate-spin" : ""}`}>
            <Icon className={`w-10 h-10 ${cfg.color}`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${cfg.color}`}>{cfg.label}</h2>
            {phoneLabel && <p className="text-gray-400 text-sm">Número: {phoneLabel}</p>}
          </div>
        </div>

        {metrics && status === "connected" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Uptime" value={metrics.uptime} />
            <Metric label="Latência" value={`${metrics.responseMs}ms`} />
            <Metric label="Mensagens (hoje)" value={String(metrics.todayMsgs)} />
            <Metric label="Erros" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
          </div>
        )}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
    <div className="text-xl font-semibold text-white">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

export default StatusCard;
