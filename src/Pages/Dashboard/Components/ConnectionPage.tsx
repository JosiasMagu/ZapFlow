// src/Pages/Dashboard/ConnectionPage.tsx
import React, { useMemo, useState } from "react";
import StatusCard, { type ConnectionStatus } from "./Connections/StatusCard";
import CloudApiCard, { type CloudApiFormData } from "./Connections/ClaudAPI";
import WhatsAppWebCard from "./Connections/WhatsappAppCard";
import FunnelAssignCard, { type Funnel } from "./Connections/FunnelAssignCard";
import LogsCard, { type LogEntry, type LogType } from "./Connections/LogsCard";

const ConnectionPage: React.FC = () => {
  // estados principais da conexão
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isScanning, setIsScanning] = useState(false);
  const [qrProgress, setQrProgress] = useState(0);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // mock de funis
  const funnels = useMemo<Funnel[]>(
    () => [
      { id: "1", name: "Funil de Boas-vindas", published: true },
      { id: "2", name: "Captura Leads Promo", published: true },
      { id: "3", name: "Qualificação (rascunho)", published: false },
    ],
    []
  );
  const publishedFunnels = funnels.filter((f) => f.published);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(
    publishedFunnels[0]?.id ?? null
  );

  // helper seguro para logs
  const makeLog = (type: LogType, message: string): LogEntry => ({
    id: String(Date.now()),
    type,
    message,
    timestamp: new Date(),
  });
  const pushLog = (entry: LogEntry) =>
    setLogs((prev) => [entry, ...prev].slice(0, 10));

  // logs seed
  const [logs, setLogs] = useState<LogEntry[]>([
    makeLog("connection", "Sessão iniciada"),
    makeLog("webhook", "Webhook verificado"),
    makeLog("message", "Mensagens recebidas"),
    makeLog("success", "Reconectado com sucesso"),
    makeLog("disconnection", "Sessão expirada"),
  ]);

  // handlers — WhatsApp Web (QR)
  const handleGenerateQR = () => {
    setTokenError(null);
    setStatus("qr");
    setIsScanning(true);
    setQrProgress(0);

    const iv = setInterval(() => {
      setQrProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          // simula “Escaneando → Conectado”
          setStatus("connected");
          setIsScanning(false);
          pushLog(makeLog("success", "QR escaneado; sessão conectada"));
          return 100;
        }
        return p + 4;
      });
    }, 120);
  };

  const handleDisconnect = () => {
    setStatus("disconnected");
    pushLog(makeLog("disconnection", "Sessão desconectada manualmente"));
  };

  // handlers — Cloud API
  const handleSaveCloudApi = (data: CloudApiFormData) => {
    if (!data.accessToken || !data.phoneNumberId) {
      setTokenError("Access Token e Phone Number ID são obrigatórios.");
      setStatus("disconnected");
      pushLog(makeLog("error", "Erro ao salvar credenciais (campos obrigatórios)"));
      return;
    }
    setTokenError(null);
    pushLog(makeLog("success", "Credenciais salvas"));
  };

  const handleTestCloudApi = (data: CloudApiFormData) => {
    setIsTestingApi(true);
    setTimeout(() => {
      if (!data.accessToken || data.accessToken.length < 10) {
        setIsTestingApi(false);
        setTokenError(
          "Token inválido. Gere um novo token no Facebook Developers e tente novamente."
        );
        setStatus("disconnected");
        pushLog(makeLog("error", "Teste falhou: token inválido"));
        return;
      }
      setIsTestingApi(false);
      setTokenError(null);
      setStatus("connected");
      pushLog(makeLog("success", "Cloud API conectada com sucesso"));
    }, 1400);
  };

  // métricas simples do header
  const headerMetrics = { uptime: "99.9%", responseMs: 120, todayMsgs: 248, errorRate: 0.04 };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* status atual (grande, com ícone e legenda) */}
        <StatusCard status={status} phoneLabel="+55 11 99999-9999" metrics={headerMetrics} />

        {/* abas/cartões (lado a lado) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <WhatsAppWebCard
            status={status}
            isScanning={isScanning}
            qrProgress={qrProgress}
            onGenerateQR={handleGenerateQR}
            onDisconnect={handleDisconnect}
          />

          <CloudApiCard
            status={status}
            isTesting={isTestingApi}
            tokenError={tokenError}
            onSave={handleSaveCloudApi}
            onTest={handleTestCloudApi}
          />
        </div>

        {/* associação do número ao funil */}
        <FunnelAssignCard
          funnels={publishedFunnels}
          selectedId={selectedFunnelId}
          onSelect={setSelectedFunnelId}
        />

        {/* logs recentes (últimas 10 mudanças) */}
        <LogsCard logs={logs} />
      </div>
    </div>
  );
};

export default ConnectionPage;
