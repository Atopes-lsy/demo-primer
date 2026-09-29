import type { Disposition, GuardHit } from '../../types'
import GuardBar from './GuardBar'
import RoundPanel from './RoundPanel'

/** 输入框下方那排文字按钮。顺序与渲染图一致。 */
const 工具 = ['快捷短语', '常用语', '表情']

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  /** 草稿命中的禁语，为空则确认条不出现。 */
  guard: GuardHit | null
  /** 「一键替换」：把草稿换成建议的说法，然后重新校验。 */
  onReplace: () => void
  /** 「仍然发送」：跳过确认直接发。 */
  onSendAnyway: () => void
  /** 本轮处置清单。 */
  round: Disposition[]
}

/**
 * 中部输入区。自上而下：输入框 → 发送前确认条 → 工具条与发送 → 本轮处置。
 *
 * 渲染图把确认条画在输入框正下方（规格 §九 写的是「输入框上方」）。这里按渲染图
 * 走 —— 它贴着客服正在打的那句话，视线不用离开。
 */
export default function Composer({
  value,
  onChange,
  onSend,
  guard,
  onReplace,
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

      <div className="flex items-center gap-3 border-t border-line-soft px-3 py-1.5">
        {工具.map((t) => (
          <button
            key={t}
            type="button"
            className="text-[11px] text-ink-3 hover:text-brand"
          >
            {t}
          </button>
        ))}

        <span className="ml-auto text-[10px] text-ink-4">Enter 发送 / Shift + Enter 换行</span>

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
