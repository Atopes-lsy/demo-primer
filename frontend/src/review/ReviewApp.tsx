import { useState } from 'react'
import IconRail from '../components/IconRail'
import SessionPanel from '../components/session/SessionPanel'
import ChatPanel from '../components/chat/ChatPanel'
import { sendPolicy } from '../components/chat/sendPolicy'
import PrimerPanel from '../components/plugin/PrimerPanel'
import { agent, shopMetrics } from '../data'
import type { Session } from '../types'
import type { 播放状态 } from '../hooks/use播放器'
import { reviewEvidence, reviewMessage, reviewSessions } from './scenarios'
import { simulateAction, reviewReceipt } from './actions'

const noop = () => {}
const snapshot: 播放状态 = {已播格数:0, 总格数:0, 在放:false, 格间隔:3000, 播放:noop, 暂停:noop,
  切换:noop, 跳到:noop, 重置:noop, 下一跳:noop, 设格间隔:noop, 停在:null, 继续:noop}

/** 独立本地演示，复用真实 UI，但从不挂载 App 的请求与播放器。刷新可重置。 */
export default function ReviewApp() {
  const [sessions, setSessions] = useState<Session[]>(() => structuredClone(reviewSessions))
  const [id, setId] = useState(sessions[0].会话ID)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const active = sessions.find((s) => s.会话ID === id)!
  const patch = (fn: (s: Session) => Session) => setSessions((all) => all.map((s) => s.会话ID === id ? fn(s) : s))
  const send = (text: string) => {
    if (sendPolicy(text, active, true).kind !== 'ready') return
    patch((s) => ({...s, 草稿:'', 消息:[...s.消息, reviewMessage(s,text.trim(),'客服',s.消息.length+1)]}))
    setSent((prev) => ({...prev,[id]:true}))
  }
  const report = () => patch((s) => simulateAction(s, 'report'))
  const transfer = () => patch((s) => simulateAction(s, 'transfer'))
  return <div className="flex h-full w-full overflow-hidden">
    <IconRail 会话数={sessions.length} />
    <SessionPanel sessions={sessions} activeId={id} onSelect={setId} 默认分组 />
    <ChatPanel key={id} session={active} agent={agent} metrics={shopMetrics} 播放={snapshot} 隐藏回放
      验收处置已执行={Boolean(active.报备 || active.转交 || active.本轮处置?.some((d) => d.输出 === 'AI直发'))}
      onDraftChange={(text) => patch((s) => ({...s,草稿:text}))} onSend={send} 本轮已发={sent[id]} />
    <PrimerPanel session={active} 验收模式 六源依据={reviewEvidence[id]} 兜底={[]}
      执行摘要={reviewReceipt(active)}
      先例数量={56}
      onUseScript={() => patch((s) => ({...s,草稿:s.建议?.话术 ?? ''}))}
      onReport={report} onHandover={transfer} onSendPending={noop} 报备态="等审批"
      本轮已发={sent[id]} 已判定 未开演={false} />
  </div>
}
