import { Puzzle, RotateCw, Settings2 } from 'lucide-react'

import { 建交接包 } from '../../data/交接包'
import type { ChatMessage, Session } from '../../types'
import AdviceCard, { type 报备态 } from './AdviceCard'
import CustomerStateCard from './CustomerStateCard'
import HandoverPacket from './HandoverPacket'

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
  /**
   * `POST /api/判定` 或 `GET /api/会话列表` 没答上来，这一屏是剧本兜的底。
   *
   * **只在开发态显示。** 演示录的是 `vite build` 的产物，`import.meta.env.DEV`
   * 是 `false`，这个标记不会上镜。留着它是因为反面太贵：后端没起时界面看着
   * 完全正常（剧本那份本来就是对的，左栏那两条演示会话也一条不少），而
   * 「接口其实一次都没通」要到很久以后才会有人发现 —— 那正是 `开发步骤.md`
   * 步骤 1 想避免的那类错。
   */
  接口未连?: boolean
  /**
   * 这条会话没有判定结果可比 —— 不是「判完了没事」，是**压根没跑过**。
   *
   * 判定只接在两条演示线上（`判定轮次` 标在剧本里），其余 138 条真实会话一条都
   * 没跑。那些会话点开时 `建议` 是空的，和「这一轮 AI 自己处理了」长得一模一样 ——
   * 照原来的写法右栏会说「AI 已自行处理或无事可做」，**而那是句假话**。
   *
   * 接上真实会话的判定之后这个 prop 就该消失（那时每一屏都判过），在那之前
   * 它负责让空态只说它知道的事。
   */
  未判定?: boolean
}

/**
 * 右侧辅助区 —— 本次比赛的设计目标区。
 *
 * 三块，不是四张并列卡：上面「顾客情况」细栏永远在最前，中间「Primer 建议」
 * 主卡随情况变，报备／转交之后底下再接一张自动生成的「交接包」。原「依据与边界」
 * 卡收进主卡的展开里，「工单草稿」卡并进交接包。
 *
 * **交接包不是第四张并列卡。** 它只在报备或转交之后出现，而且位置在主卡下面 ——
 * 主卡回答「要不要报」，交接包回答「报了什么」。没有的话整块不渲染，右栏还是两块。
 */
export default function PrimerPanel({
  session,
  onUseScript,
  onReport,
  onHandover,
  onSendPending,
  报备态,
  待发句,
  接口未连,
  未判定,
}: Props) {
  const 交接包 = session ? 建交接包(session, 报备态) : null

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
          {/* 开发态专用，生产构建里 `import.meta.env.DEV` 是 false，整块被摇掉。 */}
          {接口未连 && import.meta.env.DEV ? (
            <p className="rounded-md border border-dashed border-line px-2 py-1 text-note text-ink-4">
              接口未连 · 界面走的是剧本数据
            </p>
          ) : null}

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
          ) : 未判定 ? (
            <p className="rounded-md border border-dashed border-line bg-panel px-3 py-4 text-center text-body text-ink-4">
              这条会话还没跑判定
              <br />
              <span className="text-note">
                判定目前只接在两条演示线上
              </span>
            </p>
          ) : (
            <p className="rounded-md border border-line bg-panel px-3 py-4 text-center text-body text-ink-4">
              本轮无需客服动作
              <br />
              <span className="text-note">AI 已自行处理或无事可做</span>
            </p>
          )}

          {交接包 ? <HandoverPacket packet={交接包} /> : null}
        </div>
      )}
    </aside>
  )
}
