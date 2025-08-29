// // src/lib/messagePolicies.ts
// // Injeta rodapé obrigatório no Trial e bloqueia mídia conforme o plano.

// import { canUse } from './usage';
// import type { UsageSnapshot } from './usage';
// export type OutboundMessage = {
//   text?: string;
//   media?: Array<{ type: 'image' | 'video' | 'audio' | 'document'; url: string }>;
//   // ... demais campos que teu sender usa
// };

// const TRIAL_FOOTER = 'Usando plano gratuito do ZapFlow.app';

// export function applyOutboundPolicies(
//   msg: OutboundMessage,
//   usage: UsageSnapshot
// ): OutboundMessage {
//   const cloned: OutboundMessage = JSON.parse(JSON.stringify(msg));

//   // Rodapé Trial
//   const branding = canUse(usage, 'branding.injectTrialFooter');
//   if (branding.limits.trialFooterRequired) {
//     const base = (cloned.text ?? '').trim();
//     if (!base.includes(TRIAL_FOOTER)) {
//       cloned.text = base.length ? `${base}\n\n${TRIAL_FOOTER}` : TRIAL_FOOTER;
//     }
//   }

//   // Bloqueio de mídia se o plano não permitir
//   const mediaAllowed = canUse(usage, 'messaging.sendMedia').ok;
//   if (!mediaAllowed && cloned.media && cloned.media.length > 0) {
//     // remove mídia silenciosamente ou lança erro (escolha de UX)
//     // Aqui optamos por lançar erro para feedback claro:
//     const err = new Error('Envio de mídia não disponível no seu plano.');
//     (err as any).__gating__ = true;
//     throw err;
//   }

//   return cloned;
// }
