import { OctagonAlert } from 'lucide-react'

import type { 事实冲突 } from '../../data/事实'

type Props = {
  冲突: 事实冲突
  /**
   * 「一键替换」：**整句**换成建议的说法。
   *
   * 和检查一那个同名按钮不是一回事，别改成一样的：禁语是**换个词**（「绝对不刺激」
   * →「成分温和…」），换完句子的其余部分还立得住；事实对不上是**这整句都不成立**，
   * 换掉一个动词救不回来 —— 剩半句真话半句假话比原样发出去还糟。
   */
  onReplace: () => void
  /** 「仍然发送」：客服拍板，照原样发。 */
  onSendAnyway: () => void
}

/**
 * 发送前确认 · 检查二（事实对照）。
 *
 * 和 `GuardBar`（检查一 · 禁语）并排，但**颜色和措辞都不同**，这是有意的：
 *
 *   · 检查一说的是「换个说法」，淡黄底、语气是提醒 —— 事情本身没问题；
 *   · 检查二说的是「这句是假的」，红框、语气是止住 —— 这条发出去，
 *     顾客手上就多了一句我们兑现不了的承诺。
 *
 * 两条都留着［仍然发送］：判断权在客服，系统只负责把对不上的地方摆到他眼前
 * （见 `GuardBar` 的注释）。但红框里那句「系统查到」必须写清楚**查的是哪一单、
 * 什么状态** —— 只喊「你错了」而不给出处，客服只能靠猜。
 */
export default function ConflictBar({ 冲突, onReplace, onSendAnyway }: Props) {
  return (
    <div className="primer-float-in mx-3 mb-2 rounded-[18px] border border-white/90 bg-gradient-to-r from-risk-soft to-panel/95 px-3 py-2.5 shadow-[0_8px_24px_-10px_rgba(172,68,61,0.3)] backdrop-blur-xl">
      <p className="flex items-start gap-1.5 text-xs font-semibold text-risk-ink">
        <OctagonAlert size={12} className="mt-0.5 shrink-0" />
        <span>这句话和系统记录对不上</span>
      </p>

      <div className="mt-1 space-y-0.5 pl-4.5 text-xs leading-relaxed">
        <p className="text-risk-ink-2">
          你说：「<span className="text-risk-ink">{冲突.你说}</span>」
        </p>
        <p className="text-risk-ink-2">
          系统查到：<span className="text-risk-ink">{冲突.记录}</span>
        </p>
        <p className="text-risk-ink-2">建议改为：「{冲突.建议}」</p>
      </div>

      <div className="mt-2 flex gap-2 pl-4.5">
        <button
          type="button"
          onClick={onReplace}
          className="primer-action h-9 rounded-[12px] border border-risk-line bg-panel/80 px-3 text-xs font-medium text-risk-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-risk-soft"
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
