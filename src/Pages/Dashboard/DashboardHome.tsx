// src/Pages/Dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bot, Send, Upload, Sparkles,
  BarChart3, Users, MessageSquare, Percent,
  ChevronRight, AlertCircle, Clock
} from 'lucide-react'
import Guard from './Components/Guard'
import { getDashboardSnapshot, listRecentActivity } from '../../lib/api'
import type { DashboardSnapshot, Activity } from '../../lib/types'

function StatCard({
  icon, label, value, hint,
}: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400">{icon}<span className="text-sm">{label}</span></div>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
    </div>
  )
}

function QuickAction({
  to, icon, title, desc,
}: { to?: string; icon: React.ReactNode; title: string; desc: string }) {
  const body = (
    <div className="rounded-xl border border-green-500/20 p-4 bg-gray-950 hover:border-green-400 transition">
      <div className="flex items-start gap-3">
        <div className="text-green-400">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-400">{desc}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

function ActivityItem({ a }: { a: Activity }) {
  const iconMap = {
    bot_run: <Bot className="h-4 w-4" />,
    broadcast: <Send className="h-4 w-4" />,
    contact_import: <Upload className="h-4 w-4" />,
    flow_published: <Sparkles className="h-4 w-4" />,
  }
  const color =
    a.status === 'error'
      ? 'text-red-400'
      : a.status === 'warning'
      ? 'text-yellow-400'
      : 'text-green-400'
  return (
    <div className="rounded-lg border border-green-500/20 bg-gray-950 p-3">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${color}`}>{iconMap[a.type]}</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{a.title}</div>
          <div className="text-xs text-gray-400">{a.description}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="h-3 w-3" />
            {new Date(a.ts).toLocaleString()}
          </div>
        </div>
        {a.status && (
          <div className={`text-[10px] px-2 py-0.5 rounded-full border ${color} ${color.replace('text', 'border')}`}>
            {a.status}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [snap, setSnap] = useState<DashboardSnapshot | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const [s, acts] = await Promise.all([getDashboardSnapshot(), listRecentActivity()])
      if (mounted) {
        setSnap(s)
        setActivities(acts)
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header simples */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bem-vindo 👋</h1>
        <button
          onClick={() => navigate('/#pricing')}
          className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
        >
          Atualizar plano <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Alert se dados não carregarem */}
      {!loading && !snap && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 p-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Não foi possível carregar os dados do dashboard.
        </div>
      )}

      {/* Métricas */}
      <div className="grid md:grid-cols-4 gap-4">
        {loading || !snap ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-green-500/20 bg-gray-950 p-4 animate-pulse h-24" />
          ))
        ) : (
          <>
            <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Automações (30d)" value={snap.totals.automations.toLocaleString()} hint="+12% vs mês anterior" />
            <StatCard icon={<Percent className="h-4 w-4" />} label="Sucesso" value={`${snap.totals.successRate}%`} hint="erros < 0,5%" />
            <StatCard icon={<Users className="h-4 w-4" />} label="Contatos" value={snap.totals.contacts.toLocaleString()} hint="ativos no CRM" />
            <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Mensagens (30d)" value={snap.totals.messages.toLocaleString()} hint="+8% vs mês anterior" />
          </>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div className="grid md:grid-cols-4 gap-4">
        <Guard feature="bot" trialAllowed>
          <QuickAction
            to="/dashboard/flows"
            icon={<Bot className="h-5 w-5" />}
            title="Criar fluxo com bot"
            desc="Construa seu fluxo visual com nós e condições"
          />
        </Guard>

        <Guard feature="broadcast" trialAllowed>
          <QuickAction
            to="/dashboard/broadcasts"
            icon={<Send className="h-5 w-5" />}
            title="Campanha manual"
            desc="Dispare mensagens para uma lista"
          />
        </Guard>

        <Guard feature="contacts" trialAllowed>
          <QuickAction
            to="/dashboard/contacts"
            icon={<Upload className="h-5 w-5" />}
            title="Importar contatos"
            desc="Suba CSV e segmente listas"
          />
        </Guard>

        <Guard feature="advanced">
          <QuickAction
            to="/dashboard/templates"
            icon={<Sparkles className="h-5 w-5" />}
            title="Modelos prontos"
            desc="Playbooks e integrações avançadas"
          />
        </Guard>
      </div>

      {/* Atividade recente */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Atividade recente</h2>
            <Link to="/dashboard/activity" className="text-sm text-green-400 hover:text-green-300">
              Ver tudo
            </Link>
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-green-500/20 bg-gray-950 p-4 animate-pulse h-16" />
            ))
          ) : (
            activities.map((a) => <ActivityItem key={a.id} a={a} />)
          )}
        </div>

        {/* “Destaques” (placeholder) */}
        <div className="space-y-3">
          <div className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
            <div className="text-sm font-semibold mb-1">Destaque da semana</div>
            <div className="text-sm text-gray-400">ROI médio ↑ 18% após automações de recuperação.</div>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-gray-950 p-4">
            <div className="text-sm font-semibold mb-1">Sugestão</div>
            <div className="text-sm text-gray-400">Teste o modelo “Qualificação Rápida” para novos leads.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
