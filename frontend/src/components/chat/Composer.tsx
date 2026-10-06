import { useRef } from 'react'
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
  /** 仅措辞提醒可在确认后继续发送。 */
  onSendAnyway: () => void
  发送锁定?: string
  /** 本轮处置清单。 */
  round: Disposition[]
  /** 这一屏还没有任何事发生过 —— 处置清单改用将来式，见 `RoundPanel.待确认`。 */
  待确认?: boolean
  /** 「客服点发送」那条已经发出去了 —— 清单上念「已发送」，见 `RoundPanel.已发本轮`。 */
  已发本轮?: boolean
}

/**
 * 输入区固定高度；确认框通过 CSS 绝对定位贴在输入区上方，不挤动聊天/输入区。
 * 优先级：转交锁定 > 事实冲突 > 措辞提醒，同一时刻只显示最高级提示。
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
  发送锁定,
  round,
  待确认,
  已发本轮,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const disabled = !value.trim() || Boolean(guard || 冲突 || 发送锁定)
  return (
    <div className="primer-composer-host shrink-0 border-t border-line bg-panel">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            if (!disabled) onSend()
          }
        }}
        placeholder="请输入消息，Enter 发送，Shift + Enter 换行"
        rows={3}
        className="scrollbar-thin block w-full resize-none px-3 py-2 text-xs leading-relaxed outline-none placeholder:text-ink-4"
      />

      {发送锁定 ? <div role="status" className="primer-confirm primer-confirm-fact primer-float-in rounded-[18px] border border-white/90 bg-risk-soft p-3 text-xs text-risk-ink shadow-lg">{发送锁定}</div> : null}
      {guard && !冲突 && !发送锁定 ? <GuardBar hit={guard} onReplace={onReplace} onSendAnyway={onSendAnyway} /> : null}

      {冲突 && !发送锁定 ? <ConflictBar 冲突={冲突} onReplace={onFixConflict} onEdit={() => inputRef.current?.focus()} /> : null}

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
          disabled={disabled}
          title={发送锁定 ?? (冲突 ? '事实不一致，请修改后发送' : guard ? '请在提醒中确认后发送' : undefined)}
          className="rounded bg-brand px-4 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-ink-4"
        >
          发送
        </button>
      </div>

      <RoundPanel items={round} 待确认={待确认} 已发本轮={已发本轮} />
    </div>
  )
}
