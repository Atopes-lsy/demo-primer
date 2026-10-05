/**
 * 临时探针（跑完就删）：复现「同一句孕期话术发了两次」。
 *
 * 和 `drive-demo.ts` 的差别只有一处：**不演 S7 那一串**（不补禁语、不走拦截条），
 * 而是照着一个只看卡片的人会做的事走 —— 第 3 格［采用］→［发送］，时间线往前走
 * 到第 4 格，卡片上还是同一句话，于是再［采用］→［发送］一次。两次都是**单击**，
 * 没有任何一次是手滑双击。
 *
 * 要回答的是：第二个副本到底是「一次点击被处理了两遍」，还是「卡片在第 4 格
 * 又给了同一个发送口子」。所以每一停都把聊天区原样铺开 ＋ 跑 `找像的`。
 */
import App from '../src/App'
import AdviceCard from '../src/components/plugin/AdviceCard'
import { __驱动 } from './react.cjs'
import { 线一会话 } from '../src/data/剧本'

const { 冲刷, 收尾 } = __驱动

declare const require: (s: string) => any
declare const globalThis: any

const 桩名 = ['IconRail', 'SessionPanel', 'ChatPanel', 'PrimerPanel'] as const
type 桩 = (typeof 桩名)[number]
const 抄下的: Partial<Record<桩, any>> = {}

function 走(节点: any): void {
  if (节点 == null || typeof 节点 === 'boolean') return
  if (Array.isArray(节点)) {
    节点.forEach(走)
    return
  }
  if (typeof 节点 !== 'object' || !节点.$$元素) return
  const 名 = 节点.type?.__名 as 桩 | undefined
  if (名 && (桩名 as readonly string[]).includes(名)) 抄下的[名] = 节点.props
  const 子 = 节点.props?.children
  if (子 !== undefined) 走(子)
}

const 睡 = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function 稳(ms = 60) {
  await 睡(ms)
  走(冲刷(App))
  await 睡(20)
  走(冲刷(App))
}

const 读 = (名: string) =>
  JSON.parse(require('fs').readFileSync(`C:/Users/Atopes/AppData/Local/Temp/${名}`, 'utf8'))

const 真窗口们: any[] = 读('list.json')
const 卡1 = 读('line1_1.json')
const 卡2 = 读('line1_2.json')

globalThis.window = { addEventListener() {}, removeEventListener() {} }

globalThis.fetch = async (路径: string, 选项?: any) => {
  const 体 = 选项?.body ? JSON.parse(选项.body) : undefined
  const 回 = (值: unknown) => ({ ok: true, json: async () => 值 })
  const p = String(路径)
  if (p.includes('会话列表')) return 回([线一会话, ...真窗口们])
  if (p.includes('判定')) {
    if (体?.会话ID === 'S_DEMO_A') return 回(体?.轮次 === 2 ? 卡2 : 卡1)
    return 回({
      会话ID: 体?.会话ID, 轮次: 体?.轮次, 顾客情况: [], 安全事件: [],
      触发: [], 本轮处置: [], 主卡: null, 闸门: [],
    })
  }
  if (p.includes('需求分解')) return 回({ 会话ID: 体?.会话ID ?? '', 值: '' })
  if (p.includes('发送')) return 回({ 兑现主张: [], 报备单态: null })
  return 回({})
}

function 看() {
  const 播放 = 抄下的.ChatPanel?.播放
  const 会话 = 抄下的.ChatPanel?.session ?? {}
  return {
    格: (播放?.已播格数 ?? 0) as number,
    共: (播放?.总格数 ?? 0) as number,
    停: (播放?.停在 ?? null) as string | null,
    在放: Boolean(播放?.在放),
    草稿: (会话.草稿 ?? '') as string,
    消息: (会话.消息 ?? []) as any[],
    建议: 会话.建议 as any,
  }
}

