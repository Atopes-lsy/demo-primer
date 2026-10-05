/**
 * 临时探针（跑完就删）：
 * 用**真模型录下来的那两份响应**驱一遍演示线一（S_DEMO_A），**九格一格一格走**，
 * 每一格的聊天区原样铺开。
 *
 * 2026-10-05 这一版要回答的是**停格的位置**：一轮只停一次，就停在卡片那一格
 * （第 3 格），卡片之前一格都不许停；第 3 格等的是［发送］（整轮的活儿 ——
 * ［采用］→ 补禁语 → 被拦 →［一键替换］→［发送］—— 都在这一个停格里做完），
 * 在这一格点［采用］**不该**放行；第 5 格**不该**再停一次（客服这一轮已经发完了，
 * 该让顾客说下一句了）；剩下的停是 7［一键报备］、8［一键发送］。
 *
 * 喂的是真 `App`、真 `usePlayer`、真 `剧本.ts`、真 `判定.ts`。
 * 判定接口回的是 `line1_1.json` / `line1_2.json`（真模型跑的 S_DEMO_A 第 1、2 轮）。
 */
import App from '../src/App'
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
  }
}

/** 把聊天区原样铺开：**角色 / 署名 / 时间**都要，才看得出「谁说的」。 */
function 铺(标: string) {
  const k = 看()
  console.log(`\n──── ${标} · 第 ${k.格}/${k.共} 格 · 停在=${k.停 ?? '—'}`)
  k.消息.forEach((m, i) => {
    const 文 = String(m.message_text ?? '')
    console.log(
      `  [${i}] 序号${String(m.消息序号).padStart(2)} ${String(m.角色).padEnd(2)}` +
        ` 时=${String(m.发送时间).slice(11)} 署名=${m.署名 ?? '—'}`,
    )
    console.log(`        ${文}`)
  })
}

/** S7 那一串：客服在话术末尾补的那一句（含 K10 禁语「绝对不刺激」）。 */
const S7句 = '亲，这款绝对不刺激，您可以放心。'
/** K10 给的合规说法 —— ［一键替换］拿它换掉禁语（裸字符串替换，见 `ChatPanel`）。 */
const 合规句 = '成分温和，但每个人肤质不同，建议先局部试用'

/** 每两条消息之间最长的一段公共子串有多长 —— 「差不多意思」越长越像。 */
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

/** 全聊天区两两比一遍，把「意思差不多」的挑出来。 */
function 找像的(标: string) {
  const k = 看()
  const 命: string[] = []
  for (let i = 0; i < k.消息.length; i++) {
    for (let j = i + 1; j < k.消息.length; j++) {
      const a = String(k.消息[i].message_text ?? '')
      const b = String(k.消息[j].message_text ?? '')
      if (!a || !b) continue
      const 同 = 最长公共(a, b)
      // 14 个字连着一样就算「差不多」——比这短的巧合太多
      if (a === b) 命.push(`  第 ${i}、${j} 条**一字不差**：${a}`)
      else if (同 >= 14) {
        命.push(
          `  第 ${i}(${k.消息[i].角色})、${j}(${k.消息[j].角色}) 条连着重 ${同} 字：\n` +
            `      ${a}\n      ${b}`,
        )
      }
    }
  }
  console.log(`\n  ${标} 里像的两条：`)
  console.log(命.length ? 命.join('\n') : '    （没有）')
}

/**
 * **一个会话里，同一个 `消息序号` 只许有一条**（2026-10-05 加）。
 *
 * 序号是 `合消息` 认人的钥匙：`话术来源表` 按序号查出「这条归接口管」，查到就把
 * 文字（和署名）换成接口给的。两条消息共用一个号，那条**根本不归接口管**的
 * （客服现场手打的、或者顾客说的）会被一起换掉 —— 屏幕上就是同一句话出现两遍，
 * 而没有任何一处报错。
 *
 * 现场消息的号由 `App.handleSend` 分配，剧本的号由 `造消息` 写死，**两边各自
 * 都不知道对方用了哪个号** —— 这一条就是钉住那个交界的。
 */
