import { PackageCheck, TriangleAlert } from 'lucide-react'

import type { 交接包, 交接包态 } from '../../data/交接包'

/** 状态徽标。转交是红的（对话出去了），报备是琥珀（还在我手里）。 */
const 徽标: Record<交接包态, string> = {
  等待审批: 'border-hold-line bg-hold-soft text-hold-ink',
  已完成: 'border-line-soft bg-canvas text-ink-2',
  已转出: 'border-risk-line bg-risk-soft text-risk-ink',
}

/**
 * 交接包 —— 报备／转交时自动带全的那张单。
 *
 * **为什么值得单独一块。** 主卡上是「要不要报备」；这张单是「报备了什么」。
 * 客服点完［一键报备］，话就说完了 —— 但那句话凭什么说得出口、组长批之前
 * 要看什么，得有地方摆着。顾客 B 那条转交的线更明显：对话都要交出去了，
 * 接手的人手上不能只有一段聊天记录。
 *
 * 放在主卡**下面**：先有结论（报什么），再有依据（报的是什么）。
 *
 * 内容全是算出来的，这儿只管画 —— 怎么算的见 `建交接包`。
 */
export default function HandoverPacket({ packet }: { packet: 交接包 }) {
  return (
    <section className="rounded-md border border-line bg-panel">
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-xs font-medium text-ink">
          <PackageCheck size={13} className="text-ink-3" />
          交接包 · 自动生成
        </h2>
        <span className={`rounded-full border px-2 py-0.5 text-note ${徽标[packet.状态]}`}>
          {packet.状态}
        </span>
      </header>

      <div className="border-t border-line-soft">
        {packet.行.map((行) => (
          <div
            key={行.标签}
            className="flex gap-2 border-b border-line-soft px-3 py-1.5 last:border-b-0"
          >
            <span className="w-18 shrink-0 text-note leading-relaxed text-ink-4">{行.标签}</span>
            <span className="text-body leading-relaxed text-ink">{行.值}</span>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 border-t border-line-soft bg-canvas px-3 py-1.5 text-note text-ink-3">
        <TriangleAlert size={11} className="shrink-0 text-ink-4" />
        单号 {packet.单号} · 客服零填写
      </p>
    </section>
  )
}
