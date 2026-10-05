/**
 * 会话回放条 —— 架在**演示会话**的消息流上面，控制这条对话演到第几格。
 *
 * 演示现场最怕两件事：**节奏跟不上讲解**、**讲错一步回不去**。所以除了播放/暂停，
 * 进度做成可点的刻度 —— 点哪跳哪，讲快了往回调一格，讲慢了直接跳到最后；旁边还留
 * 一个「跳到第 N 步」的数字框，会话长了（刻度细得点不准）用它。
 * 速度是给「这段不讲了快点过」准备的，不是给观众看的。
 *
 * **一格是一步**，步是剧本的步（`剧本.事件`）。**步和条不能换算**：剧本里允许
 * 没有消息的步（「六源扫描」「逾期浮出」），那种步在条数里根本没有对应位置。
 *
 * # 为什么普通会话不再用它（2026-10-05）
 *
 * 它原来是**每个会话都挂着**的：有剧本按步走，没剧本按消息条数走，靠一串
 * `剧本 ? … : …` 分两套口径。真窗口接上来之后那条分岔就不成立了 —— 真窗口要的是
 * 「点开看它演」，不是「拖刻度讲解」，而两套口径挤在同一排刻度上，单位混着用
 * （这儿写「步」、那儿写「条」）读的人得先分辨这是哪一条路。现在真窗口的控件收成
 * 标题栏上一颗 ▶/⏸/↻（`ChatPanel` 的 `回放键`），这个组件只管演示两条线。
 */

import { Pause, Play, SkipForward } from 'lucide-react'

import type { 剧本 } from '../../data/剧本'
import { 停的样子, 间隔选项, type 播放状态 } from '../../hooks/use播放器'

type Props = {
  state: 播放状态
  /** 只有演示会话才挂这个组件，所以它是必给的。 */
  剧本: 剧本
}

/** 毫秒 → `12s` / `1:05`。演示用的本子都在秒级，不值得引一个日期库。 */
function 时长(ms: number): string {
  const 秒 = Math.round(ms / 1000)
  if (秒 < 60) return `${秒}s`
  return `${Math.floor(秒 / 60)}:${String(秒 % 60).padStart(2, '0')}`
}

