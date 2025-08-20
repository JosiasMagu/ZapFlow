// src/Pages/Dashboard/Components/Guard.tsx
import React from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSession } from '../../../lib/api'
import type { FeatureKey } from '../../../lib/types'

interface GuardProps {
  children: React.ReactNode
  feature: FeatureKey
  trialAllowed?: boolean
}

export default function Guard({ children, feature, trialAllowed }: GuardProps) {
  const session = getSession()
  const plan = session?.plan ?? 'trial'

  // Regras simples: 'advanced' bloqueado no trial
  const isBlocked = plan === 'trial' && !trialAllowed && feature === 'advanced'
  if (!isBlocked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl border border-yellow-500/30 bg-black/70 backdrop-blur px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-300 mb-1">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Recurso avançado</span>
          </div>
          <Link
            to="/#pricing"
            className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-yellow-400 transition"
          >
            Ver planos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
