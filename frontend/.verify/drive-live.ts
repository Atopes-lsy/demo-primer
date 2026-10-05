/**
 * 驱动 `App()` 走**真后端**（`127.0.0.1:8000`）的几条真窗口，把三条改动在真数据上
 * 过一遍。
 *
 * # 为什么单开这一条（别的七条全是打桩的）
 *
 * `drive-gap` 那三幕证的是**逻辑**：夹具照抄真窗口的消息 ＋ 真录的一张卡，跑得准
 * 但只在三条窗口上。`scan-bubbles.cjs` 覆盖 112 条，可它是**照抄一遍 `真代发`** ——
 * App 改了它不会跟着改，两边迟早分叉，而分叉的样子是「扫描说全绿、屏幕上还漏」。
 *
 * 这一条不走桩：`fetch` 只加个源，其余照打。**它证的才是「真后端 × 真 App」**。
 *
 * # 要证的三条（都是 2026-10-06 用户报的）
 *
 *   ① **一轮只留一条答复**（`一轮留一条答复`）：S00077 轮 1 日志里两句客服话，
 *      客服按［采用］发出去一句之后，屏上这一轮**只剩那一句**，垫话不上屏。
 *   ② **同一轮里同一句话只发一条**（`真代发` 那处 `findIndex` 去重）：S00226 轮 2
 *      后端为三条主张各回一条，话术一字不差 —— 屏上只能有一条。顺带查**代发的
 *      `message_id` 全屏不重复**（撞了 `MessageList` 会少画一条，且不报错）。
 *   ③ **没判过的会话不该被沉底**：真后端答得上，所以左栏顺序**一条都不该动**
 *      （`判没过` 是空的）。这一条是「沉底」那个改动的反向闸门 —— 只写「该沉的
 *      沉了」的话，把左栏整个倒过来也照样绿。
 *
 * ⚠️ **撞上［一键报备］／［立即转交］的窗口就跳过（不算失败）**：报备那一档要走
 * 完「提交 → 等 6 秒审批 → 一键发送」，转交那一档走完这通对话就不归 Primer 了。
 * 两条都不是这一份要证的东西，硬走只会把探针拖长、把红绿搅浑。
 *
 * 跑法（**后端要起着**）：`node .verify/drive-live.cjs [格间隔毫秒]`
 */
import App from '../src/App'
import { 轮次归属 as 归属 } from '../src/data/轮次'
import { __驱动 } from './react.cjs'

const { 冲刷, 收尾 } = __驱动

declare const require: (s: string) => any
declare const globalThis: any
declare const process: any

const 源 = 'http://127.0.0.1:8000'
const 格间隔 = Number(process.argv[2] ?? 40)

/** 要走的窗口：都是**只出［采用］或者没有卡**的，走得到头。 */
const 要走的 = [
  { id: 'S00077', 说: '一轮两句客服话 ＋ 有卡 → 只留一条' },
  { id: 'S00226', 说: '轮 2 三条一字不差的主张 → 只发一条' },
  { id: 'S00117', 说: '跨轮同语 4 处 → 一句都不该被误删' },
  { id: 'S00364', 说: '整条没有卡 → 日志原话包一层' },
]

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

async function 稳(ms = 40) {
  await 睡(ms)
  走(冲刷(App))
  await 睡(20)
  走(冲刷(App))
}

function 看() {
  const 播放 = 抄下的.ChatPanel?.播放
  const 会话 = 抄下的.ChatPanel?.session ?? {}
  const 消息 = (会话.消息 ?? []) as any[]
  return {
    格: (播放?.已播格数 ?? 0) as number,
    共: (播放?.总格数 ?? 0) as number,
    停: (播放?.停在 ?? null) as string | null,
    草稿: (会话.草稿 ?? '') as string,
    消息,
    客服话: 消息.filter((m) => m.角色 === '客服'),
    代发话: 消息.filter((m) => m.角色 === 'AI'),
    列表: ((抄下的.SessionPanel?.sessions ?? []) as any[]).map((s) => s.会话ID),
  }
}

let 失败 = 0
function 断言(条件: boolean, 说明: string) {
  console.log(`   ${条件 ? '✓' : '✗'} ${说明}`)
  if (!条件) 失败++
}

// ── 装置：只给 fetch 加个源，其余照打真后端 ──────────────────
globalThis.window = { addEventListener() {}, removeEventListener() {} }
const 真取 = globalThis.fetch
globalThis.fetch = (路径: string, 选项?: any) =>
  真取(路径.startsWith('http') ? 路径 : 源 + 路径, 选项)

/** 这一场探针自己发出去的句子（终局拿它当「这一句有出处」）。 */
const 发过的: string[] = []

/** 停在［采用］上就采用并发送 —— 客服在这一格真会做的事。 */
async function 采用并发送() {
  抄下的.PrimerPanel.onUseScript()
  await 稳(60)
  const 草稿 = 看().草稿
  发过的.push(草稿)
  抄下的.ChatPanel.onSend(草稿)
  await 稳(60)
}

