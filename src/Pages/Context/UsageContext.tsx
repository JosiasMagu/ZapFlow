// // src/context/UsageContext.tsx
// // Provider que mantém "usage" no front e expõe helpers de atualização.
// // O backend do teu colega deve fornecer /billing/usage e /billing/limits (opcional).

// // FILE: src/Pages/Context/UsageContext.tsx
// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import type { UsageSnapshot, FeatureKey } from '../../lib/usage';
// import { canUse, assertCanUse } from '../../lib/usage';
// import type { PlanLimits } from '../../lib/plans';

// // ===== Ajuste aqui se teu fetch/cliente for diferente =====
// async function apiGet<T>(url: string): Promise<T> {
//   const r = await fetch(url, { credentials: 'include' });
//   if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
//   return r.json();
// }

// async function apiPost<T>(url: string, body: any): Promise<T> {
//   const r = await fetch(url, {
//     method: 'POST',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   });
//   if (!r.ok) throw new Error(`POST ${url} -> ${r.status}`);
//   return r.json();
// }
// // ==========================================================

// type UsageCtxValue = {
//   loading: boolean;
//   usage: UsageSnapshot | null;
//   limits: PlanLimits | null;
//   refresh: () => Promise<void>;

//   // Atalhos
//   canUse: (feature: FeatureKey, amount?: number, ctx?: { flowId?: string }) => boolean;
//   assertCanUse: (feature: FeatureKey, amount?: number, ctx?: { flowId?: string }) => void;

//   // Opcional: registrar consumo (ex.: após disparar campanha)
//   // O backend deve retornar o snapshot atualizado.
//   recordConsumption: (feature: FeatureKey, amount?: number, ctx?: any) => Promise<void>;
// };

// const UsageCtx = createContext<UsageCtxValue | null>(null);

// export function UsageProvider({ children }: { children: React.ReactNode }) {
//   const [loading, setLoading] = useState(true);
//   const [usage, setUsage] = useState<UsageSnapshot | null>(null);
//   const [limits, setLimits] = useState<PlanLimits | null>(null);

//   const refresh = async () => {
//     setLoading(true);
//     try {
//       // Backend deve juntar ambos em /billing/usage. /billing/limits é opcional (overrides).
//       const snap = await apiGet<UsageSnapshot>('/billing/usage');
//       setUsage(snap);
//       // Se teu backend já embute overrides no snap, "limits" pode ser omitido
//       if ((snap as any).__limits) {
//         setLimits((snap as any).__limits as PlanLimits);
//       } else {
//         setLimits(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refresh();
//   }, []);

//   const value: UsageCtxValue = useMemo(() => ({
//     loading,
//     usage,
//     limits,
//     refresh,
//     canUse: (feature, amount = 1, ctx) => {
//       if (!usage) return false;
//       return canUse(usage, feature, amount, ctx).ok;
//     },
//     assertCanUse: (feature, amount = 1, ctx) => {
//       if (!usage) throw new Error('Usage indisponível.');
//       return assertCanUse(usage, feature, amount, ctx);
//     },
//     recordConsumption: async (feature, amount = 1, ctx) => {
//       if (!usage) throw new Error('Usage indisponível.');
//       const updated = await apiPost<UsageSnapshot>('/billing/usage/increment', {
//         feature,
//         amount,
//         ctx,
//       });
//       setUsage(updated);
//     },
//   }), [loading, usage, limits]);

//   return <UsageCtx.Provider value={value}>{children}</UsageCtx.Provider>;
// }

// export function useUsage() {
//   const ctx = useContext(UsageCtx);
//   if (!ctx) throw new Error('useUsage deve ser usado dentro de <UsageProvider>.');
//   return ctx;
// }
