import {
  MessageSquare,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  SquareArrowOutUpRight,
} from 'lucide-react'

import { 查事实 } from '../../data/事实'
import { 查禁语 } from '../../data/koujing'
import type { 剧本 } from '../../data/剧本'
import { 停的样子, type 播放状态 } from '../../hooks/use播放器'
import type { Agent, Session, ShopMetric } from '../../types'
import Composer from './Composer'
import MessageList from './MessageList'
import MetricBar from './MetricBar'
import ProductCard from './ProductCard'
import 播放器 from './播放器'
import { sendPolicy } from './sendPolicy'

type Props = {
  session: Session | null
  /** 隔离的 UI 验收页直接展示完整快照，不使用真实回放。 */
  隐藏回放?: boolean
  agent: Agent
  metrics: ShopMetric[]
  onSend: (text: string) => void
  /** 草稿存在会话上，切走再切回来不会丢。 */
  onDraftChange: (text: string) => void
  /** 当前会话的演示剧本。普通会话没有 —— 那种会话的回放控制收在标题栏上（`回放键`）。 */
  剧本?: 剧本
  播放: 播放状态
  /**
   * 这一屏那一轮里「客服点发送」那条，话已经发出去了（见 `App` 的 `本轮已发`）。
   *
   * 只影响「本轮处置」那一行的说法：`待你确认后发送` → `已发送`（31 §3.7 S10 后）。
   */
  本轮已发?: boolean
}

/**
 * 真窗口那一条回放的控制 —— **收成一颗按钮，挂在标题栏上**（2026-10-05）。
 *
 * 真窗口要的是「点开看它演」，不是「拖刻度讲解」：不需要刻度条、速度档、
 * 「跳到第 N 条」。它只剩两件事要人做 —— 让它演、让它停。演到头按钮变 ↻，
 * 按一下从头再演一遍（`播放()` 在末格的语义就是回 0）。
 *
 * # 旁边那行琥珀字不是装饰
 *
 * `App.真窗口停` 那把刹车（建议得先被采纳）会按住时间线，那一刻按 ▶ **按不动**
 * —— 没有这行字，演示的人只会以为播放器卡死了，然后一直按。它念的是
 * `停的样子`，和演示线那条回放条上的一模一样（那一头写着为什么不许两处各拼一遍）。
 */
function 回放键({ 播放 }: { 播放: 播放状态 }) {
  const 空 = 播放.总格数 === 0
  const 演完 = !空 && 播放.已播格数 >= 播放.总格数

  return (
    <>
      {播放.停在 ? (
        <span className="shrink-0 text-note font-medium text-hold-ink">
          {停的样子(播放.停在)}
        </span>
      ) : null}

      <button
        type="button"
        onClick={播放.在放 ? 播放.暂停 : 播放.播放}
        disabled={空}
        title={播放.在放 ? '暂停' : 演完 ? '从头重播' : '播放'}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-ink-4"
      >
        {播放.在放 ? (
          <Pause size={12} fill="currentColor" />
        ) : 演完 ? (
          <RotateCcw size={12} />
        ) : (
          <Play size={12} fill="currentColor" />
        )}
      </button>
    </>
  )
}

function ChatHeader({ session, 回放 }: { session: Session; 回放?: 播放状态 }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-line-soft bg-panel px-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-ink">{session.买家昵称}</span>
        <span className="rounded-sm bg-canvas px-1.5 text-note leading-4 text-ink-3">
          {session.stage === '历史联系' ? '老客' : '陌生人'}
        </span>
        <span className="text-body text-ink-4">{session.会话ID}</span>
      </div>
      <div className="flex items-center gap-2 text-ink-3">
        {回放 ? <回放键 播放={回放} /> : null}

        <button type="button" title="刷新" className="hover:text-ink-2">
          <RefreshCw size={14} />
        </button>
        <button type="button" title="独立窗口" className="hover:text-ink-2">
          <SquareArrowOutUpRight size={14} />
        </button>
        <button type="button" title="更多" className="hover:text-ink-2">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  )
}

