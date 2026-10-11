import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { Crosshair, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KgEdge, KgNode, KgNodeType, KnowledgeGraphData } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface SimNode extends SimulationNodeDatum, Omit<KgNode, 'x' | 'y'> {
  x: number
  y: number
}
type SimLink = SimulationLinkDatum<SimNode> & Omit<KgEdge, 'source' | 'target'>

export const nodeTypeMeta: Record<KgNodeType, { label: string; color: string; softBg: string }> = {
  drug: { label: 'Drug', color: '#158276', softBg: '#D7F2EC' },
  disease: { label: 'Disease', color: '#B91C1C', softBg: '#FEE2E2' },
  protein: { label: 'Protein Target', color: '#0891B2', softBg: '#CFFAFE' },
  gene: { label: 'Gene', color: '#7C3AED', softBg: '#EDE9FE' },
  pathway: { label: 'Pathway', color: '#D97706', softBg: '#FEF3C7' },
  process: { label: 'Biological Process', color: '#64748B', softBg: '#F1F5F9' },
  trial: { label: 'Clinical Trial', color: '#059669', softBg: '#D1FAE5' },
  paper: { label: 'Publication', color: '#2563EB', softBg: '#DBEAFE' },
  adverse: { label: 'Adverse Events', color: '#E11D48', softBg: '#FFE4E6' },
}

const W = 900
const H = 600

function shapeFor(type: KgNodeType): 'hexagon' | 'circle' | 'diamond' | 'square' | 'paperRect' | 'triangle' | 'ringCircle' | 'dashCircle' {
  switch (type) {
    case 'drug':
      return 'hexagon'
    case 'disease':
      return 'circle'
    case 'protein':
      return 'ringCircle'
    case 'gene':
      return 'diamond'
    case 'pathway':
      return 'hexagon'
    case 'process':
      return 'dashCircle'
    case 'trial':
      return 'square'
    case 'paper':
      return 'paperRect'
    case 'adverse':
      return 'triangle'
  }
}

function radiusFor(n: SimNode) {
  const base = n.type === 'drug' ? 34 : n.type === 'disease' ? 32 : n.type === 'pathway' ? 28 : 22
  return base
}

