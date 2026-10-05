/**
 * 扫**全部真窗口**，把 `App.真代发` 会造出来的绿气泡按轮算一遍，找**重复**。
 *
 * 用户 2026-10-06 报的第二件事：「我发现有的绿色气泡重复发送了多次」。
 *
 * 判据（照抄 `App.真代发`，一个字都不多算）：
 *   - 只认 `本轮处置` 里 `输出 ∈ {AI直发, 报备}` **而且带话术**的那些（第一来源）；
 *   - 这一轮一条都没有、`主卡` 又是 `null` 时，**日志里每句客服话各造一条**（第二来源）；
 *   - 转交之后的轮不算（本扫描里没有转交这个输入，真窗口带转交的是 0 条）。
 *
 * 报的是两件事：
 *   - **同一条话术在同一条窗口里出现两次以上**（跨轮重复）—— 安抚话术／收尾话术
 *     都是**固定表**，同一句话本来就可能在多个轮次里各造一个气泡；
 *   - **同一轮里两次以上**（`条.map` 没有去重，`本轮处置` 里两条同输出同话术时）。
 *
 * 跑法：`node .verify/scan-bubbles.cjs [并发数] [窗口数]`，要真后端在 :8000。
 */
const fs = require('fs')

const 并发 = Number(process.argv[2] ?? 6)
const 上限 = Number(process.argv[3] ?? 999)

const 列表 = JSON.parse(
  fs.readFileSync('C:/Users/Atopes/AppData/Local/Temp/live_list.json', 'utf8'),
)

/** 同 `data/轮次.ts` 的 `轮次归属`。 */
function 归属(ms) {
  const t = []
  let r = 0
  let 在 = false
  for (const m of ms) {
    if (m.角色 === '买家') {
      if (!在) r += 1
      在 = true
    } else {
      在 = false
    }
    t.push(r)
  }
  return t
}

const AI名义 = new Set(['AI直发', '报备'])

const 窗口们 = 列表.filter((w) => !w.会话ID.startsWith('S_DEMO')).slice(0, 上限)

/** 问一轮判定。失败返回 null（`取判定` 那边也是这么吞的）。 */
async function 问(会话ID, 轮次, 当前时间, 看到消息数) {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/%E5%88%A4%E5%AE%9A', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 会话ID, 轮次, 当前时间, 看到消息数 }),
    })
    if (!res.ok) return { 错: `HTTP ${res.status}` }
    return await res.json()
  } catch (e) {
    return { 错: String(e) }
  }
}

/** 一条窗口：把每一轮的判定打回来，照 `真代发` 算出气泡。 */
async function 扫一条(w) {
  const ms = w.消息
  const G = 归属(ms)
  const 末刻 = ms[ms.length - 1].发送时间
  const 轮数 = Math.max(...G)
  const 泡 = []
  const 轮况 = []
  for (let r = 1; r <= 轮数; r += 1) {
    const 看到 = G.lastIndexOf(r) + 1
    const j = await 问(w.会话ID, r, 末刻, 看到)
    if (!j || j.错) {
      轮况.push(`轮${r}:判定没答上来(${j?.错 ?? '空'})`)
      continue
    }
    const 条 = (j.本轮处置 ?? []).filter((d) => AI名义.has(d.输出) && d.话术)
    const 有卡 = Boolean(j.主卡)
    if (条.length) {
      条.forEach((d) => 泡.push({ 轮: r, 署名: d.输出, 文: d.话术, 来源: '处置' }))
    } else if (!有卡) {
      const 原话 = ms.filter((m, i) => G[i] === r && m.角色 === '客服')
      原话.forEach((m, 序) => 泡.push({ 轮: r, 署名: 'AI直发', 文: m.message_text, 来源: `原话${序}`, 未判: true }))
    }
    轮况.push(
      `轮${r}:${有卡 ? j.主卡.形态 : 'null'}·处置${(j.本轮处置 ?? []).length}${j.看到消息数 === undefined ? '' : ''}`,
    )
  }
  return { 会话ID: w.会话ID, 昵称: w.买家昵称, 条数: ms.length, 泡, 轮况 }
}

async function 主() {
  const 出 = []
  let i = 0
  await Promise.all(
    Array.from({ length: 并发 }, async () => {
      while (i < 窗口们.length) {
        const w = 窗口们[i++]
        const r = await 扫一条(w)
        出.push(r)
        process.stderr.write(`\r扫完 ${出.length}/${窗口们.length}`)
      }
    }),
  )
  process.stderr.write('\n')

  const 重复窗口 = []
  const 没答窗口 = []
  let 泡总数 = 0
  for (const r of 出.slice().sort((a, b) => a.会话ID.localeCompare(b.会话ID))) {
    泡总数 += r.泡.length
    const 按文 = new Map()
    for (const b of r.泡) 按文.set(b.文, (按文.get(b.文) ?? []).concat(b))
    for (const [文, bs] of 按文) {
      if (bs.length > 1) {
        重复窗口.push({ 会话ID: r.会话ID, 文, 处数: bs.length, 轮: bs.map((b) => `${b.轮}(${b.来源})`).join('、') })
      }
    }
    if (r.轮况.some((s) => s.includes('没答上来'))) 没答窗口.push(r.会话ID)
  }

  console.log(`\n扫了 ${出.length} 条窗口，算出气泡 ${泡总数} 个。`)
  console.log(`\n=== 同一条话术在同一窗口里出现多次：${重复窗口.length} 处 ===`)
  重复窗口.forEach((d) =>
    console.log(`  ${d.会话ID}  ${d.处数} 次（轮 ${d.轮}）  「${String(d.文).slice(0, 40)}…」`),
  )
  console.log(`\n=== 有轮没答上来的窗口：${没答窗口.length} 条 ===`)
  console.log('  ' + (没答窗口.join(' ') || '—'))
  fs.writeFileSync(
    'C:/Users/Atopes/AppData/Local/Temp/scan-bubbles.json',
    JSON.stringify(出, null, 1),
  )
  console.log('\n明细写在 Temp/scan-bubbles.json')
}

void 主()
