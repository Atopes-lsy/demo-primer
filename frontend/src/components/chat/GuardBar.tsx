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
 * 发送前确认 · 检查一（禁语）。
 *
 * 位置必须在输入框上方 —— 它校验的是客服正在打的那句话，放右侧面板会被忽略。
 * 平时隐藏，只在命中禁语时出现。
 *
 * **淡黄底，不是红框**（见 `ConflictBar`）。这一条管的是措辞：话说得没错，
 * 只是有个词不能这么说。底色跟着语义走 —— 两条检查一个红一个黄，客服扫一眼
 * 就知道这次是「换个说法」还是「这句不能发」。都用红的，第二条就没人当回事了。
 *
 * 措辞是「确认」不是「拦截」：保留［仍然发送］，最终决定权在客服手里，
 * 这是人机协同的底线。
 */
export default function GuardBar({ hit, onReplace, onSendAnyway }: Props) {
  return (
    <div className="primer-float-in mx-3 mb-2 rounded-[18px] border border-white/90 bg-gradient-to-r from-hold-soft to-panel/95 px-3 py-2.5 shadow-[0_8px_24px_-10px_rgba(166,82,32,0.28)] backdrop-blur-xl">
      <p className="flex items-start gap-1.5 text-xs font-semibold text-hold-ink">
        <CornerDownLeft size={12} className="mt-0.5 shrink-0" />
        <span>
          发送前确认：命中禁语「{hit.禁语}」（口径表 {hit.口径}）
        </span>
      </p>

      <p className="mt-1 pl-4.5 text-xs leading-relaxed text-ink-2">
        建议改为「{hit.建议}」
      </p>

      <div className="mt-2 flex gap-2 pl-4.5">
        <button
          type="button"
          onClick={onReplace}
          className="primer-action h-9 rounded-[12px] border border-hold-line bg-panel/80 px-3 text-xs font-medium text-hold-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-hold-soft"
        >
          一键替换
        </button>
        <button
          type="button"
          onClick={onSendAnyway}
          className="primer-action h-9 rounded-[12px] border border-line bg-panel/80 px-3 text-xs font-medium text-ink-2 hover:bg-canvas"
        >
          仍然发送
        </button>
      </div>
    </div>
  )
}
