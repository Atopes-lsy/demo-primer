import { useEffect, useRef, useState } from 'react'
import type { Advice, Disposition, Session } from './types'
import IconRail from './components/IconRail'
import SessionPanel from './components/session/SessionPanel'
import ChatPanel from './components/chat/ChatPanel'
import PrimerPanel from './components/plugin/PrimerPanel'
import type { 播放状态 } from './hooks/use播放器'
import { sendPolicy } from './components/chat/sendPolicy'
import { inboxSessions } from './data/liveInbox'

const noop = () => {}
const snapshot: 播放状态 = { 已播格数: 0, 总格数: 0, 在放: false, 格间隔: 3000,
  播放: noop, 暂停: noop, 切换: noop, 跳到: noop, 重置: noop, 下一跳: noop,
  设格间隔: noop, 停在: null, 继续: noop }

type Approval = { id: string; 状态: string; 话术: string; 顾客消息ID: string }
type Workflow = { 顾客消息ID: string; 判定: Decision | null; 报备: Session['报备']; 报备态: '等审批' | '等发送' | '已答复' }
type Decision = { 轮次: number; 主卡: Advice | null; 本轮处置: Disposition[] }
async function request<T>(path: string, body?: unknown): Promise<T> {
  const token = new URLSearchParams(location.search).get('token')
  const response = await fetch(path, {
    headers: { ...(token ? { 'X-Primer-Customer-Token': token } : {}), 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.错误 || `请求失败 ${response.status}`)
  return data as T
}

/** 本地实时入口；新顾客消息驱动原判定接口。 */
export default function LiveApp() {
  const customer = new URLSearchParams(location.search).get('live') === 'customer'
  const [sessions, setSessions] = useState<Session[]>([])
  const [id, setId] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [customerLink, setCustomerLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [version, setVersion] = useState('')
  const [read, setRead] = useState<Record<string, number>>({})
  const requested = useRef(new Set<string>())
  const pendingSend = useRef<{ signature: string; key: string } | null>(null)
  const selection = useRef('')
  selection.current = id
  const active = sessions.find(s => s.会话ID === id)
  const latest = active?.消息.filter(m => m.角色 === '买家').at(-1)?.message_id || ''
  const messageCount = active?.消息.length ?? 0
  const latestRole = active?.消息.at(-1)?.角色
  useEffect(() => {
    if (customer || !id) return
    setRead(previous => previous[id] === messageCount ? previous : { ...previous, [id]: messageCount })
  }, [customer, id, messageCount])
  useEffect(() => {
    if (customer || !id || !latest.includes('.runtime.')) return
    const key = `${id}:${latest}`
    if (requested.current.has(key)) return
    requested.current.add(key)
    let obsolete = false
    setBusy(true)
    setError('')
    setDecision(null)
    void request<Workflow>(`/api/会话/${encodeURIComponent(id)}/工作台状态`)
      .then(saved => {
        if (obsolete || selection.current !== id) return null
        if (saved.顾客消息ID === latest && saved.判定) {
          setWorkflow(saved)
          return saved.判定
        }
        if (active?.转交 || latestRole !== '买家') return null
        return request<Decision>('/api/判定', { 会话ID: id, 看到消息数: messageCount })
      })
      .then(result => {
        if (!result || obsolete || selection.current !== id) return
        setDecision(result)
        setVersion(latest)
      })
      .catch(e => {
        if (!obsolete && selection.current === id) setError(`自动判定失败，可点击顶部重试：${String(e)}`)
      })
      .finally(() => { if (!obsolete && selection.current === id) setBusy(false) })
    return () => { obsolete = true; setBusy(false); requested.current.delete(key) }
  }, [customer, id, latest, active?.转交?.工单号])
  const load = async () => {
    const all = await request<Session[]>('/api/会话列表')
    setSessions(previous => all.map(s => {
      const old = previous.find(p => p.会话ID === s.会话ID)
      return old ? { ...s, 报备: old.报备, 转交: s.转交 ?? old.转交 } : s
    }))
    setId(current => current || all.find(s => !s.会话ID.startsWith('S_DEMO'))?.会话ID || '')
  }
  useEffect(() => {
    let stopped = false
    const refresh = () => { if (!stopped) void load().catch(e => setError(String(e))) }
    refresh()
    const timer = setInterval(refresh, 3000)
    return () => { stopped = true; clearInterval(timer) }
  }, [])
  useEffect(() => {
    if (customer || !id) return
    let stopped = false
    const refresh = () => { void Promise.all([
      request<Approval[]>(`/api/会话/${encodeURIComponent(id)}/审批`),
      request<Workflow>(`/api/会话/${encodeURIComponent(id)}/工作台状态`),
    ]).then(([data, saved]) => { if (!stopped) {
        setApprovals(data); setWorkflow(saved)
        if (saved.顾客消息ID === latest) {
          setDecision(saved.判定); setVersion(latest)
        }
      } })
      .catch(e => { if (!stopped) setError(String(e)) }) }
    setApprovals([]); setWorkflow(null); refresh()
    const timer = setInterval(refresh, 3000)
    return () => { stopped = true; clearInterval(timer) }
  }, [customer, id, latest])
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError('')
    try { await action() } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }
  const judge = () => run(async () => {
    const selected = id
    const result = await request<Decision>('/api/判定', { 会话ID: id, 看到消息数: active?.消息.length })
    if (selection.current !== selected) return
    setDecision(result); setVersion(latest)
    setText(result.主卡?.话术 || result.本轮处置.map(d => d.话术).filter(Boolean).join('\n'))
  })
  const send = () => run(async () => {
    const signature = `${id}:${customer}:${text}`
    if (pendingSend.current?.signature !== signature) {
      pendingSend.current = { signature, key: crypto.randomUUID() }
    }
    const 请求ID = pendingSend.current.key
    if (customer) await request(`/api/会话/${encodeURIComponent(id)}/顾客消息`, { 内容: text, 请求ID })
    else {
      if (!decision || version !== latest) throw new Error('有新消息，请重新查看依据后发送')
      if (sendPolicy(text, { ...active!, 建议: decision.主卡 ?? undefined,
        本轮处置: decision.本轮处置 }, true).kind !== 'ready') {
        throw new Error('请完成原有发送检查与处置后再发送')
      }
      await request(`/api/会话/${encodeURIComponent(id)}/发送`, {
        轮次: decision.轮次, 话术: text, 采用的处置id: [], 请求ID,
      })
    }
    pendingSend.current = null
    setText(''); setDecision(null); await load()
  })
  if (!customer) {
    const currentWorkflow = workflow?.顾客消息ID === latest ? workflow : null
    const session = active ? { ...active, 草稿: text, 报备: currentWorkflow?.报备 ?? undefined,
      建议: version === latest ? decision?.主卡 ?? undefined : undefined,
      本轮处置: version === latest ? decision?.本轮处置 : undefined } : null
    const action = (kind: '报备' | '转交') => run(async () => {
      if (!decision || version !== latest) throw new Error('请先查询当前消息的判定')
      const receipt = await request<{ 单号: string }>(`/api/会话/${encodeURIComponent(id)}/${kind}`, { 轮次: decision.轮次 })
      setWorkflow(await request<Workflow>(`/api/会话/${encodeURIComponent(id)}/工作台状态`))
      setSessions(all => all.map(s => s.会话ID !== id ? s : kind === '报备'
        ? { ...s, 报备: { 等待分钟: 0, 工单号: receipt.单号 } }
        : { ...s, 转交: { 工单号: receipt.单号 } }))
    })
    const approvalAction = (path: string, body: unknown = {}) => run(async () => {
      await request(`/api/会话/${encodeURIComponent(id)}/审批${path}`, body)
      setApprovals(await request<Approval[]>(`/api/会话/${encodeURIComponent(id)}/审批`))
      setWorkflow(await request<Workflow>(`/api/会话/${encodeURIComponent(id)}/工作台状态`))
      await load()
    })
    return <div className="flex flex-col h-full">
      <div className="border-b p-2 flex gap-4"><a href="?">原始回放</a><a href="?live=customer">顾客窗口</a>
        <button disabled={!active || busy} onClick={() => { void run(async () => {
          const result = await request<{ 链接: string }>(`/api/会话/${encodeURIComponent(id)}/顾客链接`, {})
          setCustomerLink(new URL(result.链接, location.origin).href)
        }) }}>生成顾客专属链接</button>
        <button disabled={busy || !active} onClick={judge}>{busy ? '处理中…' : '判定当前新问题'}</button>
        {error && <span role="alert">{error}</span>}
      </div>
      <section aria-label="授权审批" className="border-b p-2 max-h-48 overflow-auto">
        <strong>授权审批 · 测试账号自审批</strong>
        {decision?.本轮处置.some(d => d.输出 === '报备') && <button className="ml-4" disabled={busy || !text.trim() || version !== latest}
          onClick={() => { void approvalAction('', { 轮次: decision.轮次, 话术: text, 顾客消息ID: latest.includes('.runtime.') ? latest : '' }) }}>提交当前回复草稿</button>}
        {approvals.map(a => <div key={a.id} className="mt-2 border p-2">
          <p>{a.状态}：{a.话术}</p>
          {a.状态 === '等待审批' && <button disabled={busy} onClick={() => { void approvalAction(`/${a.id}/批准`) }}>批准此版本</button>}
          {(a.状态 === '已批准' || a.状态 === '已发送') && <button disabled={busy || a.状态 === '已发送'} onClick={() => { void approvalAction(`/${a.id}/发送`) }}>发送已批准原文</button>}
        </div>)}
      </section>
      {customerLink && <p className="p-2 break-all">仅交给对应顾客：{customerLink}</p>}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <IconRail 会话数={sessions.length} />
        <SessionPanel sessions={inboxSessions(sessions, read, id)} activeId={id} onSelect={next => { setId(next); setDecision(null); setText('') }} />
        <ChatPanel session={session} 播放={snapshot} 隐藏回放 onDraftChange={setText} onSend={() => { if (!busy) void send() }} />
        <PrimerPanel session={session} 兜底={[]} onUseScript={() => setText(decision?.主卡?.话术 || '')}
          onReport={() => { void action('报备') }} onHandover={() => { void action('转交') }}
          onSendPending={() => setError('请在顶部授权审批区核对并发送已批准原文')}
          报备态={currentWorkflow?.报备态 ?? '等审批'} 判定中={busy} 已判定={Boolean(decision && version === latest)} 未判定={!decision}
          未开演={false} />
      </div>
    </div>
  }
  return <main className="mx-auto max-w-4xl p-6 h-full overflow-auto">
    <h1 className="text-xl font-bold">Primer · {customer ? '顾客窗口' : '客服工作台'}</h1>
    <p>本地实时消息 · 每 3 秒更新 · 依据查询需手动点击</p>
    <nav className="my-3 flex gap-4"><a href="?live=customer">顾客窗口</a><a href="?live=agent">客服工作台</a><a href="?">历史回放</a></nav>
    <label>会话 <select aria-label="会话" value={id} onChange={e => { setId(e.target.value); setDecision(null); setText('') }}>
      {sessions.filter(s => !s.会话ID.startsWith('S_DEMO')).map(s => <option key={s.会话ID} value={s.会话ID}>{s.会话ID} · {s.买家昵称}</option>)}
    </select></label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <section aria-label="消息记录" className="my-4 border rounded p-3 max-h-80 overflow-auto">
      {active?.消息.map(m => <p key={m.message_id} className="mb-2"><strong>{m.角色}：</strong>{m.message_text}</p>)}
    </section>
    {!customer && <section className="my-4">
      <button disabled={busy || !active} onClick={judge}>查看依据并生成草稿</button>
      {decision && <div><p>{version !== latest ? '消息已更新，请重新查询依据' : '请核对依据并编辑回复'}</p>
        {decision.主卡?.依据.map((e, i) => <p key={i}>{e.出处}：{e.摘要}</p>)}
        {!decision.主卡?.依据.length && <p>本次主卡未提供可展示依据，请谨慎核对。</p>}
      </div>}
    </section>}
    <label>{customer ? '新问题' : '编辑回复'}<textarea aria-label={customer ? '新问题' : '编辑回复'} value={text} onChange={e => setText(e.target.value)} maxLength={4000} rows={4} className="block w-full border p-3" /></label>
    <button className="mt-3 border rounded px-4 py-2" disabled={busy || !text.trim() || !active || (!customer && (!decision || version !== latest))} onClick={send}>{busy ? '处理中…' : '发送'}</button>
  </main>
}
