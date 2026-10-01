import type { 事实冲突 } from '../../data/事实'
import type { Disposition, GuardHit } from '../../types'
import ConflictBar from './ConflictBar'
import GuardBar from './GuardBar'
import RoundPanel from './RoundPanel'

/** 输入框下方那排文字按钮。顺序与渲染图一致。 */
const 工具 = ['快捷短语', '常用语', '表情']

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  /** 检查一：草稿命中的禁语，为空则那条不出现。 */
  guard: GuardHit | null
  /** 检查一的「一键替换」：把这个禁语换成建议的说法，然后重新校验。 */
  onReplace: () => void
  /** 检查二：草稿和订单记录对不上的地方，为空则红框不出现。 */
  冲突: 事实冲突 | null
  /** 检查二的「一键替换」：整句换成建议的说法（见 `ConflictBar`）。 */
  onFixConflict: () => void
  /** 「仍然发送」：两条检查共用 —— 都是客服拍板照原样发。 */
  onSendAnyway: () => void
  /** 本轮处置清单。 */
  round: Disposition[]
}

/**
 * 中部输入区。自上而下：输入框 → 发送前确认条（检查一、检查二）→ 工具条与
 * 发送 → 本轮处置。
 *
 * 渲染图把确认条画在输入框正下方（规格 §九 写的是「输入框上方」）。这里按渲染图
 * 走 —— 它贴着客服正在打的那句话，视线不用离开。
 *
 * **两条检查都在输入框之下、发送键之上**，顺序是检查一（淡黄）在前、检查二（红）
 * 在后。两条同时命中的情况很少，真撞上时按顺序读下来正好是从轻到重。
 */
export default function Composer({
  value,
  onChange,
  onSend,
  guard,
  onReplace,
  冲突,
  onFixConflict,
  onSendAnyway,
  round,
}: Props) {
  return (
    <div className="shrink-0 border-t border-line bg-panel">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder="请输入消息，Enter 发送，Shift + Enter 换行"
        rows={3}
        className="scrollbar-thin block w-full resize-none px-3 py-2 text-xs leading-relaxed outline-none placeholder:text-ink-4"
      />

      {guard ? <GuardBar hit={guard} onReplace={onReplace} onSendAnyway={onSendAnyway} /> : null}

      {冲突 ? <ConflictBar 冲突={冲突} onReplace={onFixConflict} onSendAnyway={onSendAnyway} /> : null}

      <div className="flex items-center gap-3 border-t border-line-soft px-3 py-1.5">
        {工具.map((t) => (
          <button
            key={t}
            type="button"
            className="text-body text-ink-3 hover:text-brand"
          >
            {t}
          </button>
        ))}

        <span className="ml-auto text-note text-ink-4">Enter 发送 / Shift + Enter 换行</span>

        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="rounded bg-brand px-4 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-ink-4"
        >
          发送
        </button>
      </div>

      <RoundPanel items={round} />
    </div>
  )
}
