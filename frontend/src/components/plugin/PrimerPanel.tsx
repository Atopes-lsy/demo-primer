import { Puzzle, RotateCw, Settings2 } from 'lucide-react'

import { 建交接包, type 交接包 } from '../../data/交接包'
import type { ChatMessage, Session } from '../../types'
import AdviceCard, { type 报备态 } from './AdviceCard'
import CustomerStateCard from './CustomerStateCard'
import HandoverPacket from './HandoverPacket'

/**
 * 这一屏上**可能是剧本兜的底**的那几块。
 *
 * 三种各对应一条独立的取数路：判定（`/api/判定`）、会话列表（`/api/会话列表`）、
 * 动作（报备／转交／发送三个按钮）。
 */
export type 兜底来源 = '判定' | '会话列表' | '动作'

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
   * 接口回来的那张交接包。拿不到时下面回落 `建交接包`。
   *
   * **名字里带「接口」是有意的。** 兜底那份和接口那份长得一模一样 —— 单号、
   * 七行、状态徽标，屏幕上没有任何一处看得出来是哪边给的。名字上分得开，
   * 是这份代码里唯一还留着的区别（`工单交接_给前端线_B.md` §六 第 6 条）。
   */
  接口交接包?: 交接包
  /**
   * 这一屏哪几块是剧本兜的底。`[]` = 三块全走接口。
   *
   * # 为什么这个标记必须上屏，而且必须常驻
   *
   * 两条理由叠在一起，缺一条它都可以只在开发态挂着：
   *
   * 1. **兜底是正常路径，不是万一。** 交接包这一块 2026-10-03 拍了留兜底
   *    （工单 §一 1.1 乙）—— 后端不通时它照样出一张完整的单子，这就是演示
   *    要的。可既然它每次都可能发生，就得分得清；
   * 2. **原来那块提示挂在 `import.meta.env.DEV` 后面**，而演示录的是
   *    `vite build` 的产物，那里 `DEV` 是 `false` —— **录片子的时候它不会上镜**。
   *    于是「接口其实一次都没通」在屏幕上没有任何痕迹（旧单 §二 要解决的就是
   *    这件事，本单让它变成硬需求）。
   *
   * 反向也要看得见：正常的时候写「接口 · 已连」。只报错的话，这条标记「没出现」
   * 和「没检查」长得一样。
   */
  兜底: 兜底来源[]
  /**
   * 后端**明确拒了**（404／409／400）的那句话。`undefined` = 没有。
   *
   * 和 `兜底` 是两件事：那是「后端没答上来」，这是「后端答了、说这件事办不了」。
   * 后端那句 `detail` 是给人看的整句（「…第 2 轮没有要报备的主张」），原样摆出来 ——
   * 它是「为什么这张单子不该出现」的唯一解释。
   */
  动作被拒?: string
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
  接口交接包,
  兜底,
  动作被拒,
  未判定,
}: Props) {
  /**
   * 接口那份优先，拿不到才现算。
   *
   * **兜底那一支不是死代码**（工单 §一 拍 1.1 乙）：后端不通时它照样出一张
   * 七行齐全的单子，单号由 `App` 用 `兜底单号` 先写进 `session.报备`／`转交`
   * （`建交接包` 就是从那儿取号的）。少了那一步，这里回落到的是 `null` ——
   * 右栏**安静地少一块**，而不是报个错。
   */
  const 交接包 = session ? (接口交接包 ?? 建交接包(session, 报备态)) : null
  // 名不副实的一项是「已连」：`兜底` 里三项各说各的，一项没亮 = 那一项正走接口。
  const 全连 = 兜底.length === 0

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

      {/* 数据源标记。**常驻，而且不挂在 `import.meta.env.DEV` 后面** —— 见 `兜底`。 */}
      <p
        className={`flex shrink-0 items-center gap-1.5 border-b border-line px-3 py-1 text-note ${
          全连 ? 'bg-panel text-ink-4' : 'bg-hold-soft text-hold-ink'
        }`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${全连 ? 'bg-success' : 'bg-hold'}`} />
        {全连 ? '接口 · 已连' : `剧本兜底 · ${兜底.join('、')}`}
      </p>

      {/* 后端拒绝**不出来是安静的**：下一步什么都不会发生，而屏幕上看着就像
          「这个按钮没用」。所以它得占一行，并且占在标记正下方。 */}
      {动作被拒 ? (
        <p className="shrink-0 border-b border-risk-line bg-risk-soft px-3 py-1 text-note leading-relaxed text-risk-ink">
          <span className="font-medium">动作接口说不行 · </span>
          {动作被拒}
        </p>
      ) : null}

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
