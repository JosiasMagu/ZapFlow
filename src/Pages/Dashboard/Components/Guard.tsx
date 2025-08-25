import React from 'react'
import { Lock, Crown } from 'lucide-react'
import { getSession } from '../../../lib/api'
import { useUpgrade } from '../../Context/UpgradeContext'

type Feature = 'bot' | 'flow' | 'broadcast' | 'advanced'

type Props = {
  children: React.ReactNode
  feature: Feature
  trialAllowed?: boolean
}

export default function Guard({ children, feature, trialAllowed }: Props) {
  const { open } = useUpgrade()
  const session = getSession()
  const isTrial = session?.plan === 'trial'

  // Regras simples:
  // - Se for trial e o recurso NÃO for permitido no trial -> bloqueia
  // - Se for recurso "advanced", bloquear sempre no trial
  const blockedByTrial = isTrial && (!trialAllowed || feature === 'advanced')

  if (!blockedByTrial) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* conteúdo fica visível, mas com overlay para indicar bloqueio */}
      <div className="pointer-events-none opacity-50">{children}</div>

      {/* overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => open(feature)}
          className="group flex items-center gap-2 rounded-full bg-green-500 text-black font-semibold px-4 py-2 hover:bg-green-400 shadow-lg hover:shadow-green-500/20"
        >
          <Crown className="h-4 w-4" />
          Fazer upgrade
        </button>
      </div>

      {/* selo/lock */}
      <div className="absolute top-2 right-2 rounded-md bg-black/70 border border-green-500/30 px-2 py-1 text-[11px] flex items-center gap-1">
        <Lock className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-300">Trial</span>
      </div>
    </div>
  )
}
