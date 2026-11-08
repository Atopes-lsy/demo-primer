import type { Session } from '../types'

/** 仅运行时买家消息产生未读，历史导入和客服回复不会点亮提示。 */
export function inboxSessions(sessions: Session[], read: Record<string, number>, activeId: string): Session[] {
  return sessions.map(s => {
    const incoming = s.消息.filter(m => m.角色 === '买家' && m.message_id.includes('.runtime.'))
    const last = incoming.at(-1)
    return { ...s, 未读: s.会话ID === activeId ? 0 : incoming.filter(m => m.消息序号 > (read[s.会话ID] ?? 0)).length,
      摘要: s.消息.at(-1)?.message_text ?? s.摘要,
      最近时间: s.消息.at(-1)?.发送时间 ?? s.最近时间,
      incomingTime: last?.发送时间 ?? '' }
  }).sort((a, b) => b.incomingTime.localeCompare(a.incomingTime))
}
