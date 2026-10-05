/**
 * 驱动 `App()` 走三条真窗口，证**「没走三张卡、也没走绿气泡的客服话」这一类剩下的**
 * **两条路**、以及**「同一句话发好几遍」**都堵上了。
 *
 * 用户 2026-10-06 第三次报同一件事：「还是有没有经过绿色气泡发出的话，解决这个
 * 问题」，同一天又补了一句「我发现有的绿色气泡重复发送了多次」。
 *
 * 前两次修的是 `丢直发轮的话` 那一头（2026-10-05 有稿的一半、当天早上没稿的一半），
 * **两次修的都是同一支** —— 「Primer 自己答了、客服手没动过」。这一份查的是另外
 * 三条：**卡那轮的残余**、**判定没答上来的那些轮**、**同一句话的重复**。
 *
 * # 三条路（三幕，真数据实测 2026-10-06）
 *
 *   ① **卡那轮的第二句**：112 条真窗口里一轮有两句以上客服话的占 **63 轮／56 个
 *      窗口**（先「稍等，我查一下」再给结论那种）。`换客服话` 原来只把这一轮的
 *      **第一条**换成客服真发出去的那句，**第二条及以后原样留着** —— 它没有授权：
 *      没走卡（卡只批了一条），也没走绿气泡。S00006 轮 1 就是这个形状。
 *
 *      用户拍板：**一轮只留一条答复** —— 垫话丢掉，客服发出去的那句落在这一轮
 *      第一条的位置（落第一条不落最后一条：时间线一格一格走，落最后一条的话
 *      中间那一格「走了一格屏上没动静」）。
 *   ② **判定没答上来的那些轮**（后端没起／超时／404）：`真代发` 里这一轮什么都
 *      没有 ⇒ 不在 `直发轮` 里 ⇒ `丢直发轮的话` 一个字都不丢；而时间线按设计
 *      照走（`真窗口停` 的「判没答上来时放行」）。于是**整条窗口的客服话全部
 *      裸着上屏**。用户拍板：**原话包成绿气泡**（画面自洽），**并且这条对话
 *      排到会话列表最后** —— 屏幕上圆得住，片子里不能装作它过了。
 *   ③ **同一句话发好几遍**：`真代发` 的 `条.map()` 逐条造气泡，既没按话术去重、
 *      也没按轮去重。后端对**多条主张**会各回一条 `AI直发`，而话术是同一句
 *      —— S00226 轮 2 实测**三条一字不差**（开票／抬头／税号三条主张），屏上
 *      就是同一句话连发三次。全量 112 窗口扫下来这类 **17 处**。
 *
 * ⚠️ **文件名是 ASCII**：这一份要当 `node .verify/drive-gap.cjs` 跑，而 Git Bash
 * 把带中文的参数递给 node 会乱码。
 */
import App from '../src/App'
import { 轮次归属 as 归属 } from '../src/data/轮次'
import { __驱动 } from './react.cjs'

const { 冲刷, 收尾 } = __驱动

declare const require: (s: string) => any
declare const globalThis: any

const 桩名 = ['IconRail', 'SessionPanel', 'ChatPanel', 'PrimerPanel'] as const
type 桩 = (typeof 桩名)[number]
const 抄下的: Partial<Record<桩, any>> = {}

/** 走一遍树，把桩组件的 props 抄下来。 */
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

/** 冲刷两次：第一次才把 effect 跑起来（请求发出去），那一下的 `.then` 在微任务里。 */
async function 稳(ms = 40) {
  await 睡(ms)
  走(冲刷(App))
  await 睡(20)
  走(冲刷(App))
}

function 看() {
  const 播放 = 抄下的.ChatPanel?.播放
  const 会话 = 抄下的.ChatPanel?.session ?? {}
  const 右栏 = 抄下的.PrimerPanel ?? {}
  const 消息 = (会话.消息 ?? []) as any[]
  return {
    格: (播放?.已播格数 ?? 0) as number,
    共: (播放?.总格数 ?? 0) as number,
    停: (播放?.停在 ?? null) as string | null,
    草稿: (会话.草稿 ?? '') as string,
    待发句: (右栏.待发句?.message_text ?? '') as string,
    消息,
    客服话: 消息.filter((m) => m.角色 === '客服'),
    代发话: 消息.filter((m) => m.角色 === 'AI'),
  }
}