function 铺(标: string) {
  const k = 看()
  console.log(`\n──── ${标} · 第 ${k.格}/${k.共} 格 · 停在=${k.停 ?? '—'}`)
  console.log(
    `     卡片：${k.建议 ? `${k.建议.形态} · ${k.建议.标题} · 话术=${String(k.建议.话术 ?? '').slice(0, 18)}…` : '（无）'}`,
  )
  k.消息.forEach((m, i) => {
    console.log(`  [${i}] 序号${String(m.消息序号).padStart(2)} ${String(m.角色).padEnd(2)}`)
    console.log(`        ${String(m.message_text ?? '')}`)
  })
}

function 最长公共(a: string, b: string): number {
  let 最 = 0
  const 短 = a.length <= b.length ? a : b
  const 长 = a.length <= b.length ? b : a
  for (let i = 0; i < 短.length; i++) {
    for (let j = i + 最 + 1; j <= 短.length; j++) {
      if (长.includes(短.slice(i, j))) 最 = j - i
      else break
    }
  }
  return 最
}

function 找像的(标: string) {
  const k = 看()
  const 命: string[] = []
  for (let i = 0; i < k.消息.length; i++) {
    for (let j = i + 1; j < k.消息.length; j++) {
      const a = String(k.消息[i].message_text ?? '')
      const b = String(k.消息[j].message_text ?? '')
      if (!a || !b) continue
      const 同 = 最长公共(a, b)
      if (a === b) 命.push(`  第 ${i}、${j} 条**一字不差**：${a}`)
      else if (同 >= 14) 命.push(`  第 ${i}、${j} 条连着重 ${同} 字：\n      ${a}\n      ${b}`)
    }
  }
  console.log(`\n  ${标} 里像的两条：`)
  console.log(命.length ? 命.join('\n') : '    （没有）')
  return 命
}

/** 客服发出的、和卡片那句话一模一样的有几条 —— 重发就看这个数。 */
function 数副本(卡片话术: string): number {
  return 看().消息.filter(
    (m) => m.角色 === '客服' && String(m.message_text).trim() === 卡片话术.trim(),
  ).length
}

async function 等到(条件: (k: ReturnType<typeof 看>) => boolean, 上限 = 8000) {
  for (let t = 0; t < 上限; t += 100) {
    await 稳(100)
    if (条件(看())) return 看()
  }
  return 看()
}

/** 树里所有的文字，按出现顺序。 */
function 文字们(节点: any, 收: string[] = []): string[] {
  if (节点 == null || typeof 节点 === 'boolean') return 收
  if (typeof 节点 === 'string' || typeof 节点 === 'number') {
    收.push(String(节点))
    return 收
  }
  if (Array.isArray(节点)) {
    节点.forEach((子) => 文字们(子, 收))
    return 收
  }
  if (typeof 节点 !== 'object' || !节点.$$元素) return 收
  文字们(节点.props?.children, 收)
  return 收
}

/**
 * 两张卡片元素：先是没发过那张，再是发过了那张。
 *
 * 顺序写死在这儿，`主` 那边靠它断言「［采用］该排在「已发送」前面」。
 */
function 两张卡() {
  const 卡 = {
    形态: '需要话术' as const,
    判断: '这次需要「话术」',
    标题: '✍️ 这条得你来发 · 涉个体差异',
    说明: ['顾客提到怀孕，属于个体差异；', '话术已带边界句，你确认后发送'],
    话术: '感谢您告诉我们。这款产品的成分里没有已知的孕期慎用成分。',
    依据: [],
  }
  const 一张 = (已发本轮: boolean) =>
    AdviceCard({
      advice: 卡,
      onUseScript() {},
      onReport() {},
      onHandover() {},
      onSendPending() {},
      报备态: '等审批',
      已发本轮,
    } as any)
  return [一张(false), 一张(true)]
}

