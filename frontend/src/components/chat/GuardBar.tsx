import { CornerDownLeft } from 'lucide-react'

import type { GuardHit } from '../../types'

type Props = {
  hit: GuardHit
  /** 「一键替换」：把草稿换成建议的说法。 */
  onReplace: () => void
  /** 「仍然发送」：客服拍板，照原样发。 */
  onSendAnyway: () => void
}

/**
 * 发送前确认条。
 *
 * 位置必须在输入框上方 —— 它校验的是客服正在打的那句话，放右侧面板会被忽略。
 * 平时隐藏，只在命中禁语时出现。
 *
 * 措辞是「确认」不是「拦截」：保留［仍然发送］，最终决定权在客服手里，
 * 这是人机协同的底线。
 */
export default function GuardBar({ hit, onReplace, onSendAnyway }: Props) {
  return (
    <div className="border-t border-risk-line bg-risk-soft px-3 py-2">
      <p className="flex items-start gap-1.5 text-[11px] font-medium text-risk-ink">
        <CornerDownLeft size={12} className="mt-0.5 shrink-0" />
        <span>
          发送前确认：命中禁语「{hit.禁语}」（口径表 {hit.口径}）
        </span>
      </p>

      <p className="mt-1 pl-[18px] text-[11px] leading-relaxed text-risk-ink-2">
        建议改为「{hit.建议}」
      </p>

      <div className="mt-2 flex gap-2 pl-[18px]">
        <button
          type="button"
          onClick={onReplace}
          className="rounded border border-risk-line bg-panel px-2.5 py-1 text-[11px] text-risk-ink hover:bg-risk-soft"
        >
          一键替换
        </button>
        <button
          type="button"
          onClick={onSendAnyway}
          className="rounded border border-line bg-panel px-2.5 py-1 text-[11px] text-ink-2 hover:bg-canvas"
        >
          仍然发送
        </button>
      </div>
    </div>
  )
}
