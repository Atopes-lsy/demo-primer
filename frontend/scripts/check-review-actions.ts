import assert from 'node:assert/strict'
import { reviewSessions } from '../src/review/scenarios'
import { simulateAction, reviewReceipt } from '../src/review/actions'
import { sendPolicy } from '../src/components/chat/sendPolicy'

const [transfer, report] = reviewSessions
const before = JSON.stringify(reviewSessions)
for (const [kind, original] of [['transfer', transfer], ['report', report]] as const) {
  const updated = simulateAction(original, kind)
  assert.equal(updated.消息.length, original.消息.length + 1)
  assert.equal(updated.消息.at(-1)?.角色, 'AI')
  assert.match(updated.消息.at(-1)?.署名 ?? '', /本地演示/)
  assert.equal(simulateAction(updated, kind), updated)
  assert.match(reviewReceipt(updated) ?? '', kind === 'report' ? /模拟报备 4 项/ : /模拟转交 5 项/)
  assert.equal(sendPolicy('您好', updated, true).kind, kind === 'transfer' ? 'blocked' : 'ready')
}
assert.equal(JSON.stringify(reviewSessions), before)
assert.equal(reviewReceipt(report), undefined)
console.log('PASS: 模拟回执、告知/安抚消息、重复点击幂等、转交锁定、样本不被修改')
