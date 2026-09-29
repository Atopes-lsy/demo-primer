/**
 * 播放器状态机 —— 会话回放的进度、播放/暂停、倍速。
 *
 * **数的是消息条数，不是剧本步数。** 播放器现在挂在每一个会话上，而多数会话没有
 * 剧本 —— 它们的时间线就是「一条消息一步」。统一按条数，才能一套控件管两种会话
 * （有剧本的会话靠 `条到步` 换算，见 `data/剧本.ts`）。
 *
 * 状态只有两个：「播到第几条」和「用户想不想放」，其余全是派生的。特别是
 * **不存「当前是第几条」的副本** —— 进度条的值直接来自 `已播条数`，拖动就直接
 * 写它。少一份会不同步的状态，就少一类「拖完不回弹」的 bug。
 *
 * `在放` 是派生的（`播放中 && 还没播完`），不是存的。播到最后一条时 `在放`
 * 自己变成 false，不需要在 effect 里再 setState 一次 —— 那会多渲染一轮，而且
 * 「播完了」本来就是「位置到了头」的同义词，不该另存一个标志位去追它。
 *
 * 定时器归 `useEffect` 管：`已播条数` 一变，旧定时器就清掉重排，所以拖进度条
 * 等于「取消当前这一跳，从新位置重新起跳」。不需要额外的暂停逻辑。
 *
 * **函数名是英文的，别改回 `use播放器`。** React 靠 `/^use[A-Z0-9]/` 认自定义
 * Hook，中文开头认不出来 —— 认不出来就不会检查依赖数组，也不会被 React
 * Compiler 优化。文件名、变量名、返回类型都还是中文，只有这个前缀必须是 ASCII。
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/** 可选倍速。0.5 用来放慢讲细节，4 用来跳过铺垫。 */
export const 倍速选项 = [0.5, 1, 2, 4] as const
export type 倍速 = (typeof 倍速选项)[number]

/** 没有自带间隔的会话（普通会话）每条停多久。和剧本里的间隔同单位：毫秒。 */
export const 默认条间隔 = 1500

export interface 播放状态 {
  /** 屏幕上应当出现几条消息。0 表示一条没播，等于空会话。 */
  已播条数: number
  总条数: number
  在放: boolean
  倍速: 倍速
  播放: () => void
  暂停: () => void
  /** 播放/暂停切换。空格键和按钮都走它。 */
  切换: () => void
  /** 跳到第 n 条（n 是已播条数）。手动跳会顺带暂停。 */
  跳到: (条: number) => void
  重置: () => void
  /** 单步：播下一条。停在末条时按它是重新开始，不是死按钮。 */
  下一跳: () => void
  设倍速: (v: 倍速) => void
}

/**
 * @param 间隔表 每条播完之后停多久（毫秒）。长度就是总条数。
 *
 * 调用方直接用 `map` 现造这个数组即可，不必 `useMemo` —— 它在下面用 ref 接住，
 * 不进 effect 的依赖数组。放进依赖的话，每次渲染都会重排定时器，播放会被自己
 * 的渲染拖慢。
 */
export function usePlayer(间隔表: readonly number[]): 播放状态 {
  const 总条数 = 间隔表.length
  const [已播条数, set已播条数] = useState(0)
  const [播放中, set播放中] = useState(false)
  const [倍速, set倍速] = useState<倍速>(1)

  const 间隔 = useRef(间隔表)
  useEffect(() => {
    间隔.current = 间隔表
  })

  const 演完了 = 已播条数 >= 总条数
  const 在放 = 播放中 && !演完了

  const 跳到 = useCallback(
    (n: number) => {
      set已播条数(Math.max(0, Math.min(总条数, n)))
      // 手动拖进度 = 接管节奏。停下来等演示的人讲完再按播放，比抢着往下演好。
      set播放中(false)
    },
    [总条数],
  )

  const 重置 = useCallback(() => 跳到(0), [跳到])
  const 暂停 = useCallback(() => set播放中(false), [])

  const 播放 = useCallback(() => {
    // 已经播到头时按播放 = 从头再播一遍。少了这一下，演示播完一轮之后再点播放
    // 就毫无反应 —— 而那正是最常按的一次。
    set已播条数((n) => (n >= 总条数 ? 0 : n))
    set播放中(true)
  }, [总条数])

  const 切换 = useCallback(() => {
    if (播放中) 暂停()
    else 播放()
  }, [播放中, 播放, 暂停])

  const 下一跳 = useCallback(() => {
    // 单步也接管节奏：在播的时候点单步，计时器和手会抢着推进。
    set播放中(false)
    set已播条数((n) => (n >= 总条数 ? 1 : n + 1))
  }, [总条数])

  // 空格键 = 播放/暂停。演示时手不用够鼠标。
  // 打字的时候不能触发：焦点在输入框里，空格就是个空格。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      切换()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [切换])

  // 播到最后一条，`在放` 派生为 false，这个 effect 自己就不再排下一个定时器了。
  useEffect(() => {
    if (!在放) return
    // 第 0 条立刻出现（按了播放就该有反应），之后每条停留上一条自己的间隔。
    const 等待 = 已播条数 === 0 ? 0 : (间隔.current[已播条数 - 1] ?? 默认条间隔) / 倍速
    const t = setTimeout(() => set已播条数((n) => n + 1), 等待)
    return () => clearTimeout(t)
  }, [在放, 已播条数, 倍速])

  return {
    已播条数,
    总条数,
    在放,
    倍速,
    播放,
    暂停,
    切换,
    跳到,
    重置,
    下一跳,
    设倍速: set倍速,
  }
}
