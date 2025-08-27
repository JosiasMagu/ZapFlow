// FILE: src/Pages/Flows/FlowCanvasPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, Link2, Unlink, Move, Trash2, ZoomIn, ZoomOut, RotateCcw,
  Upload, Download, PlayCircle, TriangleAlert
} from 'lucide-react'
import {
  loadFlowModel, saveFlowModel,
  addNode, updateNode, removeNode,
  addEdge, removeEdge, updateEdgeLabel,
  getSession,
} from '../../lib/api'
import type { FlowModel, FlowNode, NodeKind, FlowEdge } from '../../lib/types'
import FlowPalette from './FlowPallet'
import NodeConfigPanel from './NodeConfigPanel'
import { FREE_LIMITS, nearLimit, atLimit, shouldNudgeOnce } from '../../lib/usage'
import { useUpgrade } from '../Context/UpgradeContext'

const CANVAS_W = 2000
const CANVAS_H = 1200
const NODE_W = 220
const NODE_H = 110
const MIN_Z = 0.5
const MAX_Z = 2

type DragSingle = {
  ids: string[]
  offsets: Record<string, { dx: number; dy: number }>
}

export default function FlowCanvasPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { open: openUpgrade } = useUpgrade()
  const session = getSession()
  const isTrial = session?.plan === 'trial'

  const [model, setModel] = useState<FlowModel | null>(null)

  // seleção
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set())

  // linking
  const [linkFrom, setLinkFrom] = useState<string | null>(null)

  // Zoom/Pan
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [spaceDown, setSpaceDown] = useState(false)
  const [panning, setPanning] = useState<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  // Drag
  const [drag, setDrag] = useState<DragSingle | null>(null)

  // minimapa
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [vp, setVp] = useState({ w: 800, h: 600 })

  // simulador
  const [simOpen, setSimOpen] = useState(false)
  const [simNodeId, setSimNodeId] = useState<string | null>(null)
  const [simPath, setSimPath] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    const m = loadFlowModel(id)
    setModel(m)
  }, [id])

  useEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const e of entries) {
        const cr = e.contentRect
        setVp({ w: cr.width, h: cr.height })
      }
    })
    ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [])

  const selectedNode = useMemo<FlowNode | null>(
    () => model?.nodes.find((n: FlowNode) => n.id === selected) ?? null,
    [model, selected]
  )

  function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v))
  }

  function worldMouse(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const wx = (e.clientX - rect.left - pan.x) / scale
    const wy = (e.clientY - rect.top - pan.y) / scale
    return { wx, wy }
  }

  function countMessageNodes(m?: FlowModel) {
    const mm = m || model
    if (!mm) return 0
    return (mm.nodes || []).filter(n => n.kind === 'message').length
  }

  function startNode(): FlowNode | undefined {
    return model?.nodes.find((n: FlowNode) => n.kind === 'start')
  }

  // palette
  function onAdd(kind: NodeKind) {
    if (!model) return

    // regra do plano trial: limitar mensagens do fluxo a 10
    if (isTrial && kind === 'message') {
      const used = countMessageNodes(model)
      const limit = FREE_LIMITS.flowMessageNodes

      if (atLimit(used, limit)) {
        openUpgrade('flow')
        window.alert('Você atingiu o limite de 10 mensagens no plano grátis. Faça upgrade para continuar.')
        return
      }
      if (nearLimit(used + 1, limit) && shouldNudgeOnce('flow_80_nudge')) {
        openUpgrade('flow')
      }
    }

    if (kind === 'start' && startNode()) {
      window.alert('Já existe um nó de início neste fluxo.')
      return
    }

    const clone: FlowModel = structuredClone(model)
    const nx = 140 + Math.random() * 400
    const ny = 140 + Math.random() * 300
    addNode(clone, kind, nx, ny)
    setModel(clone)
  }

  // nó
  function onChangeNode(patch: Partial<FlowNode>) {
    if (!model || !selected) return
    const clone: FlowModel = structuredClone(model)

    // se for trial e o usuário tentar trocar um nó para 'message' ultrapassando o limite
    if (isTrial && typeof patch.kind !== 'undefined' && patch.kind === 'message') {
      const used = countMessageNodes(clone)
      const limit = FREE_LIMITS.flowMessageNodes
      if (atLimit(used, limit)) {
        openUpgrade('flow')
        window.alert('Limite de mensagens do fluxo atingido no plano grátis.')
        return
      }
      if (nearLimit(used + 1, limit) && shouldNudgeOnce('flow_80_nudge_kind')) {
        openUpgrade('flow')
      }
    }

    updateNode(clone, selected, patch)
    setModel(clone)
  }

  function onDeleteNode() {
    if (!model) return
    const ids: string[] = selectedSet.size ? Array.from(selectedSet) : (selected ? [selected] : [])
    if (!ids.length) return
    const clone: FlowModel = structuredClone(model)
    for (const nid of ids) removeNode(clone, nid)
    setSelected(null)
    setSelectedSet(new Set())
    setModel(clone)
  }

  // link
  function beginLink() {
    if (selected) setLinkFrom(selected)
  }
  function cancelLink() {
    setLinkFrom(null)
  }

  // canvas click
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      setSelected(null)
      setSelectedSet(new Set())
      setLinkFrom(null)
    }
  }

  // pan
  function onMouseDownCanvas(e: React.MouseEvent) {
    if (!spaceDown) return
    setPanning({ sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y })
  }
  function onMouseMoveCanvas(e: React.MouseEvent) {
    if (panning) {
      setPan({ x: panning.ox + (e.clientX - panning.sx), y: panning.oy + (e.clientY - panning.sy) })
    }
  }
  function onMouseUpCanvas() {
    setPanning(null)
  }

  // seleção/drag
  function toggleSelect(id: string) {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedSet(next)
    setSelected(id)
  }
  function selectSingle(id: string) {
    setSelected(id)
    setSelectedSet(new Set([id]))
  }
  function onMouseDownNode(e: React.MouseEvent, nodeId: string) {
    if (!model || spaceDown) return
    e.stopPropagation()

    const multiKey = e.shiftKey || e.ctrlKey || e.metaKey
    if (multiKey) toggleSelect(nodeId)
    else selectSingle(nodeId)

    const ids = (multiKey
      ? (selectedSet.has(nodeId) ? Array.from(selectedSet) : [nodeId])
      : Array.from(new Set([nodeId, ...selectedSet]))
    ).filter(Boolean) as string[]

    const offsets: Record<string, { dx: number; dy: number }> = {}
    const { wx, wy } = worldMouse(e)
    for (const id of ids) {
      const n = model.nodes.find((nn: FlowNode) => nn.id === id)!
      offsets[id] = { dx: wx - n.x, dy: wy - n.y }
    }
    setDrag({ ids, offsets })
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag || !model) return
    const clone: FlowModel = structuredClone(model)
    const { wx, wy } = worldMouse(e)

    for (const id of drag.ids) {
      const n = clone.nodes.find((nn: FlowNode) => nn.id === id)
      if (!n) continue
      const x = wx - drag.offsets[id].dx
      const y = wy - drag.offsets[id].dy
      n.x = clamp(x, 0, CANVAS_W - NODE_W)
      n.y = clamp(y, 0, CANVAS_H - NODE_H)
    }
    setModel(clone)
  }
  function onMouseUp() {
    setDrag(null)
  }

  function onClickNode(nodeId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (linkFrom && nodeId !== linkFrom && model) {
      const clone: FlowModel = structuredClone(model)
      addEdge(clone, linkFrom, nodeId)
      setModel(clone)
      setLinkFrom(null)
      return
    }
  }

  // arestas
  function handleRemoveEdge(edgeId: string) {
    if (!model) return
    const clone: FlowModel = structuredClone(model)
    removeEdge(clone, edgeId)
    setModel(clone)
  }
  function handleEdgeLabel(edgeId: string) {
    if (!model) return
    const current = model.edges.find((e: FlowEdge) => e.id === edgeId)?.label ?? ''
    const next = window.prompt('Label da aresta:', current)
    if (next === null) return
    const clone: FlowModel = structuredClone(model)
    updateEdgeLabel(clone, edgeId, next.trim())
    setModel(clone)
  }

  // zoom
  function zoomIn() { setScale(s => clamp(s + 0.1, MIN_Z, MAX_Z)) }
  function zoomOut() { setScale(s => clamp(s - 0.1, MIN_Z, MAX_Z)) }
  function zoomReset() { setScale(1); setPan({ x: 0, y: 0 }) }

  function onWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale(s => clamp(s + delta, MIN_Z, MAX_Z))
    }
  }

  // salvar
  function validateBeforeSave(): string | null {
    if (!model) return 'Modelo inválido.'
    const starts = model.nodes.filter((n: FlowNode) => n.kind === 'start').length
    if (starts === 0) return 'Adicione um nó de início.'
    if (starts > 1) return 'Só é permitido 1 nó de início.'
    if (isTrial && countMessageNodes(model) > FREE_LIMITS.flowMessageNodes) {
      return `Plano grátis permite até ${FREE_LIMITS.flowMessageNodes} mensagens no fluxo.`
    }
    return null
  }
  function handleSave() {
    const err = validateBeforeSave()
    if (err) { window.alert(err); isTrial && openUpgrade('flow'); return }
    if (!model) return
    saveFlowModel(model)
    window.alert('Fluxo salvo!')
  }

  // atalhos
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(true)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomReset() }
      if ((e.ctrlKey || e.metaKey) && e.key === '+') { e.preventDefault(); zoomIn() }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut() }
      if (e.key === 'Delete') onDeleteNode()
      if (e.key === 'Escape') { setSelected(null); setSelectedSet(new Set()); setLinkFrom(null) }

      // copy
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        ;(window as any).__FLOW_COPY__ = Array.from(selectedSet)
      }
      // paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        if (!model) return

        // bloqueio: impedir colar se estoura limite de mensagens em trial
        if (isTrial) {
          const used = countMessageNodes(model)
          const limit = FREE_LIMITS.flowMessageNodes
          const ids: string[] = (window as any).__FLOW_COPY__ ?? []
          const willAdd = ids
            .map(id => model.nodes.find(n => n.id === id))
            .filter(Boolean)
            .filter(n => (n as FlowNode).kind === 'message').length

          if (atLimit(used + willAdd, limit)) {
            openUpgrade('flow')
            window.alert('Colar excederia o limite de 10 mensagens do plano grátis.')
            return
          }
        }

        const ids: string[] = (window as any).__FLOW_COPY__ ?? []
        if (!ids.length) return
        const clone: FlowModel = structuredClone(model)

        const idMap = new Map<string, string>()
        const offset = 40
        for (const oldId of ids) {
          const old = clone.nodes.find((n: FlowNode) => n.id === oldId)
          if (!old) continue
          const newId = crypto.randomUUID?.() ?? `n_${Math.random().toString(36).slice(2)}`
          idMap.set(oldId, newId)
          clone.nodes.push({
            ...old,
            id: newId,
            x: clamp(old.x + offset, 0, CANVAS_W - NODE_W),
            y: clamp(old.y + offset, 0, CANVAS_H - NODE_H),
          })
        }
        const newEdges: FlowEdge[] = []
        for (const e0 of clone.edges) {
          const nf = idMap.get(e0.from)
          const nt = idMap.get(e0.to)
          if (nf && nt) {
            newEdges.push({
              id: crypto.randomUUID?.() ?? `e_${Math.random().toString(36).slice(2)}`,
              from: nf,
              to: nt,
              label: e0.label
            })
          }
        }
        clone.edges.push(...newEdges)

        clone.updatedAt = new Date().toISOString()
        setModel(clone)

        const newSel = new Set(idMap.values())
        setSelectedSet(newSel)
        setSelected(newSel.values().next().value ?? null)
      }
    }
    const ku = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [selectedSet, model, isTrial])

  // export/import
  function handleExport() {
    if (!model) return
    const json = JSON.stringify(model, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flow-${model.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function handleImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as FlowModel
        if (!model) return
        // em trial: se arquivo importado exceder limite → bloqueia e sugere upgrade
        if (isTrial) {
          const count = (parsed.nodes || []).filter(n => n.kind === 'message').length
          if (count > FREE_LIMITS.flowMessageNodes) {
            openUpgrade('flow')
            window.alert(`O fluxo importado possui ${count} mensagens e excede o limite do plano grátis (${FREE_LIMITS.flowMessageNodes}).`)
            return
          }
        }
        const next: FlowModel = {
          ...model,
          nodes: Array.isArray(parsed.nodes) ? parsed.nodes : model.nodes,
          edges: Array.isArray(parsed.edges) ? parsed.edges : model.edges,
          updatedAt: new Date().toISOString(),
        }
        setModel(next)
        // nudge 80% após import
        if (isTrial) {
          const used = countMessageNodes(next)
          if (nearLimit(used, FREE_LIMITS.flowMessageNodes) && shouldNudgeOnce('flow_80_import')) {
            openUpgrade('flow')
          }
        }
        window.alert('Flow importado (não esqueça de salvar).')
      } catch {
        window.alert('JSON inválido.')
      }
    }
    reader.readAsText(file)
  }
  const importInputRef = useRef<HTMLInputElement | null>(null)

  // simulador
  function outgoing(nodeId: string): FlowEdge[] {
    return model?.edges.filter((e: FlowEdge) => e.from === nodeId) ?? []
  }
  function simStart() {
    if (!model) return
    const s = model.nodes.find((n: FlowNode) => n.kind === 'start')
    if (!s) { window.alert('Adicione um nó de início para simular.'); return }
    setSimNodeId(s.id)
    setSimPath([s.id])
    setSimOpen(true)
  }
  function simNext(edgeToId?: string) {
    if (!model || !simNodeId) return
    const outs = outgoing(simNodeId)
    if (outs.length === 0) { setSimOpen(false); return }
    const to = edgeToId ?? outs[0].to
    setSimNodeId(to)
    setSimPath(p => [...p, to])
  }
  function currentNode(): FlowNode | null {
    if (!model || !simNodeId) return null
    return model.nodes.find((n: FlowNode) => n.id === simNodeId) ?? null
  }

  if (!model) return null

  // minimapa (todas as variáveis são usadas)
  const MINI_W = 200
  const MINI_H = (CANVAS_H / CANVAS_W) * MINI_W
  const miniScale = MINI_W / CANVAS_W
  const viewX = (-pan.x / scale) * miniScale
  const viewY = (-pan.y / scale) * miniScale
  const viewW = (vp.w / scale) * miniScale
  const viewH = (vp.h / scale) * miniScale

  function onMiniClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cx = mx / miniScale
    const cy = my / miniScale
    const targetX = cx - (vp.w / scale) / 2
    const targetY = cy - (vp.h / scale) / 2
    setPan({ x: -targetX * scale, y: -targetY * scale })
  }

  // uso atual p/ barra na toolbar
  const flowMsgUsed = countMessageNodes(model)
  const flowMsgLimit = FREE_LIMITS.flowMessageNodes
  const flowPct = Math.min(100, Math.round((flowMsgUsed / Math.max(1, flowMsgLimit)) * 100))
  const flowColor = flowPct >= 100 ? 'bg-red-500' : flowPct >= 80 ? 'bg-yellow-400' : 'bg-green-500'

  return (
    <div className="rounded-xl border border-green-500/20 bg-gray-950 overflow-hidden">
      {/* Toolbar superior */}
      <div className="flex items-center justify-between border-b border-green-500/20 bg-gray-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="rounded-lg border border-green-500/30 px-2 py-1 text-sm hover:bg-green-500/10">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-400 w-16 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="rounded-lg border border-green-500/30 px-2 py-1 text-sm hover:bg-green-500/10">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={zoomReset} className="rounded-lg border border-green-500/30 px-2 py-1 text-sm hover:bg-green-500/10">
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="ml-4 flex items-center gap-2">
            <button onClick={handleExport} className="rounded-lg border border-green-500/30 px-2 py-1 text-sm hover:bg-green-500/10">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => importInputRef.current?.click()} className="rounded-lg border border-green-500/30 px-2 py-1 text-sm hover:bg-green-500/10">
              <Upload className="h-4 w-4" />
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.currentTarget.value = '' }}
            />
          </div>

          <div className="ml-4">
            <button
              onClick={simStart}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
            >
              <PlayCircle className="h-4 w-4" /> Simular
            </button>
          </div>
        </div>

        {/* Indicadores */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-gray-400">Mensagens do fluxo:</span>
            <div className="w-36 h-2 rounded bg-gray-800 overflow-hidden">
              <div className={`h-2 ${flowColor}`} style={{ width: `${flowPct}%` }} />
            </div>
            <span className="text-xs text-gray-300">{flowMsgUsed}/{flowMsgLimit}</span>
            {flowPct >= 80 && (
              <TriangleAlert className={`h-4 w-4 ${flowPct >= 100 ? 'text-red-400' : 'text-yellow-400'}`} />
            )}
          </div>

          <div className="text-xs text-gray-400">
            Nós: {model.nodes.length} • Arestas: {model.edges.length} • Atualizado: {new Date(model.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
          >
            <Save className="h-4 w-4" /> Salvar
          </button>
          <button
            onClick={() => nav('/dashboard/flows')}
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-200 hover:bg-green-500/10"
          >
            <Trash2 className="h-4 w-4 text-gray-400" /> Fechar
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-230px)]">
        <FlowPalette onAdd={onAdd} />

        {/* CANVAS */}
        <div
          ref={canvasRef}
          className="relative flex-1 overflow-auto bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_1px,transparent_1px)]"
          style={{ backgroundSize: '16px 16px' }}
          onMouseMove={(e) => { onMouseMove(e); onMouseMoveCanvas(e) }}
          onMouseUp={() => { onMouseUp(); onMouseUpCanvas() }}
          onMouseLeave={() => { onMouseUp(); onMouseUpCanvas() }}
          onClick={handleCanvasClick}
          onWheel={onWheel}
          onMouseDown={onMouseDownCanvas}
        >
          <div
            ref={contentRef}
            className="relative"
            style={{
              width: CANVAS_W, height: CANVAS_H,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Arestas */}
            <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
              {model.edges.map((e: FlowEdge) => {
                const from = model.nodes.find((n: FlowNode) => n.id === e.from)!
                const to = model.nodes.find((n: FlowNode) => n.id === e.to)!
                const x1 = from.x + NODE_W / 2
                const y1 = from.y + NODE_H / 2
                const x2 = to.x + NODE_W / 2
                const y2 = to.y + NODE_H / 2
                return (
                  <g key={e.id}>
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="rgb(74,222,128)" />
                      </marker>
                    </defs>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="rgb(74,222,128)" strokeWidth="2"
                      markerEnd="url(#arrow)"
                      opacity={0.85}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Hotspots das arestas */}
            {model.edges.map((e: FlowEdge) => {
              const from = model.nodes.find((n: FlowNode) => n.id === e.from)!
              const to = model.nodes.find((n: FlowNode) => n.id === e.to)!
              const mx = (from.x + NODE_W / 2 + to.x + NODE_W / 2) / 2
              const my = (from.y + NODE_H / 2 + to.y + NODE_H / 2) / 2
              return (
                <div
                  key={e.id}
                  className="absolute pointer-events-auto"
                  style={{ left: mx, top: my, transform: 'translate(-50%, -50%)' }}
                >
                  <button
                    className="rounded-full border border-green-500/40 bg-black/80 px-2 py-0.5 text-[11px] text-green-200 hover:bg-green-500/10"
                    title="Clique para editar label • Shift+clique para remover"
                    onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
                      evt.stopPropagation()
                      if (evt.shiftKey) handleRemoveEdge(e.id)
                      else handleEdgeLabel(e.id)
                    }}
                  >
                    {e.label?.trim() || '●'}
                  </button>
                </div>
              )
            })}

            {/* Nós */}
            {model.nodes.map((n: FlowNode) => {
              const isSel = selectedSet.has(n.id)
              return (
                <div
                  key={n.id}
                  className={`absolute select-none rounded-xl border p-2 shadow-sm ${isSel ? 'border-green-400 bg-black' : 'border-green-500/30 bg-black/70'}`}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H, cursor: spaceDown ? 'grab' : 'move' }}
                  onMouseDown={(e: React.MouseEvent) => onMouseDownNode(e, n.id)}
                  onClick={(e: React.MouseEvent) => onClickNode(n.id, e)}
                >
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <div className="font-semibold">
                      {n.data.label || (n.kind === 'start' ? 'Início' : n.kind === 'message' ? 'Mensagem' : 'Escolha')}
                    </div>
                    <Move className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="mt-2 text-[11px] text-gray-400 line-clamp-3">
                    {n.kind === 'message' && (n.data.text ?? 'Texto da mensagem...')}
                    {n.kind === 'choice' && (n.data.options ?? []).join(' | ')}
                    {n.kind === 'start' && 'Nó de início do fluxo'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Minimapa */}
          <div
            className="absolute right-3 bottom-3 rounded-lg border border-green-500/30 bg-black/70 p-2"
            onClick={onMiniClick}
            style={{ width: MINI_W + 8, userSelect: 'none' }}
          >
            <div className="relative" style={{ width: MINI_W, height: MINI_H }}>
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_1px,transparent_1px)]"
                style={{ backgroundSize: '10px 10px' }}
              />
              {model.nodes.map((n: FlowNode) => (
                <div
                  key={n.id}
                  className="absolute rounded-sm bg-green-500/70"
                  style={{
                    left: n.x * miniScale,
                    top: n.y * miniScale,
                    width: NODE_W * miniScale,
                    height: NODE_H * miniScale,
                    opacity: selectedSet.has(n.id) ? 0.9 : 0.6,
                  }}
                />
              ))}
              <div
                className="absolute border border-yellow-400/70"
                style={{
                  left: viewX,
                  top: viewY,
                  width: viewW,
                  height: viewH,
                  background: 'rgba(250,204,21,0.08)',
                }}
              />
            </div>
          </div>
        </div>

        <NodeConfigPanel
          node={selectedNode}
          onChange={(patch) => onChangeNode(patch)}
          onDelete={onDeleteNode}
        />
      </div>

      {/* Barra inferior */}
      <div className="flex items-center justify-between border-t border-green-500/20 bg-gray-900 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          {selected && (
            <>
              <button
                onClick={beginLink}
                className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-gray-200 hover:bg-green-500/10"
                title="Conectar: clique depois em outro nó"
              >
                <Link2 className="h-4 w-4 text-green-400" /> Conectar
              </button>
              {linkFrom && (
                <button
                  onClick={cancelLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
                >
                  <Unlink className="h-4 w-4" /> Cancelar conexão
                </button>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-gray-400">
          Shift/Ctrl/⌘ + clique para multi-seleção • Segure <kbd className="px-1 rounded border border-gray-600 text-[10px]">Espaço</kbd> para mover o canvas • Ctrl/⌘ + Scroll para zoom • Del exclui nó • Ctrl/⌘ + C / V copia/cola
        </div>

        <div />
      </div>

      {/* Simulador */}
      {simOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSimOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-green-500/30 bg-gray-950 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Simulador do Fluxo</div>
              <button className="text-xs text-gray-400 hover:text-green-300" onClick={() => setSimOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="text-xs text-gray-400 mb-3">Caminho: {simPath.join(' → ')}</div>

            {(() => {
              const n = currentNode()
              if (!n) return <div className="text-sm text-gray-300">Fim.</div>
              const outs = outgoing(n.id)

              return (
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-green-300 font-semibold mb-1">
                      {n.data.label || (n.kind === 'start' ? 'Início' : n.kind === 'message' ? 'Mensagem' : 'Escolha')}
                    </div>
                    {n.kind === 'message' && (
                      <div className="text-gray-200 whitespace-pre-wrap">{n.data.text ?? '(sem texto)'}</div>
                    )}
                    {n.kind === 'start' && (
                      <div className="text-gray-400">Nó inicial. Continue para próximo passo.</div>
                    )}
                    {n.kind === 'choice' && (
                      <div className="text-gray-200">Escolha uma opção:</div>
                    )}
                  </div>

                  {n.kind !== 'choice' && (
                    <div className="flex items-center gap-2">
                      {outs.length > 0 ? (
                        <button
                          onClick={() => simNext()}
                          className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-green-400"
                        >
                          Próximo
                        </button>
                      ) : (
                        <button
                          onClick={() => setSimOpen(false)}
                          className="rounded-lg border border-green-500/30 px-3 py-1.5 text-sm text-gray-200 hover:bg-green-500/10"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  )}

                  {n.kind === 'choice' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(n.data.options ?? []).map((opt: string, idx: number) => {
                        const edge = outs[idx]
                        return (
                          <button
                            key={idx}
                            disabled={!edge}
                            onClick={() => edge && simNext(edge.to)}
                            className="rounded-lg border border-green-500/30 px-3 py-2 text-sm text-left hover:bg-green-500/10 disabled:opacity-50"
                          >
                            {opt || `Opção ${idx + 1}`}
                          </button>
                        )
                      })}
                      {outs.length === 0 && <div className="text-xs text-red-300">Nenhuma saída configurada.</div>}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
