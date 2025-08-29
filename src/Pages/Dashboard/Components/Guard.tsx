// import React, { useState } from 'react';
// import { canUse } from '../../../lib/usage';
// import type { FeatureKey } from '../../../lib/usage';
// import { useUsage } from '../../Context/UsageContext';
// import UpgradeModal from '../../../components/UpgradeModal';

// type GuardProps = {
//   feature: FeatureKey;
//   amount?: number;
//   flowId?: string;
//   fallback?: React.ReactNode;
//   children: React.ReactElement<any>;
// };

// export default function Guard(props: GuardProps) {
//   const { feature, amount = 1, flowId, fallback, children } = props;
//   const [open, setOpen] = useState(false);
//   const [reason, setReason] = useState<string | undefined>(undefined);

//   const { usage } = useUsage();

//   // Enquanto carrega usage, evita interação sem tentar enfiar "disabled" (que nem todo filho tem)
//   if (!usage) {
//     return (
//       <div aria-disabled="true" className="opacity-60 pointer-events-none select-none">
//         {children}
//       </div>
//     );
//   }

//   const res = canUse(usage, feature, amount, { flowId });

//   // Pega onClick original de forma segura
//   const childEl = children as React.ReactElement<any>;
//   const origOnClick = (childEl.props as any)?.onClick as React.MouseEventHandler | undefined;

//   const handleClick: React.MouseEventHandler = (e) => {
//     if (res.ok) {
//       // chama o onClick original se existir
//       origOnClick?.(e);
//       return;
//     }
//     e.preventDefault();
//     e.stopPropagation();
//     setReason(res.reason);
//     setOpen(true);
//   };

//   // Se bloqueado e tem fallback custom → renderiza fallback clicável que abre modal
//   if (!res.ok && fallback) {
//     return (
//       <>
//         <div onClick={() => { setReason(res.reason); setOpen(true); }} style={{ cursor: 'not-allowed', opacity: 0.6 }}>
//           {fallback}
//         </div>
//         <UpgradeModal open={open} onClose={() => setOpen(false)} reason={reason} />
//       </>
//     );
//   }

//   // Clona filho e injeta onClick; usar "as any" evita erro do TS em props genéricas
//   const childWithHandler = React.cloneElement(childEl, { onClick: handleClick } as any);

//   return (
//     <>
//       {childWithHandler}
//       <UpgradeModal open={open} onClose={() => setOpen(false)} reason={reason} />
//     </>
//   );
// }