function 查重号(标: string): boolean {
  const k = 看()
  const 见过 = new Map<number, number[]>()
  k.消息.forEach((m, i) => 见过.set(m.消息序号, [...(见过.get(m.消息序号) ?? []), i]))
  const 撞 = [...见过].filter(([, 哪几条]) => 哪几条.length > 1)
  console.log(`\n  ${标} 的序号：${k.消息.map((m) => m.消息序号).join(',') || '（空）'}`)
  if (!撞.length) {
    console.log('    没有重号 ✅')
    return true
  }
  for (const [号, 哪几条] of 撞) {
    console.log(`    ⚠️ 序号 ${号} 撞了，第 ${哪几条.join('、')} 条共用：`)
    哪几条.forEach((i) =>
      console.log(
        `       [${i}] ${k.消息[i].角色} 署名=${k.消息[i].署名 ?? '—'}  ${k.消息[i].message_text}`,
      ),
    )
  }
  return false
}

/** 等格号变掉（点了放行的那颗按钮之后，时间线要走 格间隔 才挪一步）。 */
async function 等到格变(格前: number, 上限 = 4000): Promise<number> {
  for (let t = 0; t < 上限; t += 100) {
    await 稳(100)
    if (看().格 !== 格前) return 看().格
  }
  return 看().格
}

async function 等到停(上限 = 20000) {
  for (let t = 0; t < 上限; t += 100) {
    await 稳(100)
    const k = 看()
    if (k.停 !== null) return k
    if (k.格 >= k.共) return k
  }
  return 看()
}