function 报(标签: string) {
  const k = 看()
  console.log(
    `${标签.padEnd(24)} 第 ${String(k.格).padStart(2)}/${k.共} 条 · ` +
      `停在=${k.停 === null ? '—' : `「${k.停}」`} · ` +
      `屏上 ${k.消息.length} 条（客服 ${k.客服话.length} ＋ 代发 ${k.代发话.length}）`,
  )
}

/** 一直看到条件成立为止。 */
async function 等到(条件: (k: any) => boolean, 上限 = 30000) {
  for (let t = 0; t < 上限; t += 100) {
    await 稳(100)
    const k = 看()
    if (条件(k)) return { ...k, 超时: false }
  }
  return { ...看(), 超时: true }
}

// ── 装置 ──────────────────────────────────────────────────────
globalThis.window = { addEventListener() {}, removeEventListener() {} }

const 读 = (名: string) =>
  JSON.parse(require('fs').readFileSync(`C:/Users/Atopes/AppData/Local/Temp/${名}`, 'utf8'))

const 窗口们: any[] = 读('列表.json')
const 目标 = 窗口们.find((w) => w.会话ID === 'S00006')
if (!目标) throw new Error('列表里没有 S00006')
const 目标2 = 窗口们.find((w) => w.会话ID === 'S00002')
if (!目标2) throw new Error('列表里没有 S00002')
const 目标3 = 窗口们.find((w) => w.会话ID === 'S00226')
if (!目标3) throw new Error('列表里没有 S00226')

/** 真录的一份「需要话术」卡（`判3.json`，S00474 第 3 轮）。 */
const 卡1 = 读('判3.json')

/** 这一幕里屏上**绝对不该出现**的那一句 —— 轮 1 的第二句客服话（真日志里的原话）。 */
const 残句: string = 目标.消息[2].message_text

/** 这几轮是**探针自己发出去**的。终局拿它当「这一句有出处」。 */
const 发过的: string[] = []

/** 判定答不答。`false` = **没答上来**（后端没起／超时／404 那三种）。第二幕靠它。 */
let 判定答得上 = true

/** 第三幕那一份：S00226 的真形状（后端 2026-10-06 现问现录）。 */
const 同语 = '支持开具电子发票，您在订单页申请就可以，我们会在规定时间内为您开出。'
const 一条 = (会话ID: string, 轮次: number, i: number) => ({
  ...卡1.本轮处置[0],
  id: `${会话ID}-${轮次}-${i}`,
  轮次,
  主张: `第 ${i} 条主张`,
  输出: 'AI直发',
  话术: 同语,
})
/** 轮 1 一条，轮 2 **三条一字不差**（开票／抬头／税号三条主张），轮 3 没有处置。 */
const S00226判定 = (轮次: number) => ({
  ...卡1,
  会话ID: 'S00226',
  轮次,
  主卡: null,
  本轮处置: 轮次 === 1 ? [一条('S00226', 1, 1)] : 轮次 === 2 ? [1, 2, 3].map((i) => 一条('S00226', 2, i)) : [],
})

globalThis.fetch = async (路径: string, 选项?: any) => {
  const 体 = 选项?.body ? JSON.parse(选项.body) : undefined
  const 回 = (值: unknown) => ({ ok: true, json: async () => 值 })
  const p = String(路径)
  if (p.includes('会话列表')) return 回(窗口们)
  if (p.includes('判定')) {
    if (!判定答得上) return { ok: false, json: async () => ({}) }
    const 会 = String(体?.会话ID ?? '')
    const 轮 = Number(体?.轮次 ?? 0)
    if (会 === 'S00226') return 回(S00226判定(轮))
    return 回({ ...卡1, 会话ID: 会, 轮次: 轮 })
  }
  if (p.includes('转交') || p.includes('报备'))
    return 回({ 状态: '等待审批', 行: [], 单号: 'JJ-S00006-1' })
  if (p.includes('需求分解')) return new Promise(() => {})
  if (p.includes('发送')) return { 兑现主张: [], 报备单态: null } && 回({ 兑现主张: [], 报备单态: null })
  return 回({})
}

