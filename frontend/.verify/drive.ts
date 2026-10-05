/**
 * 驱动 `App()` 走一遍**演示线一（小鹿）的前六格**，看这次改的四处对不对。
 *
 * 要证的（用户原话）：「出现卡片就暂停，采用就发送，发送完再出现客户对话」。
 * 落成四个可数的东西：
 *
 *   ① 第二格：S7 挪到这儿了 —— 停住等［发送］；
 *   ② 第三格：主卡上屏就停，**点［采用］时间线一格都不动**；
 *   ③ 第三格：点［发送］才放行；
 *   ④ 第五格：停格拆了（那一步不再停）。
 *
 * 喂的是真模块：真 `App`、真 `usePlayer`、真 `剧本.ts`、真 `判定.ts`。接口全部
 * 是假的 —— 演示线那一屏的右栏本来就归剧本管（`合建议` 里那条「剧本说没有就是
 * 没有」），假接口一律答 `主卡: null`，好让剧本那份说了算。
 */
import App from '../src/App'
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

/**
 * 等一等异步，然后把该重渲染的都渲染完，再抄一遍要用的 props。
 *
 * **冲刷两次**：第一次冲刷才会把 effect 跑起来（也就是把接口请求发出去），
 * 那一下的 `.then` 落在微任务里，得等下一次冲刷才看得见。只冲一次的话，读到的
 * 是「请求还没回来」那一刻的样子。
 */
async function 稳(ms = 40) {
  await 睡(ms)
  走(冲刷(App))
  await 睡(20)
  走(冲刷(App))
}

function 看() {
  const 播放 = 抄下的.ChatPanel?.播放
  return {
    格: 播放?.已播格数 as number,
    共: 播放?.总格数 as number,
    停: (播放?.停在 ?? null) as string | null,
    在放: Boolean(播放?.在放),
    草稿: (抄下的.ChatPanel?.session?.草稿 ?? '') as string,
    建议: 抄下的.ChatPanel?.session?.建议 as any,
    消息数: (抄下的.ChatPanel?.session?.消息 ?? []).length as number,
  }
}

function 报(标签: string) {
  const k = 看()
  console.log(
    `${标签.padEnd(30)} 第 ${String(k.格).padStart(2)}/${k.共} 格 · ` +
      `在放=${k.在放 ? 'y' : 'n'} · 停在=${k.停 === null ? '—' : `「${k.停}」`}`,
  )
}

// ── 装置 ──────────────────────────────────────────────────────
globalThis.window = { addEventListener() {}, removeEventListener() {} }

const 读 = (名: string) =>
  JSON.parse(require('fs').readFileSync(`C:/Users/Atopes/AppData/Local/Temp/${名}`, 'utf8'))

const 窗口们 = 读('列表.json')
/** 演示线那一屏，右栏归剧本管 —— 接口一律答「没有主卡」。 */
const 空判定 = (id: string) => ({
  会话ID: id, 轮次: 1, 顾客情况: [], 安全事件: [], 触发: [], 本轮处置: [], 主卡: null, 闸门: [],
})

globalThis.fetch = async (路径: string, 选项?: any) => {
  const 体 = 选项?.body ? JSON.parse(选项.body) : undefined
  const 回 = (值: unknown) => ({ ok: true, json: async () => 值 })
  if (String(路径).includes('会话列表')) return 回(窗口们)
  if (String(路径).includes('判定')) return 回(空判定(体?.会话ID ?? ''))
  if (String(路径).includes('需求分解')) return 回({ 会话ID: 体?.会话ID ?? '', 值: '' })
  if (String(路径).includes('发送')) return 回({ 兑现主张: [], 报备单态: null })
  return 回({})
}

/**
 * 一直等到时间线**停住**，返回那一刻的样子。
 *
 * 「停住」只有两种：停在某一格等人点（`停在` 非空），或者演到头了。**别拿
 * 「格数不再涨」当停住的判据** —— 格间隔是 1 秒、这里是每 100ms 看一眼，两拍
 * 之间必然连着好几次读数一样，那会把「正在走路的第 1 格」当成「停在第 1 格」。
 * （2026-10-04 第一次跑就是这么误报的：报出来「停在第一格」，而第一格根本
 * 没有停格。）
 */
async function 等到停(上限 = 20000) {
  for (let t = 0; t < 上限; t += 100) {
    await 稳(100)
    const k = 看()
    if (k.停 !== null) return k
    if (k.格 >= k.共) return k
  }
  return 看()
}

// ── 开跑 ──────────────────────────────────────────────────────
let 失败 = 0
function 断言(条件: boolean, 说明: string) {
  console.log(`   ${条件 ? '✓' : '✗'} ${说明}`)
  if (!条件) 失败++
}

async function 主() {
  走(冲刷(App))
  await 稳(120)
  报('开屏')
  console.log(`   落在 ${抄下的.SessionPanel?.activeId}（该是 S_DEMO_A）`)
  抄下的.ChatPanel.播放.设格间隔(1000)

  // ① 第二格：S7 挪到这儿，停住等［发送］
  抄下的.ChatPanel.播放.播放()
  const 一 = await 等到停()
  报('① 第一次停下来')
  断言(一.格 === 2, `停在第二格（实际 ${一.格}）—— S7 那一串挪到这儿了`)
  断言(一.停 === '发送', `提示行是「等你点［发送］」（实际「${一.停}」）`)

  // S7 在界面上是：敲一句带禁语的话 → 被拦 →［一键替换］→［发送］。拦截条活在
  // ChatPanel 里（这里是桩），所以直接送替换之后的那句 —— 验的是**放行**。
  抄下的.ChatPanel.onSend('亲，成分温和，但每个人肤质不同，建议先局部试用。')
  await 稳(60)
  断言(看().在放, '② 发出去之后时间线松开')

  const 三 = await 等到停()
  报('③ 主卡那一格停下')
  断言(三.格 === 3, `停在第三格（实际 ${三.格}）`)
  断言(三.停 === '发送', `提示行是「等你点［发送］」（实际「${三.停}」）`)
  断言(三.建议?.形态 === '需要话术', `主卡上屏了，形态「需要话术」（实际 ${三.建议?.形态}）`)

  // ② 点［采用］：只灌输入框，时间线一格不许动
  抄下的.PrimerPanel.onUseScript()
  await 稳(80)
  报('④ 点［采用］之后（立刻）')
  console.log(`   草稿：${看().草稿.slice(0, 26)}…`)
  断言(看().草稿.length > 0, '［采用］把话术灌进了输入框')
  await 稳(1600)
  报('⑤ 点［采用］之后等 1.6 秒')
  断言(看().格 === 3 && !看().在放, '［采用］没把时间线带走')

  // ③ 点［发送］：这才放行
  抄下的.ChatPanel.onSend(看().草稿)
  await 稳(80)
  报('⑥ 点［发送］之后（立刻）')
  断言(看().在放, '［发送］把时间线松开了')

  const 七 = await 等到停()
  报('⑦ 再停下来')
  断言(七.格 === 7, `下一次停就是第七格「一键报备」（实际 ${七.格}）—— 中间第五格那个停格真拆掉了`)
  断言(七.停 === '一键报备', `提示行是「等你点［一键报备］」（实际「${七.停}」）`)
  断言(看().消息数 >= 2, `客服发出去的两句都在对话里（消息 ${看().消息数} 条）`)

  console.log(`\n${失败 === 0 ? '全过' : `有 ${失败} 条没过`}`)
  收尾()
  process.exit(失败 === 0 ? 0 : 1)
}

void 主()
