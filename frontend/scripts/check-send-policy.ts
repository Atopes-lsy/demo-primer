import assert from 'node:assert/strict'
import { sendPolicy } from '../src/components/chat/sendPolicy'
import { 查事实 } from '../src/data/事实'
import { reviewSessions, reviewEvidence } from '../src/review/scenarios'

const [transfer, report, light, fact, ai] = reviewSessions
assert.equal(reviewSessions.length, 5)
for (const session of reviewSessions) {
  assert.ok(session.消息.length > 0)
  assert.equal(reviewEvidence[session.会话ID].length, 6)
}
assert.equal(sendPolicy('', ai).kind, 'empty')
assert.equal(sendPolicy('您好', null).kind, 'empty')
assert.equal(sendPolicy('您好', ai).kind, 'ready')
assert.equal(sendPolicy('您好', report).kind, 'ready')
assert.equal(sendPolicy(light.草稿!, light).kind, 'confirm')
assert.equal(sendPolicy(light.草稿!, light, true).kind, 'ready')
assert.equal(sendPolicy(fact.草稿!, fact).kind, 'blocked')
assert.equal(sendPolicy(fact.草稿!, fact, true).kind, 'blocked')
assert.equal(sendPolicy(`${fact.草稿}绝对不刺激`, fact, true).kind, 'blocked')
assert.equal(sendPolicy(查事实(fact.草稿!, fact)!.建议, fact).kind, 'ready')
assert.equal(sendPolicy('您好', transfer, true).kind, 'blocked')
assert.equal(sendPolicy('您好', {...ai, 转交:{工单号:'DEMO'}}, true).kind, 'blocked')
assert.equal(sendPolicy('我们将核实发货进度', fact).kind, 'ready')
console.log('PASS: 五位顾客各六源、13 项发送边界；确认不能越过事实或转交。')
