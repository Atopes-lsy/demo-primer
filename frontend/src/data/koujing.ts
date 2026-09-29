/**
 * 口径表 —— 话题编号、可以说到哪一步、绝对不能说、推荐标准话术。
 *
 * 数据本体在仓库根的 `data/koujing.json`，前后端共用那一份：闸门 G1（后端）
 * 和输入框确认条（前端）必须按同一张表判定，各存一份迟早漂移。
 * 这个文件只负责把它包成带类型的接口。
 *
 * ⚠️ 原表标题写着「待改错」：限额数字与部分时效（K03 退款天数、K05 的 48 小时、
 * K07 价保时效）业务方还没确认。演示前跟泽晟核对，别把草稿当成定稿讲。
 */

import raw from '@data/koujing.json'

import type { GuardHit } from '../types'

/** 一个风险话题的口径。 */
export interface 口径条目 {
  /** 话题编号，如 K05。 */
  编号: string
  /** 风险话题名。 */
  话题: string
  /** 严重度：高 / 中 / 低。 */
  严重度: string
  /** 公司允许说到哪一步。 */
  可以说: string
  /** 绝对不能说。逐条列出，供字面扫描用。 */
  禁语: string[]
  /** 带占位符的禁语写成正则，如 `保证.{0,4}天.{0,2}到账`。 */
  禁语模式: string[]
  /** 原表里那条禁语的适用条件。不参与扫描，但别丢。 */
  备注: string
  /** 推荐标准话术。 */
  标准话术: string
}

export interface 补充禁语条目 {
  禁语: string
  口径: string
  建议: string
  理由: string
}

/** 口径表全表，保持 JSON 里的原顺序。 */
export const 口径表 = raw.口径表 as 口径条目[]

/** 替换说法。一键替换时把命中的禁语原样换成它。 */
const 替换说法 = raw.替换说法 as Record<string, string>

/** 严重度权重。数值小的先判，让「高」压过「低」。 */
const 严重度权重: Record<string, number> = { 高: 0, 中: 1, 低: 2 }

/**
 * 按严重度排好序的口径表，扫描按这个顺序走。
 *
 * 原实现是按编号 K01→K20 顺序返回第一条命中，那样 K19「绝对适合你」会盖过
 * K01「孕妇可以用」。同一句话命中两条时，该报的是更严重的那个。
 * 严重度相同时比编号，保证顺序稳定 —— 前端提示和后端留痕得是同一个词。
 */
const 扫描顺序 = [...口径表].sort(
  (a, b) =>
    (严重度权重[a.严重度] ?? 9) - (严重度权重[b.严重度] ?? 9) ||
    a.编号.localeCompare(b.编号),
)

/** 正则预编译。写死在 JSON 里的是字符串，每次调用现编会拖慢逐字校验。 */
const 编译模式 = 扫描顺序.flatMap((k) =>
  k.禁语模式.map((源) => ({ 源, 正则: new RegExp(源), 口径: k.编号, 可以说: k.可以说 })),
)

/** 按编号取一条口径。 */
export function 取口径(编号: string): 口径条目 | undefined {
  return 口径表.find((k) => k.编号 === 编号)
}

/**
 * 扫描一段文字命中的第一条禁语。
 *
 * 闸门 G1 与输入框下方的发送前确认用的是同一个函数 —— 按规格 §十二 的要求，
 * 两条路径共用一份判定，否则判断标准会漂移。
 */
export function 查禁语(text: string): GuardHit | null {
  for (const k of 扫描顺序) {
    for (const word of k.禁语) {
      if (text.includes(word)) {
        return { 禁语: word, 口径: k.编号, 建议: 替换说法[word] ?? k.可以说 }
      }
    }
  }

  for (const p of 编译模式) {
    const hit = text.match(p.正则)?.[0]
    if (hit) return { 禁语: hit, 口径: p.口径, 建议: 替换说法[hit] ?? p.可以说 }
  }

  for (const s of raw.补充禁语 as 补充禁语条目[]) {
    if (text.includes(s.禁语)) return { 禁语: s.禁语, 口径: s.口径, 建议: s.建议 }
  }

  return null
}