async function 主() {
  // **卡片和 `App` 在同一轮渲染里出。** 分两次 `冲刷` 是不行的：那家伙只在
  // 「脏」的时候真渲染（首轮那次只有一回），第二次调用它会原样还你上一棵树 ——
  // 见 `react.cjs` 那段警告。
  const 树 = 冲刷(() => [...两张卡(), App()])
  const 卡文 = [...文字们(树[0]), ...文字们(树[1])]
  const 采用在 = 卡文.findIndex((t) => t.trim() === '采用')
  const 已发送在 = 卡文.findIndex((t) => t.includes('已发送'))
  const 画 = {
    采用数: 卡文.filter((t) => t.trim() === '采用').length,
    已发送数: 卡文.filter((t) => t.includes('已发送')).length,
    采用在前: 采用在 >= 0 && 已发送在 >= 0 && 采用在 < 已发送在,
  }
  console.log(
    `卡片直渲染（没发过 + 发过了）：［采用］${画.采用数} 颗 ·「已发送」${画.已发送数} 处 · 采用在前=${画.采用在前}`,
  )
  const 画对了 = 画.采用数 === 1 && 画.已发送数 === 1 && 画.采用在前

  走(树)
  await 稳(200)

  抄下的.ChatPanel.播放.设格间隔(700)
  抄下的.ChatPanel.播放.播放()

  // 走到第 3 格那一停（等的字是［发送］）
  const 到3 = await 等到((k) => k.格 >= 3 && k.停 !== null)
  console.log(`走到第 ${到3.格} 格（停在 ${到3.停}）`)
  const 卡片话术 = String(到3.建议?.话术 ?? '')
  铺('第 3 格 · 动手之前')

  // 第一下：［采用］→［发送］。**不补 S7** —— 卡片写什么就发什么。
  抄下的.PrimerPanel.onUseScript()
  await 稳(100)
  console.log(`  ［采用］→ 草稿 ${看().草稿.length} 字`)
  抄下的.ChatPanel.onSend(看().草稿)
  await 稳(200)
  铺('第 3 格 · 发完第一下')
  const 副本1 = 数副本(卡片话术)
  console.log(`  卡片那句话在聊天区里出现了 ${副本1} 次`)

  // 时间线自己往前走。到第 4 格 —— 卡片上还是同一句话。
  const 到4 = await 等到((k) => k.格 >= 4 && k.停 === null)
  console.log(`\n走到第 ${到4.格} 格（停在 ${到4.停 ?? '—'}）`)
  铺('第 4 格 · 第二个口子还在不在')
  const 还能采用 = Boolean(到4.建议?.话术)
  const 卡片收口了 = 抄下的.PrimerPanel?.本轮已发 === true
  console.log(
    `  卡片那一步的「本轮已发」= ${抄下的.PrimerPanel?.本轮已发} —— ${卡片收口了 ? '卡片已收口（画的是「已发送」）' : '⚠️ 没收口，［采用］还亮着'}`,
  )

  // 第二下：同一句话，再［采用］→［发送］一次。收口之后这一下**该是空手**：
  // 按钮不画了，`handleUseScript` 也不往回灌 —— 探针是直接调 prop 的，正好
  // 连「手快过重渲染」那一路一起验。
  if (还能采用) {
    抄下的.PrimerPanel.onUseScript()
    await 稳(100)
    const 灌进来 = 看().草稿.length
    console.log(`  ［采用］→ 草稿 ${灌进来} 字${灌进来 === 0 ? '（没收 ✓）' : '（还在灌 ⚠️）'}`)
    if (灌进来) {
      抄下的.ChatPanel.onSend(看().草稿)
      await 稳(200)
    }
  } else {
    console.log('  第 4 格卡片上没有话术 —— 第二个口子不存在')
  }

  铺('第 4 格 · 发完第二下')
  const 副本2 = 数副本(卡片话术)
  找像的('第 4 格 · 发完第二下')
  const 画的对 = 画对了
  const 过了 = 副本2 === 1 && 卡片收口了 && 画的对
  console.log(`\n卡片那句话在聊天区里出现了 ${副本2} 次（发第一下之后是 ${副本1} 次）`)
  console.log(
    过了
      ? '\n同一句话只发出去一次 ✅ —— 第 4 格的卡片写着「已发送」，第二下［采用］是空手'
      : `\n✗ 还会重发 —— 副本 ${副本2} 个，卡片收口=${卡片收口了}，卡片画的对=${画的对}`,
  )

  收尾()
  process.exit(过了 ? 0 : 1)
}

void 主()