// ── 开跑 ──────────────────────────────────────────────────────
let 失败 = 0
function 断言(条件: boolean, 说明: string) {
  console.log(`   ${条件 ? '✓' : '✗'} ${说明}`)
  if (!条件) 失败++
}

/** 停在［采用］上就采用并发送 —— 客服在这一格真会做的事。 */
async function 采用并发送() {
  抄下的.PrimerPanel.onUseScript()
  await 稳(60)
  const 草稿 = 看().草稿
  发过的.push(草稿)
  抄下的.ChatPanel.onSend(草稿)
  await 稳(60)
}

/** 屏上每一句客服话都得有出处：探针自己发的，或者带着 Primer 的署名。 */
function 扫一遍(标签: string, k: any) {
  console.log(`   屏上逐条（${标签}）：`)
  k.消息.forEach((m: any, i: number) =>
    console.log(
      `     [${i}] ${m.角色}  署名=${m.署名 ? `「${m.署名}」` : '——'}  ${String(m.message_text).slice(0, 30)}`,
    ),
  )
  const 裸的 = k.客服话.filter((m: any) => !发过的.includes(m.message_text))
  console.log(
    `   裸的：${裸的.map((m: any) => `「${String(m.message_text).slice(0, 20)}…」`).join('、') || '—'}`,
  )
  return 裸的
}

