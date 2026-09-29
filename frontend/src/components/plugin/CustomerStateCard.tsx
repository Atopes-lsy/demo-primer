import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import type { StateRow } from '../../types'

/** 默认展开的行数。规格 §1.3：只显示「这是谁」「这次要什么」，避免给客服堆信息。 */
const 默认展开 = 2

type Props = {
  rows: StateRow[]
}

/**
 * 「顾客情况」细栏，永远在右栏最上面。
 *
 * 暗箱内部始终维护全部五行，界面按需折叠 —— 前面两行决定客服怎么开口，
 * 后面三行（答应过什么／办过什么／这单）是判逾期和防重复用的，要用才展开。
 */
export default function CustomerStateCard({ rows }: Props) {
  const [expanded, setExpanded] = useState(false)

  const 可见 = expanded ? rows : rows.slice(0, 默认展开)
  const 折叠数 = rows.length - 默认展开

  return (
    <section className="rounded-md border border-line bg-panel">
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-medium text-ink">顾客情况</h2>
        <span className="text-note text-ink-4">每条消息都重读</span>
      </header>

      <div className="border-t border-line-soft">
        {可见.map((row) => (
          <div key={row.标签} className="border-b border-line-soft px-3 py-2 last:border-b-0">
            <p className="text-note tracking-wide text-ink-4">{row.标签}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink">{row.值}</p>
            {row.备注 ? (
              <p className="mt-0.5 text-body leading-relaxed text-ink-3">{row.备注}</p>
            ) : null}
            {row.警示 ? (
              <p className="mt-0.5 text-body font-medium text-danger">⚠ {row.警示}</p>
            ) : null}
          </div>
        ))}
      </div>

      {折叠数 > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1 border-t border-line-soft py-1.5 text-body text-ink-3 hover:bg-canvas hover:text-ink-2"
        >
          {expanded ? (
            <>
              <ChevronDown size={12} />
              收起
            </>
          ) : (
            <>
              <ChevronRight size={12} />
              展开其余 {折叠数} 行
            </>
          )}
        </button>
      ) : null}
    </section>
  )
}
