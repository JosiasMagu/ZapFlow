// FILE: src/Pages/Dashboard/Components/Guard.tsx
// Agora o Guard também bloqueia por USO (limites trial), além de "feature avançada".
// Quando chega a 80%, chama modal de upgrade (uma vez).

import React, { useEffect } from 'react'
import { Lock, Crown } from 'lucide-react'
import { getSession } from '../../../lib/api'
import { useUpgrade } from '../../Context/UpgradeContext'
import { featureUsage, nearLimit, atLimit, shouldNudgeOnce } from '../../../lib/usage'

type Feature = 'bot' | 'flow' | 'broadcast' | 'advanced' | 'contacts'

type Props = {
  children: React.ReactNode
  feature: Feature
  trialAllowed?: boolean
}

export default function Guard({ children, feature, trialAllowed }: Props) {
  const { open } = useUpgrade()
  const session = getSession()
  const isTrial = session?.plan === 'trial'

  // Bloqueio por feature avançada
  const blockedByFeature = isTrial && (!trialAllowed || feature === 'advanced')

  // Bloqueio por USO (apenas no trial)
  let blockedByUsage = false
  let nudge = false
  if (isTrial && (feature === 'bot' || feature === 'flow' || feature === 'broadcast' || feature === 'contacts')) {
    const { used, limit } = featureUsage(feature)
    blockedByUsage = atLimit(used, limit)
    nudge = nearLimit(used, limit)
  }

  useEffect(() => {
    if (nudge && shouldNudgeOnce(`nudge_${feature}`)) {
      open(feature) // abre o modal ao chegar a ~80%
    }
  }, [nudge, feature, open])

  if (!blockedByFeature && !blockedByUsage) {
    return <>{children}</>
  }

  type UpgradeFeature = Parameters<typeof open>[0]

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">{children}</div>

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => open(feature as UpgradeFeature)}
          className="group flex items-center gap-2 rounded-full bg-green-500 text-black font-semibold px-4 py-2 hover:bg-green-400 shadow-lg hover:shadow-green-500/20"
        >
          <Crown className="h-4 w-4" />
          Fazer upgrade
        </button>
      </div>

      <div className="absolute top-2 right-2 rounded-md bg-black/70 border border-green-500/30 px-2 py-1 text-[11px] flex items-center gap-1">
        <Lock className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-300">{blockedByUsage ? 'Limite atingido' : 'Trial'}</span>
      </div>
    </div>
  )
}