export default function 播放器({ state, 剧本 }: Props) {
  const { 已播格数, 总格数, 在放, 格间隔, 播放, 暂停, 跳到, 下一跳, 设格间隔, 停在 } = state
  const 空 = 总格数 === 0

  // 状态词从「在不在放 + 演到第几格」推出来，不另存。和 `usePlayer` 里 `在放`
  // 是派生的同一个理由：多存一份就多一处要同步。
  //
  // 「等你点［X］」排在「已暂停」前面：停在那一格**等于**已暂停，但光说已暂停
  // 看不出它是故意的 —— 演示的人会以为播放器卡死了，去点播放键跳过去，那一下
  // 该点的按钮就再也不会被点了。那句话由 `停的样子` 给（真窗口标题栏那颗小按钮
  // 念的是同一句，别在这儿另拼一遍）。
  //
  // **`判定中提示` 不套「等你点［］」那个壳。** 真窗口每一轮的客服话之前都要停，
  // 而那几秒里后端还在判 —— 屏幕上写「等你点［正在判定…］」是句错话（没有按钮
  // 可点），写成「已暂停」又会让人去按 ▶ 把那一条绕过去。原样显示见 `use播放器`
  // 那个常量的文档串。
  //
  // **2026-10-04 起它排到「未开始」前面。** 真窗口一打开进度就是 0（`选会话`
  // 跳到 `起演格`，单段就是 0），而主卡是几秒后判定回来才上屏的 —— 那一刻
  // 屏幕上就是「卡在等你点」而进度还没动。原来这儿的顺序把这种情形报成
  // 「未开始」，等于把唯一一句有用的提示盖掉。少报的那个信息一克不少：右边
  // 「第 0 / 共 24 步」本来就写着没开始。
  //
  // （上面这两段是给真窗口写的，那个组件已经不挂在这儿了 —— 留着是因为
  // `停在` 这个字段还是同一套：真窗口的判定刹车照样往它里面写东西。）
  const 状态 = 空
    ? '无消息'
    : 在放
      ? '播放中'
      : 停在
        ? 停的样子(停在)
        : 已播格数 === 0
          ? '未开始'
          : 已播格数 >= 总格数
            ? '已播完'
            : '已暂停'

  // 格子号就是步号 —— 不用换算，两者是同一个数。
  const 事件 = 已播格数 > 0 ? 剧本.事件[已播格数 - 1] : null

  // 全片一个速度，所以总耗时就是「格数 × 当前档位」。末格之后不再等，不用减。
  const 总耗时 = 总格数 * 格间隔

  return (
    <div className="shrink-0 border-b border-line-soft bg-[#fbfcfe] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-sm bg-rail px-1.5 py-0.5 text-note font-medium leading-4 text-rail-ink-active">
          演示
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

        {/* 单步。**演到头了也不灰** —— 那时按它是从头重演，和播放键一致。
            灰掉的话演示动线走到最后一步会停在一个灰按钮上，看着像这功能没做。 */}
        <button
          type="button"
          onClick={下一跳}
          disabled={空}
          title="单步：演下一步"
          className="flex size-6 shrink-0 items-center justify-center rounded text-ink-3 transition-colors hover:bg-canvas hover:text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent"
        >
          <SkipForward size={13} />
        </button>

        {/* 刻度条：一格一个，点哪跳哪 */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {Array.from({ length: 总格数 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => 跳到(i + 1)}
              title={`第 ${i + 1} 步 · ${剧本.事件[i]?.标题 ?? ''}`}
              className="group min-w-0 flex-1 py-2"
            >
              <span
                className={`block h-1 rounded-full transition-colors ${
                  i < 已播格数 ? 'bg-brand' : 'bg-line group-hover:bg-brand-soft'
                }`}
              />
            </button>
          ))}
        </div>

        <span className="shrink-0 font-mono text-note tabular-nums text-ink-3">
          第 {已播格数} / 共 {总格数} 步
        </span>

        {/* 跳播：输格数按回车。不用 change 事件 —— 数字框上下箭头每点一下都触发
            change，进度会跟着乱蹦。 */}
        <label className="flex shrink-0 items-center gap-1 text-note text-ink-3">
          跳到
          <input
            type="number"
            min={1}
            max={Math.max(总格数, 1)}
            defaultValue={1}
            disabled={空}
            title="输入步数后按回车"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              跳到(Number(e.currentTarget.value))
              e.currentTarget.blur()
            }}
            className="w-10 rounded-sm border border-line bg-panel px-1 py-0.5 text-center text-note tabular-nums text-ink outline-none focus:border-brand disabled:bg-canvas disabled:text-ink-4"
          />
          步
        </label>

        {/* 速度：一格几秒，不是倍速。演示的人对着稿子挑一档，不用心算。 */}
        <div className="flex shrink-0 items-center gap-0.5 rounded border border-line bg-panel p-0.5">
          {间隔选项.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => 设格间隔(v)}
              title={`每一步停 ${v / 1000} 秒`}
              className={`rounded-sm px-1.5 py-0.5 text-note leading-4 transition-colors ${
                v === 格间隔 ? 'bg-brand text-white' : 'text-ink-3 hover:bg-canvas hover:text-ink-2'
              }`}
            >
              {v / 1000}s
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2 pl-13">
        {/* 在等人点的时候把它点出来（琥珀，和主卡上那个按钮一个色系）——
            这一行是演示的人唯一的提示，灰字会被跳过。 */}
        <span
          className={`shrink-0 text-note ${停在 ? 'font-medium text-hold-ink' : 'text-ink-4'}`}
        >
          {状态}
        </span>

        {事件 ? (
          <>
            <span className="shrink-0 text-body font-medium text-ink">
              第 {已播格数} 步 · {事件.标题}
            </span>
            {事件.备注 ? <span className="truncate text-body text-ink-3">{事件.备注}</span> : null}
          </>
        ) : (
          <span className="text-body text-ink-3">
            共 {总格数} 步 · 约 {时长(总耗时)}（每一步 {格间隔 / 1000}s） · 点播放开始，或直接点上面的刻度跳到某一步
          </span>
        )}
      </div>
    </div>
  )
}
