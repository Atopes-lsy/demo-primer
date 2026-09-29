/**
 * 会话回放条 —— 架在**每个**会话的消息流上面，控制这条对话播到第几条。
 *
 * 演示现场最怕两件事：**节奏跟不上讲解**、**讲错一步回不去**。所以除了播放/暂停，
 * 进度做成可点的刻度 —— 点哪跳哪，讲快了往回调一格，讲慢了直接跳到最后；旁边还留
 * 一个「跳到第 N 条」的数字框，会话长了（几十条消息，刻度细得点不准）用它。
 * 倍速是给「这段不讲了快点过」准备的，不是给观众看的。
 *
 * **两种会话共用一套控件**，靠 `剧本` 有没有来分：
 *   - 有剧本（演示会话）：每一格是一步，下面提示行显示这步在做什么。
 *   - 没有剧本（普通会话）：一条消息一格，提示行显示刚出现的那条消息。
 * 播放器本身不关心区别 —— 它只数条数，换算在 `data/剧本.ts` 的 `条到步`。
 */

import { Pause, Play, SkipForward } from 'lucide-react'

import { 总时长, 条到步, type 剧本 } from '../../data/剧本'
import { 默认条间隔, 倍速选项, type 播放状态 } from '../../hooks/use播放器'
import type { ChatMessage } from '../../types'

type Props = {
  state: 播放状态
  /** 演示会话才有。普通会话没有剧本，提示行改显示消息本身。 */
  剧本?: 剧本
  /** 刚出现的那条消息。普通会话的提示行用它；有剧本时用剧本的标题。 */
  当前消息?: ChatMessage
}

/** 毫秒 → `12s` / `1:05`。演示用的本子都在秒级，不值得引一个日期库。 */
function 时长(ms: number): string {
  const 秒 = Math.round(ms / 1000)
  if (秒 < 60) return `${秒}s`
  return `${Math.floor(秒 / 60)}:${String(秒 % 60).padStart(2, '0')}`
}

export default function 播放器({ state, 剧本, 当前消息 }: Props) {
  const { 已播条数, 总条数, 在放, 倍速, 播放, 暂停, 跳到, 下一跳, 设倍速 } = state
  const 空 = 总条数 === 0

  // 状态词从「在不在放 + 播到第几条」推出来，不另存。和 `usePlayer` 里 `在放`
  // 是派生的同一个理由：多存一份就多一处要同步。
  const 状态 = 空 ? '无消息' : 在放 ? '播放中' : 已播条数 === 0 ? '未开始' : 已播条数 >= 总条数 ? '已播完' : '已暂停'

  // 有剧本时，已播的这几条落在第几步上。普通会话没有这一步。
  const 当前步 = 剧本 ? 条到步(剧本, 已播条数) : 0
  const 事件 = 剧本 && 当前步 > 0 ? 剧本.事件[当前步 - 1] : null

  /** 每一格的悬停提示。有剧本就报步号和标题，没有就报条号。 */
  const 格标题 = (i: number) => {
    if (!剧本) return `第 ${i + 1} 条`
    const 步 = 条到步(剧本, i + 1)
    return `第 ${步} 步 · ${剧本.事件[步 - 1]?.标题 ?? ''}`
  }

  const 总耗时 = 剧本 ? 总时长(剧本) : 总条数 * 默认条间隔

  return (
    <div className="shrink-0 border-b border-line-soft bg-[#fbfcfe] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-sm bg-rail px-1.5 py-0.5 text-[10px] font-medium leading-4 text-rail-ink-active">
          {剧本 ? '演示' : '回放'}
        </span>

        <button
          type="button"
          onClick={在放 ? 暂停 : 播放}
          disabled={空}
          title={在放 ? '暂停' : '播放'}
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-ink-4"
        >
          {在放 ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        </button>

        {/* 单步。**播到头了也不灰** —— 那时按它是从头重播，和播放键一致。
            灰掉的话演示动线走到最后一步会停在一个灰按钮上，看着像这功能没做。 */}
        <button
          type="button"
          onClick={下一跳}
          disabled={空}
          title="单步：播下一条"
          className="flex size-6 shrink-0 items-center justify-center rounded text-ink-3 transition-colors hover:bg-canvas hover:text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent"
        >
          <SkipForward size={13} />
        </button>

        {/* 刻度条：一格一条，点哪跳哪 */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {Array.from({ length: 总条数 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => 跳到(i + 1)}
              title={格标题(i)}
              className="group min-w-0 flex-1 py-2"
            >
              <span
                className={`block h-1 rounded-full transition-colors ${
                  i < 已播条数 ? 'bg-brand' : 'bg-line group-hover:bg-brand-soft'
                }`}
              />
            </button>
          ))}
        </div>

        <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-3">
          第 {已播条数} / 共 {总条数} 条
        </span>

        {/* 跳播：输条数按回车。不用 change 事件 —— 数字框上下箭头每点一下都触发
            change，进度会跟着乱蹦。 */}
        <label className="flex shrink-0 items-center gap-1 text-[10px] text-ink-3">
          跳到
          <input
            type="number"
            min={1}
            max={Math.max(总条数, 1)}
            defaultValue={1}
            disabled={空}
            title="输入条数后按回车"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              跳到(Number(e.currentTarget.value))
              e.currentTarget.blur()
            }}
            className="w-10 rounded-sm border border-line bg-panel px-1 py-0.5 text-center text-[10px] tabular-nums text-ink outline-none focus:border-brand disabled:bg-canvas disabled:text-ink-4"
          />
          条
        </label>

        <div className="flex shrink-0 items-center gap-0.5 rounded border border-line bg-panel p-0.5">
          {倍速选项.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => 设倍速(v)}
              className={`rounded-sm px-1.5 py-0.5 text-[10px] leading-4 transition-colors ${
                v === 倍速 ? 'bg-brand text-white' : 'text-ink-3 hover:bg-canvas hover:text-ink-2'
              }`}
            >
              {v}x
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2 pl-13">
        <span className="shrink-0 text-[10px] text-ink-4">{状态}</span>

        {事件 ? (
          <>
            <span className="shrink-0 text-[11px] font-medium text-ink">
              第 {当前步} 步 · {事件.标题}
            </span>
            {事件.备注 ? <span className="truncate text-[11px] text-ink-3">{事件.备注}</span> : null}
          </>
        ) : 当前消息 ? (
          <>
            <span className="shrink-0 text-[11px] font-medium text-ink">
              第 {已播条数} 条 · {当前消息.角色} {当前消息.发送时间.slice(11, 16)}
            </span>
            <span className="truncate text-[11px] text-ink-3">{当前消息.message_text}</span>
          </>
        ) : (
          <span className="text-[11px] text-ink-3">
            共 {总条数} 条 · 约 {时长(总耗时)}（1x） · 点播放开始，或直接点上面的刻度跳到某一条
          </span>
        )}
      </div>
    </div>
  )
}
