import { Sparkles } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="rounded-xl border border-green-500/20 bg-gray-950 p-6">
      <div className="flex items-center gap-2 text-green-400 mb-2">
        <Sparkles className="h-5 w-5" />
        <h1 className="text-lg font-semibold text-white">Templates (em breve)</h1>
      </div>
      <p className="text-sm text-gray-400">
        Aqui você encontrará playbooks prontos para campanhas, recuperação de carrinho, qualificação de lead e muito mais.
      </p>
    </div>
  )
}
