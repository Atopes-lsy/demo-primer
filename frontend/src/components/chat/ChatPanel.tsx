import { MessageSquare, MoreHorizontal, RefreshCw, SquareArrowOutUpRight } from 'lucide-react'

import { 查禁语 } from '../../data/koujing'
import type { 剧本 } from '../../data/剧本'
import type { 播放状态 } from '../../hooks/use播放器'
import type { Agent, ChatMessage, Session, ShopMetric } from '../../types'
import Composer from './Composer'
import MessageList from './MessageList'
import MetricBar from './MetricBar'
import ProductCard from './ProductCard'
import 播放器 from './播放器'

type Props = {
  session: Session | null
  agent: Agent
  metrics: ShopMetric[]
  onSend: (text: string) => void
  /** 草稿存在会话上，切走再切回来不会丢。 */
  onDraftChange: (text: string) => void
  /** 当前会话的演示剧本。普通会话没有 —— 播放器照样在，只是提示行换成消息。 */
  剧本?: 剧本
  播放: 播放状态
  /** 刚出现的那条消息，播放器提示行用。 */
  当前消息?: ChatMessage
}

function ChatHeader({ session }: { session: Session }) {
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
  agent,
  metrics,
  onSend,
  onDraftChange,
  剧本,
  播放,
  当前消息,
}: Props) {
  const draft = session?.草稿 ?? ''

  // 每次渲染重新比对，而不是把结果存进状态 —— 客服改一个字，提示就该跟着变。
  const guard = 查禁语(draft)

  const send = (text: string = draft) => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-canvas">
      <MetricBar agent={agent} metrics={metrics} />

      {session ? (
        <>
          <ChatHeader session={session} />
          {/* 回放条每个会话都有。`key` 挂会话号：切会话时把「跳到第 N 条」输入框
              里残留的上一条会话的数字清掉，否则新会话一按回车会跳到一个莫名其妙的
              位置。 */}
          <播放器 key={session.会话ID} state={播放} 剧本={剧本} 当前消息={当前消息} />
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
                  : `这条会话有 ${播放.总格数} 条消息，按下播放从第 1 条开始回放`
            }
          />
          {/* 「仍然发送」和「发送」眼下是同一个调用 —— 区别在意图：这一下是客服看过
              警示之后拍的板。留痕（记下谁在什么时候越过了哪条口径）留给后端做。 */}
          <Composer
            value={draft}
            onChange={onDraftChange}
            onSend={() => send()}
            guard={guard}
            onReplace={() => guard && onDraftChange(draft.replace(guard.禁语, guard.建议))}
            onSendAnyway={() => send()}
            round={session.本轮处置 ?? []}
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