/** 演到某一幕结束。返回 `null` 表示撞上报备／转交，这一条跳过。 */
async function 演完一条(id: string) {
  let 跳过: string | null = null
  for (let t = 0; t < 240; t += 1) {
    const k = 看()
    if (k.格 >= k.共 && k.共 > 0) return { ...k, 跳过 }
    if (k.停 === '采用') {
      await 采用并发送()
      continue
    }
    // `判定中提示`（「正在判定…」）是**在飞的停格**，不是客服要点的按钮 ——
    // 等它。真后端一次判定要一两秒，当跳过处理的话这一条一分钟都演不完。
    if (k.停 !== null && k.停 !== '正在判定…') {
      跳过 = k.停
      return { ...k, 跳过 }
    }
    await 稳(300)
  }
  return { ...看(), 跳过, 超时: true }
}

async function 主() {
  走(冲刷(App))
  await 稳(300)

  const 原始列表 = 看().列表
  if (!原始列表.length) {
    console.log('左栏一条会话都没有 —— 后端没起？')
    process.exit(1)
  }
  console.log(`真后端：${原始列表.length} 条会话\n`)

  for (const { id, 说 } of 要走的) {
    const 目标 = 抄下的.SessionPanel.sessions.find((s: any) => s.会话ID === id)
    if (!目标) {
      console.log(`${id} —— 列表里没有，跳过`)
      continue
    }
    console.log(`── ${id}（${说}）`)
    抄下的.ChatPanel.播放?.暂停()
    抄下的.SessionPanel.onSelect(id)
    await 稳(200)
    抄下的.ChatPanel.播放.设格间隔(格间隔)
    抄下的.ChatPanel.播放.播放()

    const 终 = await 演完一条(id)
    if (终.跳过) {
      console.log(`   ⤵︎ 撞上「${终.跳过}」，这一条跳过（不判红绿）\n`)
      continue
    }
    console.log(`   演到 ${终.格}/${终.共} 条`)
    终.消息.forEach((m: any, i: number) =>
      console.log(
        `     [${i}] ${m.角色}${m.署名 ? `「${m.署名}」` : ''}  ${String(m.message_text).slice(0, 34)}`,
      ),
    )

    const 裸的 = 终.客服话.filter((m: any) => !发过的.includes(m.message_text))
    console.log(`   裸的：${裸的.map((m: any) => `「${String(m.message_text).slice(0, 18)}…」`).join('、') || '—'}`)
    断言(裸的.length === 0, `真后端上这一条屏上一句裸的客服话都没有（实际 ${裸的.length} 句）`)

    /* **一条轮里同一个话术只发一条**（`真代发` 那处去重）。按轮算，不跨轮 ——
       跨轮那种是顾客又问了一遍，那一轮必须回。 */
    const 原归属 = 归属(目标.消息)
    const 按轮 = new Map<number, string[]>()
    终.代发话.forEach((m: any) => {
      const 轮 = 原归属[m.消息序号] ?? 0
      按轮.set(轮, [...(按轮.get(轮) ?? []), m.message_text])
    })
    const 轮内重复 = [...按轮].filter(([, 文]) => new Set(文).size !== 文.length)
    断言(
      轮内重复.length === 0,
      `每一轮里没有重复的话术（实际 ${轮内重复.map(([轮]) => `轮${轮}`).join('、') || '无'}）`,
    )
    /* `message_id` 全屏不重复：撞了 `MessageList` 会少画一条**而且不报错**
       （`buildAutoMessage` 那段注释写着）。 */
    const ids = 终.代发话.map((m: any) => m.message_id)
    断言(new Set(ids).size === ids.length, `代发的 message_id 互不相同（${ids.length} 条）`)

    // 演一条就把它的判定缓存清干净，免得影响下一条
    抄下的.ChatPanel.播放.暂停()
    await 稳(60)
    console.log('')
  }

  /* **沉底的反向闸门。** 真后端答得上，`判没过` 就该是空的 —— 左栏顺序一条都
     不许动。只写「该沉的沉了」的话，把左栏整个倒过来也照样绿。 */
  const 现在的 = 看().列表
  断言(
    现在的.length === 原始列表.length && 现在的.every((x, i) => x === 原始列表[i]),
    `真后端答得上时左栏顺序一条不动（${原始列表.length} 条）`,
  )
  const 演示位 = 现在的.map((x: string, i: number) => (x.startsWith('S_DEMO') ? i : -1)).filter((i: number) => i >= 0)
  断言(
    演示位.length === 2,
    `两条演示线还在列表里（实际 ${演示位.length} 条，位置 ${演示位.join('、')}）`,
  )
  console.log(`   列表尾：${现在的.slice(-4).join('、')}`)

  console.log(`\n${失败 === 0 ? '全绿' : `红了 ${失败} 条`}`)
  收尾()
  process.exit(失败 === 0 ? 0 : 1)
}

void 主()
