import { useMemo, useState } from 'react'

import ChatPanel from './components/chat/ChatPanel'
import IconRail from './components/IconRail'
import PrimerPanel from './components/plugin/PrimerPanel'
import SessionPanel from './components/session/SessionPanel'
import { agent, sessions as seedSessions, shopMetrics } from './data'
import { 演到, 剧本表, 条到步 } from './data/剧本'
import { 默认条间隔, usePlayer } from './hooks/use播放器'
import type { ChatMessage, Session } from './types'

/** 客服发出的消息。字段从会话最后一条消息沿用，只覆盖真正变化的部分。 */
function buildAgentMessage(session: Session, text: string, 序号: number): ChatMessage {
  const template = session.消息.at(-1)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    会话ID: session.会话ID,
    消息序号: 序号,
    message_id: `${session.会话ID}-local-${序号}`,
    发送时间: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours(),
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    角色: '客服',
    买家昵称: session.买家昵称,
    发送方: `${session.店铺}:${agent.昵称}`,
    店铺: session.店铺,
    scene_major: template?.scene_major ?? '',
    scene_minor: template?.scene_minor ?? '',
    is_target_buyer_message: false,
    message_text: text,
    内容类型: '文本',
    chat_content: JSON.stringify([{ index: 0, content: text }]),
    category: template?.category ?? 'service',
    image_path: '',
    关联订单号: session.订单?.订单号 ?? '',
    关联工单号: session.工单?.ticket.工单号 ?? '',
  }
}

/**
 * 报备单／交接单的号。
 *
 * 规格 §7 要求报备和转交都自动生成单号、客服零填写，所以这里本地拼一个
 * `BH20260928001` 形状的串。接了后端之后这个函数整个删掉，用接口返回值。
 */
function 生成单号(前缀: 'BH' | 'JJ', 会话ID: string): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const 序号 = 会话ID.replace(/\D/g, '').slice(-3).padStart(3, '0')
  return `${前缀}${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${序号}`
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(seedSessions)
  const [activeId, setActiveId] = useState(seedSessions[0]?.会话ID ?? '')

  const 剧本 = 剧本表[activeId]
  const 活条数 = sessions.find((s) => s.会话ID === activeId)?.消息.length ?? 0

  /**
   * 播放器的节拍表。**它的长度就是播放器的总条数**，所以这里要凑准。
   *
   * 有剧本的会话按剧本自己的间隔走（这个剧本恰好一步一条消息，所以两者等长）；
   * 没有剧本的会话一条消息一停，用统一的默认值。节拍表是现造的数组，每次渲染
   * 都是新的 —— `usePlayer` 内部用 ref 接住，不会因此重排定时器。
   */
  const 间隔表 = useMemo(
    () => 剧本?.事件.map((e) => e.间隔) ?? Array.from({ length: 活条数 }, () => 默认条间隔),
    [剧本, 活条数],
  )

  const 播放 = usePlayer(间隔表)

  /**
   * 渲染用的会话列表。
   *
   * 屏幕上显示几条消息，由播放器的进度决定 —— **两种会话都归它管**：
   *   - 有剧本：把进度换算成步数（`条到步`），按剧本重演，右栏跟着一起变；
   *   - 没剧本：直接从消息列表里截前 N 条。
   *
   * 普通会话不能也走剧本那条路。给它现造一份「一条消息一步」的剧本看着更统一，
   * 但那份剧本的消息和 `活.消息` 是同一批 —— `演到` 会把 `活.消息` 再追加一遍，
   * 屏幕上每条消息出现两次。
   *
   * 非当前会话一律演到底：它们只是列表里的一行摘要，没播完会显示成一条空会话，
   * 演示的人反而找不到它。当前会话按真实进度走，所以选中它时摘要会先空一下
   * 再随播放长回来 —— 这个「重演」的观感正是想要的。
   */
  const 展示: Session[] = sessions.map((s) => {
    const 本 = 剧本表[s.会话ID]
    const 条数 = s.会话ID === activeId ? 播放.已播条数 : Number.POSITIVE_INFINITY
    if (本) return 演到(s, 本, 条到步(本, 条数))
    return { ...s, 消息: s.消息.slice(0, 条数) }
  })

  const active = 展示.find((s) => s.会话ID === activeId) ?? null

  /**
   * 切会话就把播放器归零。
   *
   * 归零放在这里而不是 `usePlayer` 的 effect 里：切会话是**这个点击**造成的，
   * 在造成变化的地方顺手清掉，比等渲染完再补一次 setState 少一轮渲染，也不会
   * 先闪一帧上一条会话的进度。顺带一个好处 —— 重复点当前会话 = 重播。
   */
  const 选会话 = (id: string) => {
    setActiveId(id)
    播放.重置()
  }

  /** 改一条会话。插件产出的一切状态（草稿、报备、转交）都落在会话上。 */
  const patch = (fn: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.会话ID === activeId ? fn(s) : s)))
  }

  const handleSend = (text: string) => {
    patch((s) => {
      const sent = buildAgentMessage(s, text, s.消息.length + 1)
      return {
        ...s,
        消息: [...s.消息, sent],
        // 发出去就把草稿清掉，否则下一次进来还挂着上一轮的话。
        草稿: '',
        摘要: text,
        最近时间: sent.发送时间.slice(5, 16),
      }
    })
  }

  /** 主卡「采用并发送」：话术进输入框，发不发由客服决定。 */
  const handleUseScript = () => {
    const 话术 = active?.建议?.话术
    if (!话术) return
    patch((s) => ({ ...s, 草稿: 话术 }))
  }

  /** 主卡「一键报备」：对话还在客服手里，顾客无感知。 */
  const handleReport = () => {
    patch((s) => ({ ...s, 报备: { 等待分钟: 0, 工单号: 生成单号('BH', s.会话ID) } }))
  }

  /** 主卡「立即转交」：对话交出去，客服不再跟进。 */
  const handleHandover = () => {
    patch((s) => ({ ...s, 转交: { 工单号: 生成单号('JJ', s.会话ID) } }))
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <IconRail />
      <SessionPanel sessions={展示} activeId={activeId} onSelect={选会话} />
      <ChatPanel
        session={active}
        agent={agent}
        metrics={shopMetrics}
        onSend={handleSend}
        onDraftChange={(text) => patch((s) => ({ ...s, 草稿: text }))}
        剧本={剧本}
        播放={播放}
        // 普通会话的提示行要显示「刚出现的那条」。截断之后最后一条就是它。
        // 有剧本的会话不走这个 —— 它的提示行是剧本的标题和备注。
        当前消息={剧本 ? undefined : active?.消息.at(-1)}
      />
      <PrimerPanel
        session={active}
        onUseScript={handleUseScript}
        onReport={handleReport}
        onHandover={handleHandover}
      />
    </div>
  )
}