async function 主() {
  走(冲刷(App))
  await 稳(200)
  console.log(`开屏落在 ${抄下的.SessionPanel?.activeId}`)

  抄下的.ChatPanel.播放.设格间隔(700)
  抄下的.ChatPanel.播放.播放()

  // 一格一格走，每格都铺开一次。**每一停都得是它该停的那一颗按钮**，别的一律
  // 报错 —— 停多了、停早了，都是演示台上看得见的错。
  const 走到的: number[] = []
  const 停过的: string[] = []
  /** 顺序反了（AI 直发跑到客服那句后面）—— 演示台上看得见，退出码要带上它。 */
  let 顺序错 = false
  for (let t = 0; t < 200; t++) {
    await 稳(120)
    const k = 看()
    if (!走到的.includes(k.格)) {
      走到的.push(k.格)
      铺(`第 ${k.格} 格`)
    }
    if (k.停 && 停过的.at(-1) !== `${k.格}/${k.停}`) 停过的.push(`${k.格}/${k.停}`)
    if (k.格 >= k.共 && !k.在放) break
    if (k.停 === '采用') {
      console.log('  ⚠️ 有格子停在［采用］上 —— 现在没有哪一格该等它（整轮停在［发送］）')
      break
    }

    // 第 3 格（卡片那一格）：等的字是［发送］，整轮的活儿都在这一个停格里做完。
    if (k.停 === '发送') {
      // **停在这一格时，AI 直发那句就该在屏幕上**（2026-10-05 挪的）。
      // 分镜表 S6「含乙醇就地答了」在 S7「她改话术」**之前**：顾客那一句里两件事，
      // 系统先把答得了的那条答了，答不了的（孕期）才留在卡上等人。顺序倒过来的话，
      // 屏幕上就是「客服先答、AI 事后补一句」，而且那句话的时间戳还更早。
      if (!看().消息.some((m) => String(m.message_text).includes('不含乙醇'))) {
        console.log('  ⚠️ 停在这一格时 AI 直发那条还没上屏 —— S6 跑到 S7 后面去了')
        顺序错 = true
      } else {
        console.log('  停在这一格时 AI 直发那一句已经在屏幕上 ✓')
      }
      // **先确认这一格点［采用］不放行** —— 卡就在屏幕上，客服顺手点一下是真会
      // 发生的；时间线要是被它带走，S7 那一串（补禁语 → 被拦 → 替换）就没落点了。
      const 格前 = k.格
      抄下的.PrimerPanel.onUseScript()
      await 稳(100)
      const 草稿 = 看().草稿
      const 格后 = await 等到格变(格前)
      if (格后 !== 格前) {
        console.log(
          `  ⚠️ 第 ${格前} 格点［采用］把时间线带走了（${格前} → ${格后}）—— 这一格等的是［发送］`,
        )
        break
      }
      console.log(`  第 ${格前} 格：［采用］把话搬进输入框 ✓（${草稿.length} 字）· 不放行 ✓`)
      // 再走 S7：末尾补一句禁语 → 拦截条 →［一键替换］→［发送］
      const 补好 = 草稿 + S7句
      const 换掉 = 补好.replace('绝对不刺激', 合规句)
      console.log(`  S7：补「${S7句}」→ 换掉禁语 → 发送 ${换掉.length} 字`)
      抄下的.ChatPanel.onSend(换掉)
      await 稳(120)
      // 发出去之后再看一眼先后：**AI 直发那条要排在客服这句前面。** 客服停在这一格
      // 发的消息是按「步」插回原位的（见 `剧本.现场消息`），落错了槽位就会插到
      // AI 直发后面去 —— 序号也是乱的（3 排在 2 前面）。
      const 发完 = 看().消息
      const 直发在 = 发完.findIndex((m) => String(m.message_text).includes('不含乙醇'))
      const 客服在 = 发完.findIndex((m) => m.角色 === '客服' && String(m.message_text).includes(合规句))
      if (!(直发在 >= 0 && 客服在 > 直发在)) {
        console.log(`  ⚠️ 顺序反了 —— AI 直发在第 ${直发在} 条，客服那句在第 ${客服在} 条`)
        顺序错 = true
      } else {
        console.log(`  AI 直发（第 ${直发在} 条）在客服那句（第 ${客服在} 条）之前 ✓`)
      }
    } else if (k.停 === '一键报备') {
      抄下的.PrimerPanel.onReport()
      await 稳(150)
    } else if (k.停 === '一键发送') {
      抄下的.PrimerPanel.onSendPending()
      await 稳(150)
    } else if (k.停) {
      console.log(`  ⚠️ 没人处理这个停：${k.停}`)
      break
    }
    // **第一停必须落在卡片那一格（第 3 格）上。** 停在它前面 —— 「识别完这次要
    // 什么 → 出现卡片 → 停下」这条链子就断了：屏幕上写着「等你点［X］」而卡
    // 还没上屏。
    if (k.停 && k.格 < 3) {
      console.log(`  ⚠️ 第一停落在第 ${k.格} 格，卡片之前`)
      break
    }
  }

  // 停格清单对一遍：**这一轮的活干完了就不许再停**（第 5 格停过一次就是错）。
  const 该停的 = ['3/发送', '6/一键报备', '7/一键发送']
  console.log(`\n停过的：${停过的.join(' · ') || '（一次都没停）'}`)
  console.log(
    停过的.join(' · ') === 该停的.join(' · ')
      ? '  停格清单 ✅ 一轮一停 · 卡片那一格 · 发完就走'
      : `  ⚠️ 停格清单对不上 —— 该停的是 ${该停的.join(' · ')}`,
  )

  铺('演到头')
  找像的('演到头')
  const 号没撞 = 查重号('演到头')
  console.log(
    号没撞 ? '\n序号查重 ✅' : '\n序号查重 ✗ —— 同号的两条会被 `合消息` 一起换掉',
  )
  收尾()
  process.exit(号没撞 && !顺序错 ? 0 : 1)
}

void 主()
