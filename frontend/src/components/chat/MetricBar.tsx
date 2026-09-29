import { ChevronDown, Store } from 'lucide-react'
import { useState } from 'react'

import type { Agent, ShopMetric } from '../../types'

type Props = {
  agent: Agent
  metrics: ShopMetric[]
}

/** 聊天区顶部：店铺切换 + 当日指标。 */
export default function MetricBar({ agent, metrics }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? metrics : metrics.slice(0, 8)

  return (
    <header className="flex h-11 shrink-0 items-center gap-4 border-b border-line bg-panel px-3">
      <button
        type="button"
        className="flex shrink-0 items-center gap-1.5 rounded px-1.5 py-1 text-xs font-medium text-ink hover:bg-canvas"
      >
        <Store size={14} className="text-brand" />
        {agent.店铺}
        <ChevronDown size={12} className="text-ink-3" />
      </button>

      <div className="scrollbar-thin flex flex-1 items-center gap-4 overflow-x-auto">
        {visible.map((m) => (
          <div key={m.标签} className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <span className="text-body text-ink-3">{m.标签}</span>
            <span
              className={`text-xs font-medium ${
                m.强调 === 'up'
                  ? 'text-success'
                  : m.强调 === 'down'
                    ? 'text-danger'
                    : 'text-ink'
              }`}
            >
              {m.数值}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex shrink-0 items-center gap-0.5 text-body text-brand hover:underline"
      >
        {expanded ? '收起' : '展开'}
        <ChevronDown size={12} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
    </header>
  )
}
