import {
  Bot,
  ClipboardList,
  Grid3x3,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Settings,
  Store,
} from 'lucide-react'
import { useState } from 'react'

type NavItem = {
  key: string
  icon: typeof LayoutGrid
  badge?: number
}

/** 顶部主导航，顺序与千牛工作台一致。 */
const NAV: NavItem[] = [
  { key: '工作台', icon: LayoutGrid },
  // 「消息」的角标不在这儿写死 —— 它是左侧列表的条数，由 `App` 传进来，见 `会话数`。
  { key: '消息', icon: MessageSquare },
  { key: '进店', icon: Store },
  { key: '工单', icon: ClipboardList },
  { key: '离线消息', icon: Inbox },
]

/** 底部固定区。这里只做视觉占位，不接任何真实入口。 */
const FOOTER: NavItem[] = [
  { key: '客服', icon: Bot },
  { key: '应用', icon: Grid3x3 },
  { key: '设置', icon: Settings },
]

function RailButton({
  item,
  badge,
  active,
  onClick,
}: {
  item: NavItem
  /** 覆盖 `item.badge`。只有「消息」那一格用得上 —— 见 `会话数`。 */
  badge?: number
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full flex-col items-center gap-1 py-3 transition-colors ${
        active
          ? 'bg-rail-active text-rail-ink-active'
          : 'text-rail-ink hover:bg-rail-hover hover:text-rail-ink-active'
      }`}
    >
      <Icon size={20} strokeWidth={1.8} />
      <span className="text-body leading-none">{item.key}</span>
      {badge ? (
        // ⚠️ 超过 99 截成 `99+`，**所以演示时这一格显示的就是 `99+`**（列表 114 条）。
        // 这是千牛自己的截断行为，2026-10-03 拍过要保留 —— 不是数没接上。
        <span className="absolute top-1.5 right-2 min-w-4 rounded-full bg-danger px-1 text-center text-note leading-4 text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  )
}

/**
 * 最左侧深蓝导航条。
 *
 * # `会话数`
 *
 * 「消息」那一格的角标 = 左侧列表里有多少条会话。
 *
 * **原来写死的是 `19`。** 千牛那个角标在真实工作台上是**未读数**，可这里没有
 * 未读数据 —— 138 条真会话从后端来的是 `未读: None`（`装载器.py:180`），
 * 两条演示线也一个都没有。写死一个 19 只是占位，和屏幕上任何东西都对不上。
 *
 * 真数是 **114**（2 条演示线 ＋ 112 个真实窗口，2026-10-03 合并之前是 140），
 * 只能从 `App` 的 `sessions` 拿：演示两条在 `data/index.ts` 里，那 112 个窗口是
 * `取会话列表()` 拉回来合进去的。
 *
 * ⚠️ **后端没起的时候它会掉回 2** —— 那正好是左栏当时的条数，不是错，
 * 所以别为了「好看」给它一个默认值：那会造出一个屏幕上数不出来的数。
 */
export default function IconRail({ 会话数 }: { 会话数: number }) {
  const [active, setActive] = useState('消息')

  return (
    <nav className="flex w-14 shrink-0 flex-col justify-between bg-rail">
      <div className="pt-1.5">
        {NAV.map((item) => (
          <RailButton
            key={item.key}
            item={item}
            badge={item.key === '消息' ? 会话数 : item.badge}
            active={active === item.key}
            onClick={() => setActive(item.key)}
          />
        ))}
      </div>
      <div className="pb-2">
        {FOOTER.map((item) => (
          <RailButton
            key={item.key}
            item={item}
            active={active === item.key}
            onClick={() => setActive(item.key)}
          />
        ))}
      </div>
    </nav>
  )
}
