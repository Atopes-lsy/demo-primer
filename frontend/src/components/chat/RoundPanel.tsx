import type { Disposition, OutputKind } from '../../types'

/** 输出类型在「本轮处置」里的说法。主卡显示动词，这里要的是已经发生的状态。 */
const 说法: Record<OutputKind, string> = {
  AI直发: '已由 Primer 自动回复',
  客服点发送: '待你确认后发送',
  报备: '已报备',
  转交: '已转交',
}

/** 每种输出的强调色，和主卡保持一致。 */
const 配色: Record<OutputKind, string> = {
  AI直发: 'text-ai-ink',
  客服点发送: 'text-ink-2',
  报备: 'text-hold-ink',
  转交: 'text-risk-ink',
}

type Props = {
  items: Disposition[]
}

/**
 * 本轮处置清单。
 *
 * 一轮可能拆出多条主张、产出不同输出，主卡只显示最高态。没有这块，客服会
 * 以为 AI 抢了他的活，或者漏做了什么 —— 所以每条主张的处置都要能查到。
 */
export default function RoundPanel({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="border-t border-line-soft bg-canvas px-3 py-2">
      <p className="text-note font-medium text-ink-2">
        本轮处置
        <span className="ml-1 font-normal text-ink-4">
          主卡只显示最高态，其余在这里可查
        </span>
      </p>

      <ul className="mt-1.5 space-y-1">
        {items.map((d) => (
          <li key={d.主张} className="flex items-baseline gap-1.5 text-body">
            <span className="shrink-0 text-ink-4">◆</span>
            <span className="shrink-0 text-ink">{d.主张}</span>
            <span className="shrink-0 text-ink-4">→</span>
            <span className={配色[d.输出]}>{说法[d.输出]}</span>
            {d.说明 ? (
              <span className="truncate text-note text-ink-4">（{d.说明}）</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
