/**
 * 极简 hook 运行时 —— **只服务于 `.verify/drive.ts` 这一次驱动**，不是 React 的
 * 替代品，跑完就删（这个目录不进仓库）。
 *
 * 装不了的都不装：没有并发渲染、没有 key 复用、没有 DOM。够把 `App()` 调起来、
 * 让 effect 按依赖数组跑、让 setState 触发重渲染。
 *
 * ⚠️ **槽位数组必须跨渲染留着、按 hook 顺序对齐**（2026-10-04 踩过两次）：
 * 一开始每轮渲染都 `槽位.length = 0` 重来，症状有两个 ——
 *
 *   1. `useState` 每次都按初值重造，**setState 全丢**（会话列表拉回来 114 条，
 *      界面上还是 `seedSessions` 那 2 条）；
 *   2. `useMemo`／`useCallback` 每次重算，依赖它们的 `useEffect` 于是每轮都
 *      「依赖变了」，**`[]` 那个 effect 被反复跑**（会话列表接口被打了 9 次）。
 *
 * 这两个都**长得像被测代码的毛病**（一个是数据没进来，一个是请求循环），实际上
 * 全是装置自己的错。所以：hooks 按顺序写进同一份 `槽位`，渲染完只做一件事 ——
 * 跑这一轮登记下来的 effect。
 */
'use strict'

const 槽位 = []
let 游标 = 0
const 待跑 = []
let 脏 = false
let 需要首轮 = true

function useState(初值) {
  const i = 游标++
  const 槽 = 槽位[i] ?? (槽位[i] = { 值: typeof 初值 === 'function' ? 初值() : 初值 })
  const 设 = (新) => {
    const 值 = typeof 新 === 'function' ? 新(槽.值) : 新
    if (Object.is(值, 槽.值)) return
    槽.值 = 值
    脏 = true
  }
  return [槽.值, 设]
}

function useRef(初值) {
  const i = 游标++
  return 槽位[i] ?? (槽位[i] = { current: 初值 })
}

/** 浅比依赖，和 React 一样只认「每一项都一样」。 */
function 依赖没变(a, b) {
  if (!a || !b || a.length !== b.length) return false
  return a.every((x, i) => Object.is(x, b[i]))
}

function useMemo(算, 依赖) {
  const i = 游标++
  const 槽 = 槽位[i]
  if (槽 && 依赖没变(槽.依赖, 依赖)) return 槽.值
  const 值 = 算()
  槽位[i] = { 值, 依赖 }
  return 值
}

function useCallback(函数, 依赖) {
  return useMemo(() => 函数, 依赖)
}

function useEffect(函数, 依赖) {
  const i = 游标++
  const 槽 = 槽位[i] ?? (槽位[i] = {})
  槽.函数 = 函数
  if (!依赖没变(槽.已跑依赖, 依赖)) 待跑.push(槽)
  槽.依赖 = 依赖
}

/** 清场。装置退出前调一次，把挂着的定时器都收掉。 */
function 收尾() {
  for (const 槽 of 槽位) {
    if (槽 && 槽.清场) {
      槽.清场()
      槽.清场 = undefined
      槽.已跑依赖 = undefined
    }
  }
}

let 上次树

function 渲染(组件) {
  游标 = 0
  待跑.length = 0
  上次树 = 组件()
  // 这一轮没走到的槽（hook 数量变少）剪掉，别把上一轮的影子留在后面。
  槽位.length = 游标
  for (const 槽 of 待跑) {
    if (槽.清场) 槽.清场()
    槽.清场 = 槽.函数()
    槽.已跑依赖 = 槽.依赖
  }
  return 上次树
}

/**
 * 一直渲染到不脏为止，**返回最后一轮真正渲染出来的那棵树**。
 *
 * ⚠️ **读树只从这里读，别在外面自己再调一次组件**（2026-10-04 踩过）：那一次
 * 调用不在 `渲染` 里，`游标` 还是上一轮渲染留下的值 —— 于是每个 hook 都去认
 * 后面那段**空槽**，`useState` 当场按初值造一份新的。症状是**读到的全是初值**
 * （会话列表接口明明回来了 114 条，桩上抄到的还是 `seedSessions` 那 2 条），
 * 看着像「数据没进来」，其实是被读的那棵树根本不是屏幕上那棵。
 */
function 冲刷(组件, 上限 = 80) {
  let 次 = 0
  while (需要首轮 || 脏) {
    需要首轮 = false
    脏 = false
    渲染(组件)
    if (++次 > 上限) throw new Error('渲染不收敛（超过 ' + 上限 + ' 轮）')
  }
  return 上次树
}

module.exports = {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  __驱动: { 冲刷, 收尾 },
}
