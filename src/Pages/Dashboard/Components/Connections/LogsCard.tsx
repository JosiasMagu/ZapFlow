import React from "react";
import { Wifi, WifiOff, CheckCircle, XCircle, Globe, MessageSquare, Activity } from "lucide-react";

export type LogType = "connection" | "disconnection" | "error" | "success" | "webhook" | "message";

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  timestamp: Date;
}

const LogsCard: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Logs recentes</h3>
      <div className="space-y-3">
        {logs.length === 0 && <p className="text-gray-400 text-sm">Sem eventos por enquanto.</p>}
        {logs.map((l) => {
          const { Icon, color } = iconFor(l.type);
          return (
            <div key={l.id} className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-xl p-3">
              <div className={`${color} mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{l.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatTime(l.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function iconFor(type: LogType) {
  switch (type) {
    case "connection":
      return { Icon: Wifi, color: "text-blue-400" };
    case "disconnection":
      return { Icon: WifiOff, color: "text-orange-400" };
    case "error":
      return { Icon: XCircle, color: "text-red-400" };
    case "success":
      return { Icon: CheckCircle, color: "text-green-400" };
    case "webhook":
      return { Icon: Globe, color: "text-purple-400" };
    case "message":
      return { Icon: MessageSquare, color: "text-cyan-400" };
    default:
      return { Icon: Activity, color: "text-gray-400" };
  }
}

function formatTime(d: Date) {
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default LogsCard;