async function 主() {
  走(冲刷(App))
  await 稳(150)

  // ══════════════════════════════════════════════════════════
  // 第一幕 · 卡那轮：一轮只留一条答复
  // ══════════════════════════════════════════════════════════
  抄下的.SessionPanel.onSelect('S00006')
  await 稳(120)
  断言(看().共 === 8, `S00006 开屏：8 格没走（实际 ${看().格}/${看().共}）`)

  抄下的.ChatPanel.播放.设格间隔(200)
  抄下的.ChatPanel.播放.播放()

  // 每一轮都判成「需要话术」→ 每轮都停在［采用］上。
  for (const 轮 of [1, 2, 3]) {
    const 停 = await 等到((k) => k.停 === '采用')
    报(`轮 ${轮} 停下来`)
    断言(!停.超时 && 停.停 === '采用', `轮 ${轮} 停在［采用］上（实际「${停.停}」）`)
    await 采用并发送()
  }

  const 终 = await 等到((k) => k.格 >= k.共)
  报('演到头')
  断言(!终.超时 && 终.格 === 8, `演到第 8 格（实际 ${终.格}/${终.共}）`)

  const 裸1 = 扫一遍('第一幕', 终)
  断言(
    !终.客服话.some((m: any) => m.message_text === 残句),
    `轮 1 的第二句「${残句.slice(0, 18)}…」不在屏上（一轮只留一条答复）`,
  )
  /* 8 条日志里客服话 4 句（轮 1 两句、轮 2／3 各一句）—— 一轮留一条之后是 3 句，
     正好是探针发出去的那三句。**这是第一幕的钉子**：留两条就是 4 句。 */
  断言(
    终.客服话.length === 3 && 发过的.length === 3,
    `屏上三条客服话，正好是发出去的那三句（实际 ${终.客服话.length} / ${发过的.length}）`,
  )
  断言(裸1.length === 0, `屏上一句裸的客服话都没有（实际 ${裸1.length} 句）`)
  断言(
    终.消息.length === 7 && 终.共 === 8,
    `条数比日志少 1（丢了轮 1 那句垫话；盘面 7，格数仍是日志的 8 —— 时间线不因为丢字而少走一格）（实际 ${终.消息.length} / ${终.共}）`,
  )

  // ══════════════════════════════════════════════════════════
  // 第二幕 · 判定没答上来：包成绿气泡 ＋ 这条对话沉到最后
  // ══════════════════════════════════════════════════════════
  console.log('')
  判定答得上 = false
  抄下的.ChatPanel.播放.暂停()
  抄下的.SessionPanel.onSelect('S00002')
  await 稳(150)

  const 残2: string[] = 目标2.消息
    .filter((m: any) => m.角色 === '客服')
    .map((m: any) => m.message_text)

  抄下的.ChatPanel.播放.设格间隔(200)
  抄下的.ChatPanel.播放.播放()
  const 终2 = await 等到((k) => k.格 >= k.共)
  报('判定全灭，演到头')
  断言(!终2.超时 && 终2.格 === 目标2.消息.length, `S00002 一路演到头（实际 ${终2.格}/${终2.共}）`)

  const 裸2 = 扫一遍('第二幕', 终2)
  /* **这一条是不变量本身。** 判定没答上来 = 「不知道这一轮该不该走卡」——
     拿不准的时候把日志原话原样放上屏，读起来就是「我方凭空说了句话」，
     而屏幕上没有任何东西提示这一句没有出处。 */
  断言(裸2.length === 0, `判定没答上来时，屏上一句裸的客服话都没有（实际 ${裸2.length} 句）`)
  断言(
    残2.length > 0 && 残2.every((t) => 终2.代发话.some((m: any) => m.message_text === t)),
    `日志里那 ${残2.length} 句客服话**都**以 Primer 的名义上了屏（一句不少）`,
  )
  断言(
    终2.代发话.every((m: any) => Boolean(m.署名)),
    `每一条都带着署名（实际 ${JSON.stringify(终2.代发话.map((m: any) => m.署名))}）`,
  )
  断言(
    终2.消息.length === 目标2.消息.length,
    `屏上条数和日志一样多（${终2.消息.length} vs ${目标2.消息.length}）—— 包一层不添条`,
  )

  /* **沉底**：这条对话上了「未保证」名单，排在会话列表最后。用户拍板的
     「如果无法保证所有客服的话都经过primer就把该对话放到会话列表底部」。 */
  const 列表: any[] = (抄下的.SessionPanel?.sessions ?? []).map((s: any) => s.会话ID)
  断言(列表.length > 0, `拿得到会话列表（实际 ${列表.length} 条）`)
  断言(
    列表.at(-1) === 'S00002',
    `判定没答上来的那条沉到了列表最后（实际最后一条是 ${列表.at(-1)}）`,
  )

  // ══════════════════════════════════════════════════════════
  // 第三幕 · 同一轮里同一句话只发一条
  // ══════════════════════════════════════════════════════════
  console.log('')
  判定答得上 = true
  抄下的.ChatPanel.播放.暂停()
  抄下的.SessionPanel.onSelect('S00226')
  await 稳(150)
  抄下的.ChatPanel.播放.设格间隔(200)
  抄下的.ChatPanel.播放.播放()
  const 终3 = await 等到((k) => k.格 >= k.共)
  报('同语三条，演到头')
  const 同语气泡 = 终3.代发话.filter((m: any) => m.message_text === 同语)
  断言(
    同语气泡.length === 2,
    `那句话一共发两条 —— 轮 1 一条、轮 2 一条（实际 ${同语气泡.length} 条）` +
      `：**跨轮不去重**，顾客在轮 2 又把发票的事说了一遍，那一轮就不能不回`,
  )
  /* **同一轮里同一个话术只留一条**。后端为**每一条主张**各回一条 `AI直发`，而
     话术是同一句（S00226 轮 2 实测三条一字不差：开票／抬头／税号）。三条都造气泡
     就是同一句话在屏上连撒三遍 —— 用户 2026-10-06 报的「绿色气泡重复发送了多次」。
     去重**按轮**，不跨轮：跨轮那种是「顾客又问了一遍」，那一轮回一句是对的，
     要它换句话说是 `安抚话术表` 该管的事（见 `drive-gap.ts` 顶上 ③ 那条）。 */
  /* 气泡的 `消息序号` 沿用**锚那一格**（买家话的下标）—— 拿它反查这一条属于哪一轮。 */
  const 归属3 = 归属(目标3.消息)
  const 轮2的同语 = 终3.代发话.filter(
    (m: any) => m.message_text === 同语 && 归属3[m.消息序号] === 2,
  )
  终3.代发话.forEach((m: any) =>
    console.log(`     [轮${归属3[m.消息序号]}] ${m.message_id}  ${String(m.message_text).slice(0, 24)}`),
  )
  断言(
    轮2的同语.length === 1,
    `轮 2 那三条一字不差的主张只发出一条绿气泡（实际 ${轮2的同语.length} 条）`,
  )

  console.log(`\n${失败 === 0 ? '全绿' : `红了 ${失败} 条`}`)
  收尾()
  process.exit(失败 === 0 ? 0 : 1)
}

void 主()