/** 中部核心区：指标条 · 买家信息 · 商品卡 · 消息流 · 输入框。 */
export default function ChatPanel({
  session,
  隐藏回放 = false,
  agent,
  metrics,
  onSend,
  onDraftChange,
  剧本,
  播放,
  本轮已发,
}: Props) {
  const draft = session?.草稿 ?? ''

  // 两条检查都是每次渲染现算，而不是把结果存进状态 —— 客服改一个字，提示就该
  // 跟着变（也可能跟着收掉）。存进状态的话，改完还挂着旧的那一条。
  //
  // 两条管的事不一样，各查各的：禁语管措辞（`查禁语`），事实管这句话是真是假
  // （`查事实`）。同一句可能两条都犯，那就两条都出。
  const guard = 查禁语(draft)
  const 冲突 = 查事实(draft, session)

  const send = (text: string = draft, confirmed = false) => {
    const trimmed = text.trim()
    if (sendPolicy(trimmed, session, confirmed).kind !== 'ready') return
    onSend(trimmed)
  }
  const transferLock = session?.转交 || session?.建议?.形态 === '有风险'
    ? (session?.转交 ? '已转交专席，普通发送已锁定' : '需要转交专席，请在右侧立即转交') : undefined

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-canvas">
      <MetricBar agent={agent} metrics={metrics} />

      {session ? (
        <>
          <ChatHeader session={session} 回放={剧本 || 隐藏回放 ? undefined : 播放} />
          {/* 回放条**只给演示两条线**（2026-10-05）。真窗口那条路走标题栏上那颗
              按钮 —— 两种会话的格子单位不一样（步 / 条），挤在同一排刻度上迟早
              要换算，而换算过一次就错了（见 `播放器` 文件头）。
              `key` 挂会话号：切会话时把「跳到第 N 步」输入框里残留的上一条会话的
              数字清掉，否则新会话一按回车会跳到一个莫名其妙的位置。 */}
          {剧本 ? <播放器 key={session.会话ID} state={播放} 剧本={剧本} /> : null}
          {session.订单 ? <ProductCard 订单={session.订单} /> : null}
          <MessageList
            messages={session.消息}
            // 空态是「一步都还没演」。**单位跟着播放器走**：有剧本时那一格是一步，
            // 而一步未必带消息 —— 说成「有 N 条消息」会让人以为按播放能数出 N 条。
            空态文案={
              播放.总格数 === 0
                ? undefined
                : 剧本
                  ? `这段演示有 ${播放.总格数} 步，按播放从第 1 步开始`
                  : `这条会话有 ${播放.总格数} 条消息，点右上角 ▶ 从第 1 条开始演`
            }
          />
          {/* 轻提醒需显式确认；事实冲突与转交锁定不能通过确认绕过。 */}
          <Composer
            value={draft}
            onChange={onDraftChange}
            onSend={() => send()}
            guard={guard}
            onReplace={() => guard && onDraftChange(draft.replace(guard.禁语, guard.建议))}
            冲突={冲突}
            // 整句换掉，不是换词 —— 这句话本身是假的（见 `ConflictBar`）。
            onFixConflict={() => 冲突 && onDraftChange(冲突.建议)}
            onSendAnyway={() => send(draft, true)}
            发送锁定={transferLock}
            round={session.本轮处置 ?? []}
            /* **没有剧本的会话，这一屏一件事都还没发生过。**
               演示两条线不一样：剧本演到第 6 格，报备就是真演过了 ——
               所以「已报备」那句话对它们是对的，对真窗口是假话。
               判据就是这里这一条，`RoundPanel` 那边只负责照着念。 */
            待确认={!剧本}
            已发本轮={本轮已发}
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ink-4">
          <MessageSquare size={32} strokeWidth={1.5} />
          <p className="text-xs">从左侧选择一个会话开始接待</p>
        </div>
      )}
    </section>
  )
}
