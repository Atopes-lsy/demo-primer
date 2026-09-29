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
  { key: '消息', icon: MessageSquare, badge: 19 },
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
  active,
  onClick,
}: {
  item: NavItem
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
      {item.badge ? (
        <span className="absolute top-1.5 right-2 min-w-4 rounded-full bg-danger px-1 text-center text-note leading-4 text-white">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      ) : null}
    </button>
  )
}

/** 最左侧深蓝导航条。 */
export default function IconRail() {
  const [active, setActive] = useState('消息')

  return (
    <nav className="flex w-14 shrink-0 flex-col justify-between bg-rail">
      <div className="pt-1.5">
        {NAV.map((item) => (
          <RailButton
            key={item.key}
            item={item}
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
