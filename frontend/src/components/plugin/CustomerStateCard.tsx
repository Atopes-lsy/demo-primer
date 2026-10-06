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
   * **它不再往界面上渲染任何东西**（2026-10-04 撤掉了「以前来过」那一块）——
   * 留着的唯一用途是判「初次会话」：
   *
   * - `undefined` —— 这一份不是接口给的（两条演示线的剧本兜底，`剧本.ts` 里
   *   根本没写这个字段）→ 当老客演，五行正常出；
   * - `[]` —— 接口明说这位没有更早的来访 → 换成「初次会话」，五行一并收起，
   *   **直到这次联系结束**（那个判据在 `已结束`）。
   *
   * 判法得是 `以前?.length === 0` 这种**只在空数组那一支成立**的写法。写成
   * `!以前?.length` 之类就把两者混成一个了：两条演示线的卡片会凭空变成
   * 「初次会话」，而它们展示什么、以后还得展示什么，是定死的。
   */
  以前?: 以前会话[]
  /**
   * 这次联系结束了没有 —— 由调用方用 `会话已结束()` 算好。
   *
   * **传布尔值而不是 `stage`**：`stage → 结束` 那个映射只该有一处，卡片不需要
   * 知道世界上还有「排队中」这回事。
   *
   * 它唯一的作用就是**把「初次会话」那一态放走**：结束之后，这位顾客的这一次
   * 来访也成了历史，卡片该说得出「办了什么事」，不能一直停在「我们还不认识
   * 他」。所以结束态 = 改前的老样子。
   */
  已结束: boolean
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
 *
 * 「暗箱内部始终维护全部五行」有一处例外：「初次会话」那一态五行一条都不渲染
 * （`初次`）。那是**整块换掉**，不是折叠 —— 折叠条和收起键一并消失，因为这时候
 * 底下没有东西可折。
 *
 * **更早的来访不单独成块**（2026-10-04 撤掉「以前来过」）：那几次只用来**填这
 * 五行** —— 「这是谁」的备注、「答应过什么」扫的都是整个窗口的消息。块里原先
 * 独占的两样（每次来访的「要什么」原话、**前几段那几张工单号**）从此不在界面上，
 * 只留在 `GET /api/会话列表` 的返回里。
 */
export default function CustomerStateCard({ rows, 以前, 已结束 }: Props) {
  const [expanded, setExpanded] = useState(false)

  // 「初次会话」：接口明说这位没有更早的来访，而这次联系还没结束。
  //
  // 这时候五行是**算出来了的、只是不说** —— 它们讲的都是「以前」：这是谁干过
  // 什么、答应过什么、办过什么。一位头回上门的顾客，这些格子空着才是实话；
  // 硬填上「无」只是把「我们还没有他的历史」翻译成了五行术语。所以整块换成
  // 一句人话，五行一条都不渲染。
  //
  // 结束之后就不是初次了：这一次来访本身成了历史，五行里有真东西可说
  // （见 `Props.已结束`）。
  const 初次 = 以前?.length === 0 && !已结束
  const 只有空历史 =
    初次 && rows.every((row) => !row.值 || row.值 === '无' || row.值.startsWith('没有'))

  const 后段 = rows.slice(默认展开)
  const 折叠的 = expanded ? [] : 后段.filter((r) => !必须可见(r))
  const 可见 = expanded ? rows : [...rows.slice(0, 默认展开), ...后段.filter(必须可见)]

  return (
    <section className="primer-surface-in overflow-hidden rounded-[20px] border border-white/90 bg-panel/90 shadow-[0_8px_24px_-14px_rgba(46,51,56,0.2)] backdrop-blur-xl">
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="text-base font-semibold text-ink">顾客情况</h2>
        <span className="text-body text-ink-3">每条消息都重读</span>
      </header>

      {只有空历史 ? (
        <p className="border-t border-line-soft px-3 py-2 text-xs leading-relaxed text-ink-3">
          初次会话
        </p>
      ) : (
        <>
          {/* 更早的来访**不在这儿露脸**（2026-10-04 拍的）—— 它们只用来填底下
              这五行，`以前` 除了判「初次会话」什么都不干，见 `Props.以前`。 */}
          <div className="border-t border-line-soft">
            {可见.map((row) => (
              <div key={row.标签} className="border-b border-line-soft px-3 py-2 last:border-b-0">
                <p className="text-body font-medium text-ink-3">{row.标签}</p>
                {/* **值只占一行**（2026-10-04）。原来它是随便折行的，而「这次要什么」
                    在这一改里换成了模型拆出来的短需求（` ＋ ` 连起来），那条规矩的
                    一半就是「控制在一行以内」—— 一行宽是这一栏的排版前提，
                    折叠条的算法、下面几行的位置都按它排。

                    多出来的部分用省略号收掉，**不是没有**：`title` 上挂着全文，
                    悬停看得到。省略号本身也是提示 —— 值被截断了这件事得看得见，
                    不然「模型少拆了一条」和「屏幕不够宽」长得一模一样。

                    ⚠️ 这一条对**所有行**生效，不只是「这次要什么」：按标签开特例的话，
                    将来多一行长值就会折行，而折叠条是按行数算的。 */}
                <p
                  className="mt-0.5 truncate text-xs font-medium leading-relaxed text-ink"
                  title={row.值}
                >
                  {row.值}
                </p>
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
        </>
      )}
    </section>
  )
}