function NodeShape({ node, selected }: { node: SimNode; selected: boolean }) {
  const meta = nodeTypeMeta[node.type]
  const r = radiusFor(node) * 0.62
  const shape = shapeFor(node.type)

  if (shape === 'hexagon') {
    const pts = Array.from({ length: 6 })
      .map((_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6
        return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
      })
      .join(' ')
    return (
      <polygon points={pts} fill={meta.color} opacity={selected ? 1 : 0.92} />
    )
  }
  if (shape === 'diamond') {
    return <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={3} transform={`rotate(45)`} fill={meta.softBg} stroke={meta.color} strokeWidth={2.5} />
  }
  if (shape === 'square') {
    return <rect x={-r * 0.85} y={-r * 0.85} width={r * 1.7} height={r * 1.7} rx={4} fill={meta.softBg} stroke={meta.color} strokeWidth={2.5} />
  }
  if (shape === 'paperRect') {
    return <rect x={-r} y={-r * 0.72} width={r * 2} height={r * 1.44} rx={3} fill={meta.softBg} stroke={meta.color} strokeWidth={2.5} />
  }
  if (shape === 'triangle') {
    const pts = `0,${-r} ${r * 0.95},${r * 0.72} ${-r * 0.95},${r * 0.72}`
    return <polygon points={pts} fill={meta.softBg} stroke={meta.color} strokeWidth={2.5} strokeLinejoin="round" />
  }
  if (shape === 'ringCircle') {
    return <circle r={r} fill="#fff" stroke={meta.color} strokeWidth={5} />
  }
  if (shape === 'dashCircle') {
    return <circle r={r} fill={meta.softBg} stroke={meta.color} strokeWidth={2} strokeDasharray="4 3" />
  }
  return <circle r={r} fill={meta.softBg} stroke={meta.color} strokeWidth={2.5} />
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface Props {
  data: KnowledgeGraphData
  focusNodeId?: string
  className?: string
}

export function KnowledgeGraph({ data, focusNodeId, className }: Props) {
  const [, setRenderTick] = useState(0)
  const rerender = useCallback(() => setRenderTick((t) => t + 1), [])
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])
  const [ready, setReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(focusNodeId ?? null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const draggingRef = useRef<string | null>(null)
  const panningRef = useRef<{ px: number; py: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Build simulation once per dataset
  useEffect(() => {
    const simNodes: SimNode[] = data.nodes.map((n, i) => ({
      ...n,
      x: W / 2 + Math.cos((i / data.nodes.length) * Math.PI * 2) * 220,
      y: H / 2 + Math.sin((i / data.nodes.length) * Math.PI * 2) * 160,
      ...(n.type === 'drug' ? { fx: W / 2, fy: H / 2 } : {}),
    }))
    const simLinks: SimLink[] = data.edges.map((e) => ({ ...e }))

    const sim = forceSimulation<SimNode, SimLink>(simNodes)
      .force('charge', forceManyBody().strength(-420))
      .force('center', forceCenter(W / 2, H / 2))
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(130)
          .strength(0.35),
      )
      .force('collide', forceCollide<SimNode>().radius((d) => radiusFor(d as SimNode) + 14))
      .stop()

    for (let i = 0; i < 340; i++) sim.tick()
    nodesRef.current = simNodes
    linksRef.current = simLinks
    sim.stop()
    setReady(true)
    return () => {
      sim.stop()
    }
  }, [data])

  const nodes = ready ? nodesRef.current : []
  const links = ready ? linksRef.current : []

  const selected = nodes.find((n) => n.id === selectedId) ?? null
  const neighborIds = (() => {
    const s = new Set<string>()
    if (!selectedId) return s
    links.forEach((l) => {
      const sid = String(typeof l.source === 'object' ? l.source.id : l.source)
      const tid = String(typeof l.target === 'object' ? l.target.id : l.target)
      if (sid === selectedId) s.add(tid)
      if (tid === selectedId) s.add(sid)
    })
    return s
  })()

  /* ---------------- interactions ---------------- */

  const toSvgCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      const sx = ((clientX - rect.left) / rect.width) * W
      const sy = ((clientY - rect.top) / rect.height) * H
      return { x: (sx - view.x) / view.k, y: (sy - view.y) / view.k }
    },
    [view],
  )

  function handleNodePointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    draggingRef.current = id
    const node = nodes.find((n) => n.id === id)
    if (node && e.shiftKey) {
      node.fx = undefined
      node.fy = undefined
    }
    setSelectedId(id)
  }

  function handleNodePointerMove(e: React.PointerEvent) {
    const id = draggingRef.current
    if (!id) return
    const { x, y } = toSvgCoords(e.clientX, e.clientY)
    const node = nodesRef.current.find((n) => n.id === id)
    if (node) {
      node.x = x
      node.y = y
      node.fx = x
      node.fy = y
      rerender()
    }
  }

  function handleNodePointerUp() {
    draggingRef.current = null
  }

  function handleBackgroundPointerDown(e: React.PointerEvent) {
    panningRef.current = { px: e.clientX, py: e.clientY }
  }

  function handleBackgroundPointerMove(e: React.PointerEvent) {
    if (!panningRef.current || draggingRef.current) return
    const dx = (e.clientX - panningRef.current.px) * view.k * (W / (svgRef.current?.getBoundingClientRect().width ?? W))
    const dy = (e.clientY - panningRef.current.py) * view.k * (H / (svgRef.current?.getBoundingClientRect().height ?? H))
    panningRef.current = { px: e.clientX, py: e.clientY }
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }

  function handleBackgroundPointerUp() {
    panningRef.current = null
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.12 : 0.89
    setView((v) => ({ ...v, k: Math.min(2.4, Math.max(0.45, v.k * factor)) }))
  }

  function zoomBy(f: number) {
    setView((v) => ({ ...v, k: Math.min(2.4, Math.max(0.45, v.k * f)) }))
  }

  function resetView() {
    setView({ x: 0, y: 0, k: 1 })
  }

  const dimUnrelated = !!selectedId

  return (
    <div className={cn('grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]', className)}>
      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-slate-50 to-cyan-50/40 shadow-soft">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-[520px] w-full cursor-grab touch-none select-none active:cursor-grabbing"
          role="application"
          aria-label="Biomedical knowledge graph"
          onPointerDown={handleBackgroundPointerDown}
          onPointerMove={(e) => {
            handleBackgroundPointerMove(e)
            handleNodePointerMove(e)
          }}
          onPointerUp={() => {
            handleBackgroundPointerUp()
            handleNodePointerUp()
          }}
          onPointerLeave={() => {
            handleBackgroundPointerUp()
            handleNodePointerUp()
          }}
          onWheel={handleWheel}
          onClick={() => setSelectedId(null)}
        >
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {/* Edges */}
            {links.map((l, i) => {
              const sid = typeof l.source === 'object' ? l.source.id : l.source
              const tid = typeof l.target === 'object' ? l.target.id : l.target
              const s = nodes.find((n) => n.id === sid)
              const t = nodes.find((n) => n.id === tid)
              if (!s || !t) return null
              const active = selectedId && (sid === selectedId || tid === selectedId)
              const faded = dimUnrelated && !active
              return (
                <g key={`${sid}-${tid}-${i}`} opacity={faded ? 0.12 : 1}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={active ? '#158276' : '#B8C4D2'}
                    strokeWidth={active ? 2.4 : 1.4}
                  />
                  {(active || view.k > 1.4) && (
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 5}
                      textAnchor="middle"
                      fontSize={10.5}
                      fill={active ? '#12695F' : '#94A3B8'}
                      fontWeight={active ? 700 : 500}
                      paintOrder="stroke"
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {l.relation} · {l.evidenceCount}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const meta = nodeTypeMeta[n.type]
              const isSelected = n.id === selectedId
              const isNeighbor = neighborIds.has(n.id)
              const faded = dimUnrelated && !isSelected && !isNeighbor
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  className="cursor-pointer"
                  opacity={faded ? 0.18 : 1}
                  style={{ transition: 'opacity 200ms' }}
                  onPointerDown={(e) => handleNodePointerDown(e, n.id)}
                  onPointerEnter={() => setHoverId(n.id)}
                  onPointerLeave={() => setHoverId(null)}
                >
                  {(isSelected || hoverId === n.id) && (
                    <circle r={radiusFor(n) * 0.62 + 9} fill="none" stroke={meta.color} strokeWidth={1.5} opacity={0.45}>
                      <animate attributeName="opacity" values="0.15;0.55;0.15" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <NodeShape node={n} selected={isSelected} />
                  <text y={radiusFor(n) * 0.62 + 16} textAnchor="middle" fontSize={12} fontWeight={n.type === 'drug' || n.type === 'disease' ? 700 : 500} fill="#334155" paintOrder="stroke" stroke="#fff" strokeWidth={3.5}>
                    {n.label.length > 24 ? `${n.label.slice(0, 22)}…` : n.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* Controls */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          <Button variant="outline" size="icon" onClick={() => zoomBy(1.25)} aria-label="Zoom in" className="bg-surface/95 backdrop-blur">
            <Plus />
          </Button>
          <Button variant="outline" size="icon" onClick={() => zoomBy(0.8)} aria-label="Zoom out" className="bg-surface/95 backdrop-blur">
            <Minus />
          </Button>
          <Button variant="outline" size="icon" onClick={resetView} aria-label="Reset view" className="bg-surface/95 backdrop-blur">
            <Crosshair />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute right-3 top-3 hidden max-w-[190px] rounded-xl border border-line bg-surface/90 p-3 shadow-sm backdrop-blur sm:block">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Node types</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-600">
            {Object.entries(nodeTypeMeta).map(([key, meta]) => (
              <li key={key} className="flex items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label.split(' ')[0]}
              </li>
            ))}
          </ul>
        </div>

        <p className="pointer-events-none absolute bottom-3 right-3 hidden text-[11px] text-slate-400 md:block">
          Drag nodes · scroll to zoom · drag background to pan
        </p>
      </div>

      {/* Inspector panel */}
      <aside className="rounded-2xl border border-line bg-surface shadow-soft" aria-live="polite">
        {selected ? (
          <div className="flex h-full flex-col animate-fade-in">
            <div className="border-b border-line p-5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: nodeTypeMeta[selected.type].softBg, color: nodeTypeMeta[selected.type].color }}
              >
                {nodeTypeMeta[selected.type].label}
              </span>
              <h3 className="mt-2.5 text-lg font-bold leading-snug">{selected.label}</h3>
              <p className="mt-1 text-xs font-semibold text-primary-700">{selected.evidenceCount} sources</p>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
              <p className="text-[13px] leading-relaxed text-mutedfg">{selected.description}</p>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Relationships</p>
                <ul className="space-y-2">
                  {links
                    .filter((l) => {
                      const sid = typeof l.source === 'object' ? l.source.id : l.source
                      const tid = typeof l.target === 'object' ? l.target.id : l.target
                      return sid === selected.id || tid === selected.id
                    })
                    .map((l, i) => {
                      const sid = typeof l.source === 'object' ? l.source.id : l.source
                      const tid = typeof l.target === 'object' ? l.target.id : l.target
                      const other = nodes.find((n) => n.id === (sid === selected.id ? tid : sid))
                      const outgoing = sid === selected.id
                      return other ? (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(other.id)}
                            className="w-full rounded-lg border border-line bg-slate-50/70 p-2.5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50"
                          >
                            <p className="text-[13px] font-medium leading-snug">
                              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">{outgoing ? '→' : '←'} {l.relation}</span>{' '}
                              {other.label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-mutedfg">{other.evidenceCount} sources · {nodeTypeMeta[other.type].label}</p>
                          </button>
                        </li>
                      ) : null
                    })}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <span className="mx-auto mb-3 flex h-full max-h-12 w-12 items-center justify-center self-center rounded-xl bg-primary-50">
              <Crosshair className="size-5 text-primary-600" aria-hidden />
            </span>
            <h3 className="font-semibold">Select a node</h3>
            <p className="mt-1 text-sm leading-relaxed text-mutedfg">
              Click any entity to inspect its relationships, evidence count, and connections within the graph.
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
