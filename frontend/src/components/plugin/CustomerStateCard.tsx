import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import type { StateRow, 以前会话 } from '../../types'

/** 默认展开的行数。规格 §1.3：只显示「这是谁」「这次要什么」，避免给客服堆信息。 */
const 默认展开 = 2

type Props = {
  rows: StateRow[]
  /**
   * 更早几次来访（`Session.以前`）。**不给 ≠ 没有，这两件事必须分得开。**
   *
   * - `undefined` —— 这一份不是接口给的（两条演示线的剧本兜底，`剧本.ts` 里
   *   根本没写这个字段）→ 整块**不渲染**；
   * - `[]` —— 接口明说这位没有更早的来访 → 渲染「无」。
   *
   * 写成 `以前?.length ? … : null` 就把两者混成一个了：两条演示线的卡片会
   * 凭空多出一块「无」，而它们展示什么、以后还得展示什么，是定死的。
   */
  以前?: 以前会话[]
}

/**
 * 带 `警示` 的行**无视折叠，永远露出来**。
 *
 * 逾期那一行（`答应过什么`）平时是折在底下的；一旦比出天数，它得自己冒头 ——
 * 演示到「逾期浮出来」那一拍，右栏要在没有点击的情况下多出一行红字，这就是
 * 那一拍的全部内容（脚本 S9「自动展开」）。
 *
 * 判据取 `警示` 而不是「标签等于答应过什么」：警示在哪儿，哪儿就是这一轮的要害；
 * 写着标签的话，将来「不良反应」那行要报警就得回来改这个函数。
 */
function 必须可见(row: StateRow): boolean {
  return Boolean(row.警示)
}

/**
 * 「顾客情况」细栏，永远在右栏最上面。
 *
 * 暗箱内部始终维护全部五行，界面按需折叠 —— 前面两行决定客服怎么开口，
 * 后面三行（答应过什么／办过什么／这单）是判逾期和防重复用的，要用才展开。
 */
export default function CustomerStateCard({ rows, 以前 }: Props) {
  const [expanded, setExpanded] = useState(false)

  const 后段 = rows.slice(默认展开)
  const 折叠的 = expanded ? [] : 后段.filter((r) => !必须可见(r))
  const 可见 = expanded ? rows : [...rows.slice(0, 默认展开), ...后段.filter(必须可见)]

  return (
    <section className="rounded-md border border-line bg-panel">
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-medium text-ink">顾客情况</h2>
        <span className="text-note text-ink-4">每条消息都重读</span>
      </header>

      {/* 「以前来过」—— 更早几次来访的总结，摆在五行**上面**。

          位置是刻意的：这五行（尤其「答应过什么」「办过什么」）本来就是**以前的
          会话攒出来的**，先给出来源，底下那几行的「历史」才有出处。

          判据是 `以前` 本身，**不是 `以前.length`** —— 理由见 `Props.以前`。 */}
      {以前 ? (
        <div className="border-t border-line-soft bg-canvas px-3 py-2">
          <p className="text-note tracking-wide text-ink-4">以前来过</p>
          {以前.length === 0 ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-3">无</p>
          ) : (
            <div className="mt-1 space-y-1.5">
              {以前.map((次) => (
                <div key={`${次.日期}-${次.工单号 ?? ''}`}>
                  <p className="text-xs leading-relaxed text-ink">
                    {次.日期} · {次.要什么}
                  </p>
                  {次.办过什么 ? (
                    <p className="mt-0.5 text-body leading-relaxed text-ink-3">
                      {次.办过什么}
                      {/* 号挂在句尾而不是另起一行：专家回头找单子靠的是它，
                          但它不是这一块的正文。 */}
                      {次.工单号 ? ` · ${次.工单号}` : ''}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

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

      {/* 折叠条**点名**折了哪几行，不写「展开其余 N 行」——「2 行」说了等于没说，
          台下不知道被藏起来的是什么。点名之后，客服不点开也知道底下有「办过什么」
          和「这单」，而这两行恰恰是判逾期和防重复要用的。 */}
      {折叠的.length > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-1 border-t border-line-soft px-3 py-1.5 text-body text-ink-3 hover:bg-canvas hover:text-ink-2"
        >
          <ChevronRight size={12} className="shrink-0" />
          <span className="truncate">{折叠的.map((r) => r.标签).join(' · ')}</span>
          <span className="shrink-0 text-ink-4">（已折叠 {折叠的.length} 条）</span>
        </button>
      ) : null}

      {expanded && rows.length > 默认展开 ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex w-full items-center justify-center gap-1 border-t border-line-soft py-1.5 text-body text-ink-3 hover:bg-canvas hover:text-ink-2"
        >
          <ChevronDown size={12} />
          收起
        </button>
      ) : null}
    </section>
  )
}
