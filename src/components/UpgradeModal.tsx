import { X, Crown, Check } from 'lucide-react'
import { useUpgrade } from '../Pages/Context/UpgradeContext'

export default function UpgradeModal() {
  const { isOpen, close, sourceFeature } = useUpgrade()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-3xl rounded-2xl border border-green-500/30 bg-gray-950 shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Escolha um plano para desbloquear tudo</h3>
          </div>
          <button
            onClick={close}
            className="rounded-md p-1.5 hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        {/* body */}
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-4">
            {sourceFeature
              ? <>Recurso solicitado: <span className="text-gray-200 font-medium">{sourceFeature}</span></>
              : 'Plano de teste ativo'}
            . Faça upgrade para limitação zero, suporte prioritário e integrações avançadas.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Starter */}
            <PlanCard
              name="Starter"
              price="MTn 2.500/mês"
              features={[
                'Até 5.000 msg/mês',
                '1 número WhatsApp',
                'Fluxos básicos',
                'Templates aprovados',
              ]}
              cta="Assinar Starter"
            />
            {/* Professional (destaque) */}
            <PlanCard
              highlight
              name="Professional"
              price="MTn 7.500/mês"
              features={[
                '10.000+ msg/mês',
                'Números adicionais',
                'Fluxos avançados',
                'Suporte 24/7 prioritário',
                'Relatórios e APIs',
              ]}
              cta="Assinar Professional"
            />
            {/* Enterprise */}
            <PlanCard
              name="Enterprise"
              price="Contactar"
              features={[
                'Escala ilimitada',
                'SSO e permissões',
                'SLA 99.9%',
                'Integrações dedicadas',
              ]}
              cta="Falar com vendas"
            />
          </div>

          <div className="text-[11px] text-gray-500 mt-4">
            Alterar ou cancelar a qualquer momento. Impostos podem ser aplicados.
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanCard({
  name,
  price,
  features,
  cta,
  highlight,
}: {
  name: string
  price: string
  features: string[]
  cta: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'border-green-500/40 bg-green-500/10'
          : 'border-green-500/20 bg-black'
      }`}
    >
      <div className="mb-2">
        <div className="text-sm text-gray-400">{name}</div>
        <div className="text-xl font-bold">{price}</div>
      </div>
      <ul className="space-y-2 text-sm text-gray-300 mb-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full rounded-md py-2 text-sm font-semibold
        ${highlight ? 'bg-green-500 text-black hover:bg-green-400' : 'border border-green-500/30 hover:border-green-400'}`}>
        {cta}
      </button>
    </div>
  )
}
