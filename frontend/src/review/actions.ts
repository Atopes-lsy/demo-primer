import type { Session } from '../types'
import { reviewMessage } from './scenarios'

/** 五顾客验收专用：无网络、无真实工单；相同动作不能产生第二条消息。 */
export function simulateAction(session: Session, kind: 'report' | 'transfer'): Session {
  if (kind === 'report' ? session.报备 : session.转交) return session
  const text = kind === 'report'
    ? session.本轮处置?.find((d) => d.输出 === '报备')?.话术 ?? '已记录您的诉求，正在核实。'
    : '您的问题已转交专席处理，相关订单、历史承诺和沟通记录会一并带入，请稍候。'
  return { ...session,
    ...(kind === 'report' ? { 报备:{等待分钟:0,工单号:'DEMO-REPORT-001'} } : { 转交:{工单号:'DEMO-TRANSFER-001'} }),
    消息: [...session.消息, reviewMessage(session, text, 'AI', session.消息.length + 1)],
  }
}

/** 只汇总样本中实际存在的字段；不是额外的交接包 UI 或后端成功宣告。 */
export function reviewReceipt(session: Session): string | undefined {
  if (!session.报备 && !session.转交) return undefined
  const items = [session.本轮处置?.length ? '诉求' : '', session.订单 ? '订单' : '',
    session.顾客情况?.some((r) => r.标签 === '答应过什么' && r.值) ? '承诺' : '',
    session.顾客情况?.some((r) => r.标签 === '办过什么' && r.值) ? '处理记录' : '',
    session.转交 && session.消息.length ? '沟通记录' : ''].filter(Boolean)
  return `模拟${session.转交 ? '转交' : '报备'} ${items.length} 项：${items.join('、')}。${session.转交 ? '告知' : '安抚'}话术已发出。`
}
