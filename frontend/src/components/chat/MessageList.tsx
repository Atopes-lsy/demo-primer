import { ImageIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ChatMessage } from '../../types'

type Props = {
  messages: ChatMessage[]
  /**
   * 消息为空时显示什么。
   *
   * 空有两种，含义正相反，必须分开：这条会话**本来就没有消息**（「还没有消息」），
   * 和**有消息、只是还没回放**（「按下播放」）。混成一句的话，选中一个刚归零的
   * 会话，屏幕上写着「还没有消息」，看着像数据没加载出来。
   */
  空态文案?: string
}

function Message({ message }: { message: ChatMessage }) {
  const isBuyer = message.角色 === '买家'
  const isAI = message.角色 === 'AI'
  const time = message.发送时间.slice(5, 16)

  return (
    // AI 代发和客服消息走同一条道（右侧）。它是以店铺名义发出去的，顾客那头
    // 就显示在店铺这一侧；客服回看时也该在自己的道里看见它，而不是混进买家那侧。
    // 区分靠颜色和署名，不靠左右 —— 所以这里只看 `isBuyer`。
    <div className={`flex gap-2 ${isBuyer ? '' : 'flex-row-reverse'}`}>
      {/* AI 代发的消息不带头像 —— 它不是人发的。 */}
      {isAI ? (
        <span className="w-1 shrink-0" aria-hidden />
      ) : (
        <span className="mt-0.5 size-7 shrink-0 rounded-full bg-canvas" aria-hidden />
      )}

      <div
        className={`flex max-w-[76%] flex-col ${isBuyer ? 'items-start' : 'items-end'} ${
          // AI 没有头像，补一段等宽的内缩，让它的气泡右缘和客服气泡对齐：
          // 客服那侧占 头像 28px + gap 8px，AI 这侧占 占位 4px + gap 8px + 24px。
          isAI ? 'mr-6' : ''
        }`}
      >
        <time className="mb-1 text-note text-ink-4">{time}</time>

        <div
          className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap ${
            isBuyer
              ? 'rounded-tl-none border border-line bg-buyer-bubble text-ink'
              : isAI
                ? 'rounded-tr-none border border-ai-line bg-ai-soft text-ai-ink'
                : 'rounded-tr-none bg-agent-bubble text-ink'
          }`}
        >
          {message.内容类型 === '图片' ? (
            <span className="flex flex-col gap-1.5">
              {message.message_text ? <span>{message.message_text}</span> : null}
              <span className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded bg-canvas text-note text-ink-4">
                <ImageIcon size={16} />
                {message.image_path.split('/').pop()}
              </span>
            </span>
          ) : (
            message.message_text
          )}
        </div>

        {/* AI 代发必须标出处，客服一眼看出哪句不是自己说的。 */}
        {message.署名 ? (
          <span className="mt-1 text-note text-ai-ink-2">◆ {message.署名}</span>
        ) : null}

        {!isAI && message.scene_minor ? (
          <span className="mt-1 text-note text-ink-4">{message.scene_minor}</span>
        ) : null}
      </div>
    </div>
  )
}

/** 消息流。新消息到达时自动滚到底部。 */
export default function MessageList({ messages, 空态文案 }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-xs text-ink-4">
        {空态文案 ?? '还没有消息'}
      </div>
    )
  }

  return (
    <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-3 py-3">
      {messages.map((m) => (
        <Message key={m.message_id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
