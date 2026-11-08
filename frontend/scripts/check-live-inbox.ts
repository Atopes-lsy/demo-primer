import assert from 'node:assert/strict'
import { inboxSessions } from '../src/data/liveInbox.ts'
import type { Session } from '../src/types/index.ts'

const session = (id: string, role: string, time: string) => ({ 会话ID: id, 消息: [
  { message_id: `${id}.runtime.1`, 角色: role, 消息序号: 1, 发送时间: time, message_text: id },
] }) as Session
const all = [session('old', '客服', '2026-10-29 12:00:00'),
  session('a', '买家', '2026-10-29 10:00:00'), session('b', '买家', '2026-10-29 11:00:00')]
let result = inboxSessions(all, {}, 'old')
assert.deepEqual(result.map(s => s.会话ID), ['b', 'a', 'old'])
assert.equal(result[0].未读, 1)
result = inboxSessions(all, { b: 1 }, 'a')
assert.equal(result.find(s => s.会话ID === 'b')?.未读, 0)
assert.equal(result.find(s => s.会话ID === 'a')?.未读, 0)
assert.equal(result.find(s => s.会话ID === 'old')?.未读, 0)
console.log('实时会话置顶、未读、打开清除、客服消息不标记：通过')
