/**
 * 左栏**顺序** —— 只证一件事：`合会话列表` 排完之后，屏幕上从前十条到末尾是谁。
 *
 * 被证的是 2026-10-05 那条改动：「顾客把同一件事说了两遍的窗口垫底」
 * （`src/data/重复会话.ts`）。要落成三件可数的事：
 *
 *   ① 演示两条仍然钉最前，A 在 B 前（片子的叙事顺序，不能动）；
 *   ② 真窗口的**前十条**是那片干净的头（S00364 … S00200）；
 *   ③ 垫底那 **29** 条**一条不少、一条不多**地落在最后 29 个位置，
 *      而且它们内部仍是最近时间倒序（`S00474` 在最前）。
 *
 * ⚠️ **2026-10-06 第 ③ 条从 28 变 29**：用户拍板把 `S00381` 郭a\*\* 也挪到后面
 * （理由不是「同一件事说了两遍」，`重复会话.ts` 尾巴上那一段写着为什么）。
 * 它是**手工抄一遍**的那份期望，跟着多加一条 —— 加完落在第 85 位（那一组的
 * 第 2 个，组内按最近时间倒序），**不是最后一格**：这一条证的是「挪出行列」，
 * 不是「排在第 112 位」。
 *
 * 走的是真 `App`、真 `合会话列表`、真 `重复会话`，喂的是**录下来的**那份
 * `/api/会话列表`（`%TEMP%/列表.json`，114 条 = 112 真窗口 ＋ 演示两条）。
 * 判定那一路回的是录下来的真响应，本轮驱动用不到它 —— 播放器一次都没放。
 *
 * ⚠️ 文件名是 ASCII：要当 `node .verify/drive-list.cjs` 跑（Git Bash 递中文参数
 * 给 node 会乱码）。
 */
import App from '../src/App'
import { __驱动 } from './react.cjs'

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

// ── 装置 ──────────────────────────────────────────────────────
globalThis.window = { addEventListener() {}, removeEventListener() {} }

const 读 = (名: string) =>
  JSON.parse(require('fs').readFileSync(`C:/Users/Atopes/AppData/Local/Temp/${名}`, 'utf8'))

const 窗口们: any[] = 读('列表.json')
const 判定 = 读('判1.json')

globalThis.fetch = async (路径: string) => {
  const p = String(路径)
  const 回 = (值: unknown) => ({ ok: true, json: async () => 值 })
  if (p.includes('会话列表')) return 回(窗口们)
  if (p.includes('判定')) return 回(判定)
  if (p.includes('需求分解')) return 回({ 会话ID: '', 值: '' })
  return 回({})
}

/** 屏幕上左栏真正的顺序。 */
async function 看到列表(): Promise<any[]> {
  走(冲刷(App))
  await 睡(200)
  走(冲刷(App))
  await 睡(60)
  return (抄下的.SessionPanel?.sessions ?? []) as any[]
}

/**
 * 期望：垫底的那 29 条。**这里重新抄一遍、不从 `重复会话.ts` 导** ——
 * 导过来的话这一条就退化成「排序对不对」，而漏写一条、多写一条照样全过。
 */
const 垫底 = [
  'S00474', 'S00381', 'S00303', 'S00285', 'S00232', 'S00161', 'S00134', 'S00132',
  'S00130', 'S00109', 'S00103', 'S00099', 'S00093', 'S00086', 'S00083', 'S00080',
  'S00079', 'S00068', 'S00063', 'S00061', 'S00051', 'S00040', 'S00032', 'S00024',
  'S00022', 'S00013', 'S00009', 'S00008', 'S00006',
].sort() // 只用来比集合；顺序另证

let 失败 = 0
function 断言(条件: boolean, 说明: string) {
  console.log(`   ${条件 ? '✓' : '✗'} ${说明}`)
  if (!条件) 失败++
}

async function 主() {
  const 列表 = await 看到列表()
  const 编号 = 列表.map((s) => s.会话ID)
  const 真 = 编号.filter((i) => i !== 'S_DEMO_A' && i !== 'S_DEMO_B' && !i.startsWith('S_DEMO'))
  console.log(`左栏 ${编号.length} 条（真窗口 ${真.length} 条）\n`)

  // ① 演示两条最前，A 在 B 前
  console.log('① 演示两条钉最前')
  断言(编号.length === 114, `114 条上屏（实际 ${编号.length}）`)
  断言(
    编号[0] === 'S_DEMO_A' && 编号[1] === 'S_DEMO_B',
    `A 在 B 前（实际 ${编号[0]} / ${编号[1]}）`,
  )

  // ② 真窗口前十条
  const 前十条 = 真.slice(0, 10)
  const 应是 = ['S00364', 'S00362', 'S00336', 'S00322', 'S00277', 'S00268', 'S00226', 'S00223', 'S00203', 'S00200']
  console.log('\n② 真对话前十条（干净的那片头）')
  断言(前十条.join(',') === 应是.join(','), `实际 ${前十条.join(', ')}`)

  // ③ 垫底的那 29 条：集合一致、位置在最后、内部仍是最近时间倒序
  console.log('\n③ 垫底的那 29 条')
  const 尾巴 = 真.slice(-29)
  const 集合一致 =
    尾巴.length === 垫底.length &&
    尾巴.map((i) => i).sort().join(',') === 垫底.join(',')
  断言(
    集合一致,
    `末尾 29 条正是那 29 条（实际 ${尾巴.slice(0, 4).join(', ')} … ${尾巴.slice(-2).join(', ')}）`,
  )
  const 时间 = 尾巴.map((i) => 列表.find((s) => s.会话ID === i)?.最近时间 ?? '')
  const 倒序 = 时间.every((t, k) => k === 0 || 时间[k - 1] >= t)
  断言(倒序, `尾巴内部仍是最近时间倒序（首 ${时间[0]} → 末 ${时间.at(-1)}）`)

  // 剩下那 83 条也还该是倒序 —— 挪动只发生在两段的边界上
  const 干净 = 真.slice(0, -29)
  const 净时间 = 干净.map((i) => 列表.find((s) => s.会话ID === i)?.最近时间 ?? '')
  断言(
    净时间.every((t, k) => k === 0 || 净时间[k - 1] >= t),
    `前 83 条仍是最近时间倒序（首 ${净时间[0]} → 末 ${净时间.at(-1)}）`,
  )

  console.log(`\n${失败 === 0 ? '全过' : `有 ${失败} 条没过`}`)
  收尾()
  process.exit(失败 === 0 ? 0 : 1)
}

void 主()
