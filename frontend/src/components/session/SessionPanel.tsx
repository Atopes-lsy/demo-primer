import { Clock, List, RefreshCw, Search, SlidersHorizontal, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { Session, SessionStage } from '../../types'
import SessionItem from './SessionItem'

const TABS = [
  { key: '全部', icon: List },
  { key: '最近', icon: Clock },
  { key: '联系人', icon: Users },
  { key: '新客', icon: UserPlus },
  { key: '筛选', icon: SlidersHorizontal },
]

/** 分组在列表中的显示顺序，也是分组的完整集合。 */
const STAGES: SessionStage[] = ['排队中', '正在接待', '历史联系']

type Props = {
  sessions: Session[]
  activeId: string
  onSelect: (会话ID: string) => void
  默认分组?: boolean
}

/** 左侧会话列表区：搜索 · 筛选 · 按接待阶段分组。 */
export default function SessionPanel({ sessions, activeId, onSelect, 默认分组 = false }: Props) {
  const [tab, setTab] = useState('全部')
  const [keyword, setKeyword] = useState('')
  /**
   * **真实数据模式默认不分组。** 接上真实会话之后（现在是 114 条窗口，2026-10-03 合并之前
   * 是 140 条会话），分组反而把顺序弄乱了：
   *
   *   - 真实窗口的 `stage` **全是 `正在接待`**（实测 112 个无一例外 —— 那一条是
   *     `装载器` 写死的），所以分出来是 `排队中 1 · 正在接待 113 · 历史联系 0`
   *     —— 一个 113 条的巨组，分组没提供任何信息；
   *
   *     （2026-10-04 起这几个数在演示里会动：两条线的末格把 `stage` 写成
   *     `历史联系`（会话结束），演到那儿是 `正在接待 112 · 历史联系 1`，线二
   *     演完 `排队中 0 · 历史联系 2`。分组默认是关的，所以只是数字，不是乱序。）
   *   - 更要紧的是它**会盖掉列表顺序**：演示两条里阿沅是「排队中」、小鹿是
   *     「正在接待」，而分组顺序是 排队中 → 正在接待，于是阿沅被排到小鹿**上面**，
   *     和片子里线一先演的叙事顺序正好反过来。`合会话列表` 里那套「A 上 B 下」
   *     的置顶在分组模式下完全不起作用。
   *
   * 关掉之后数组顺序说了算：小鹿、阿沅，之后 112 个真实窗口按最近时间倒序，
   * 最后 30 条垫底（绝大多数是顾客把同一件事说了两遍的，见 `data/重复会话.ts`；
   * 那里面另有两条判据不是这一条，文件尾巴上各自写着为什么）。
   * 开关留在屏幕上，要看分组随时能打开。五客户 UI 验收模式会通过
   * `默认分组` 单独打开分栏，不改变真实数据模式的默认行为。
   */
  const [grouped, setGrouped] = useState(默认分组)

  const filtered = useMemo(() => {
    const kw = keyword.trim()
    if (!kw) return sessions
    return sessions.filter(
      (s) => s.买家昵称.includes(kw) || s.会话ID.includes(kw) || (s.摘要 ?? '').includes(kw),
    )
  }, [sessions, keyword])

  const groups = useMemo(
    () => STAGES.map((stage) => ({ stage, items: filtered.filter((s) => s.stage === stage) })),
    [filtered],
  )

  return (
    <section className="flex w-60 shrink-0 flex-col border-r border-line bg-panel">
      <div className="border-b border-line-soft p-2">
        <label className="flex items-center gap-1.5 rounded border border-line bg-canvas px-2 py-1.5 focus-within:border-brand">
          <Search size={13} className="shrink-0 text-ink-3" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索联系人、订单号、聊天记录"
            className="w-full bg-transparent text-xs outline-none placeholder:text-ink-4"
          />
        </label>

        <div className="mt-2 flex items-center justify-around text-ink-3">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              title={key}
              onClick={() => setTab(key)}
              className={`rounded p-1.5 transition-colors ${
                tab === key ? 'bg-brand-soft text-brand' : 'hover:bg-canvas hover:text-ink-2'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-line-soft px-3 py-2 text-xs text-ink-2">
        <span>列表分组</span>
        <button
          type="button"
          role="switch"
          aria-checked={grouped}
          onClick={() => setGrouped((v) => !v)}
          className={`relative h-[14px] w-[26px] rounded-full transition-colors ${
            grouped ? 'bg-brand' : 'bg-ink-4'
          }`}
        >
          <span
            className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white transition-all ${
              grouped ? 'left-[14px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-ink-4">没有匹配的会话</p>
        ) : grouped ? (
          groups.map(
            ({ stage, items }) =>
              items.length > 0 && (
                <div key={stage}>
                  <div className="flex items-center justify-between bg-canvas px-3 py-1.5 text-body text-ink-2">
                    <span className="font-medium">
                      {stage} {items.length}
                    </span>
                    <span className="flex items-center gap-1 text-ink-3">
                      接入联系时间
                      <RefreshCw size={11} />
                    </span>
                  </div>
                  {items.map((s) => (
                    <SessionItem
                      key={s.会话ID}
                      session={s}
                      active={s.会话ID === activeId}
                      onClick={() => onSelect(s.会话ID)}
                    />
                  ))}
                </div>
              ),
          )
        ) : (
          filtered.map((s) => (
            <SessionItem
              key={s.会话ID}
              session={s}
              active={s.会话ID === activeId}
              onClick={() => onSelect(s.会话ID)}
            />
          ))
        )}
      </div>
    </section>
  )
}
