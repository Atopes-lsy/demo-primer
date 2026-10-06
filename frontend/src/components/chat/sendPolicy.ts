import { 查事实 } from '../../data/事实'
import { 查禁语 } from '../../data/koujing'
import type { Session } from '../../types'

/** 前端防误发；不代替服务端校验。确认只能越过措辞提醒，不能越过事实/转交。 */
export function sendPolicy(text: string, session: Session | null, confirmed = false) {
  if (!session || !text.trim()) return { kind: 'empty' as const, reason: '' }
  if (session.转交 || session.建议?.形态 === '有风险') {
    return { kind: 'blocked' as const, reason: session.转交 ? '已转交专席，普通发送已锁定' : '需要转交专席，请在右侧立即转交' }
  }
  if (查事实(text, session)) return { kind: 'blocked' as const, reason: '事实不一致，请修改后发送' }
  if (查禁语(text) && !confirmed) return { kind: 'confirm' as const, reason: '请先确认措辞提醒' }
  return { kind: 'ready' as const, reason: '' }
}
