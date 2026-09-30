import { Puzzle, RotateCw, Settings2 } from 'lucide-react'

import type { ChatMessage, Session } from '../../types'
import AdviceCard, { type 报备态 } from './AdviceCard'
import CustomerStateCard from './CustomerStateCard'

type Props = {
  session: Session | null
  onUseScript: () => void
  onReport: () => void
  onHandover: () => void
  /** 「一键发送」：审批回来了，把备好的那句话发出去。 */
  onSendPending: () => void
  /** 报备卡走到哪一步了（`等审批` / `等发送` / `已答复`）。 */
  报备态: 报备态
  /** 审批回来、还没发出去的那句话。只有「等发送」时有。 */
  待发句?: ChatMessage
}

/**
 * 右侧辅助区 —— 本次比赛的设计目标区。
 *
 * 两块，不是四张并列卡：上面「顾客情况」细栏永远在最前，下面「Primer 建议」
 * 主卡随情况变。原「依据与边界」卡收进主卡的展开里，「工单草稿」卡并进报备的
 * 交接包。
 */
export default function PrimerPanel({
  session,
  onUseScript,
  onReport,
  onHandover,
  onSendPending,
  报备态,
  待发句,
}: Props) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-line bg-canvas">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-line bg-panel pl-3">
        <div className="flex h-full items-center gap-1.5 rounded-t bg-brand px-3 text-xs font-medium text-white">
          <Puzzle size={13} />
          智能客服
        </div>
        <div className="flex items-center gap-2 pr-3 text-ink-3">
          <button type="button" title="刷新" className="hover:text-ink-2">
            <RotateCw size={14} />
          </button>
          <button type="button" title="设置" className="hover:text-ink-2">
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {session === null ? (
        <div className="flex flex-1 items-center justify-center text-ink-4">
          <div className="text-center">
            <Puzzle size={32} strokeWidth={1.2} className="mx-auto mb-2" />
            <p className="text-xs">从左侧选择一个会话</p>
          </div>
        </div>
      ) : (
        <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-2">
          {session.顾客情况 ? <CustomerStateCard rows={session.顾客情况} /> : null}

          {session.建议 ? (
            <AdviceCard
              advice={session.建议}
              onUseScript={onUseScript}
              onReport={onReport}
              onHandover={onHandover}
              onSendPending={onSendPending}
              报备={session.报备}
              转交={session.转交}
              报备态={报备态}
              待发句={待发句}
            />
          ) : (
            <p className="rounded-md border border-line bg-panel px-3 py-4 text-center text-body text-ink-4">
              本轮无需客服动作
              <br />
              <span className="text-note">AI 已自行处理或无事可做</span>
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
