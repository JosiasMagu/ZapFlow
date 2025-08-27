import { AlertTriangle, Crown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { daysLeft } from '../../../lib/utils'
import { getSession } from '../../../lib/api'

const TRIAL_DAYS_TOTAL = 14

export default function TrialBanner() {
  const session = getSession()
  if (!session || session.plan !== 'trial') return null

  // Evita erro de TS: acessa chaves opcionais de forma dinâmica
  const trialEndsIso: string | undefined =
    (session as any)?.trial?.expiresAt ??
    (session as any)?.trialEndsAt ??
    (session as any)?.trial_end

  // Se não houver data de expiração conhecida, não exibe o banner
  if (!trialEndsIso) return null

  const left = daysLeft(trialEndsIso)
  if (left <= 0) return null

  const isUrgent = left <= 3
  const isWarning = !isUrgent && left <= 7

  return (
    <div
      className={`mb-6 rounded-xl border-2 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
        isUrgent
          ? 'border-red-500/40 bg-gradient-to-r from-red-500/10 to-yellow-500/10'
          : isWarning
          ? 'border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-green-500/10'
          : 'border-green-500/30 bg-green-500/10'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isUrgent
                ? 'bg-red-500/20 text-red-400'
                : isWarning
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isUrgent ? <AlertTriangle className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          </div>

          <div className="flex-1">
            <div
              className={`text-sm font-medium ${
                isUrgent ? 'text-red-300' : isWarning ? 'text-yellow-300' : 'text-green-300'
              }`}
            >
              {isUrgent ? (
                <>
                  <strong>⚡ Teste expira em breve:</strong> apenas{' '}
                  <span className="text-red-200 font-bold">
                    {left} dia{left === 1 ? '' : 's'}
                  </span>{' '}
                  restante{left === 1 ? '' : 's'}!
                </>
              ) : isWarning ? (
                <>
                  <strong>⏰ Teste ativo:</strong> faltam{' '}
                  <span className="text-yellow-200 font-bold">
                    {left} dia{left === 1 ? '' : 's'}
                  </span>{' '}
                  para expirar.
                </>
              ) : (
                <>
                  <strong>✨ Teste grátis ativo:</strong> você tem{' '}
                  <span className="text-green-200 font-bold">
                    {left} dia{left === 1 ? '' : 's'}
                  </span>{' '}
                  restante{left === 1 ? '' : 's'}.
                </>
              )}
            </div>

            <div
              className={`text-xs mt-1 ${
                isUrgent ? 'text-red-400/80' : isWarning ? 'text-yellow-400/80' : 'text-green-400/80'
              }`}
            >
              {isUrgent
                ? 'Ação necessária: escolha um plano para continuar sem interrupção.'
                : 'Para continuar aproveitando todos os recursos sem limites, confira nossos planos.'}
            </div>
          </div>
        </div>

        <Link
          to="/#pricing"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg ${
            isUrgent
              ? 'bg-red-500 text-black hover:bg-red-400 hover:shadow-red-500/25'
              : isWarning
              ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-yellow-500/25'
              : 'bg-green-500 text-black hover:bg-green-400 hover:shadow-green-500/25'
          }`}
        >
          {isUrgent ? 'Escolher Plano' : 'Ver Planos'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span
            className={`${
              isUrgent ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
            }`}
          >
            Progresso do trial
          </span>
          <span
            className={`${
              isUrgent ? 'text-red-300' : isWarning ? 'text-yellow-300' : 'text-green-300'
            }`}
          >
            {left} de {TRIAL_DAYS_TOTAL} dias
          </span>
        </div>

        <div
          className="h-2 bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Progresso do período de teste"
          aria-valuemin={0}
          aria-valuemax={TRIAL_DAYS_TOTAL}
          aria-valuenow={left}
        >
          <div
            className={`h-full transition-all duration-500 ${
              isUrgent
                ? 'bg-gradient-to-r from-red-500 to-red-400'
                : isWarning
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                : 'bg-gradient-to-r from-green-500 to-green-400'
            }`}
            style={{ width: `${(left / TRIAL_DAYS_TOTAL) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
