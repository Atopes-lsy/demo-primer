import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import {
  EVIDENCE_SOURCE,
  type Advice,
  type ChatMessage,
  type Evidence,
  type EvidenceSource,
} from '../../types'

/**
 * 报备卡上的三个状态。
 *
 * `等审批` 交上去了没回来 → `等发送` 审批回来了、话压在手上等客服点［一键发送］
 * → `已答复` 那句话发出去了。
 *
 * **由进度和现场消息推出来，不另存**（见 `App` 的 `报备态`）：存一份就多一处
 * 要跟播放进度同步的状态，而它本来就是「演到哪一步 + 那句发没发」的结论。
 */
export type 报备态 = '等审批' | '等发送' | '已答复'

type Props = {
  advice: Advice
  /** 「采用」：只把话术带进输入框，**不发** —— 发不发由客服按发送决定。 */
  onUseScript: () => void
  /** 「一键报备」：后台走审批，对话还在客服手里。 */
  onReport: () => void
  /** 「立即转交」：对话交出去，客服不再跟进。 */
  onHandover: () => void
  /** 「一键发送」：审批回来了，把这一步备好的话发出去。 */
  onSendPending: () => void
  /** 已报备后的等待状态。 */
  报备?: { 等待分钟: number; 工单号: string }
  /** 已转交后的交接单号。 */
  转交?: { 工单号: string }
  /**
   * 报备走到哪一步了。
   *
   * 必填，没有默认值：没有剧本的会话（那种没有播放器）走不到后面两态，调用方
   * 给的就是 `等审批` —— 那是它算出来的结论，不该由这里替它兜一个。
   */
  报备态: 报备态
  /** 审批回来、还没发出去的那句话（`剧本事件.待发` 的第一条）。 */
  待发句?: ChatMessage
}

/** 主卡描边随形态变，这是右栏里唯一区分优先级的视觉信号。 */
const 描边: Record<Advice['形态'], string> = {
  需要话术: 'border-line',
  需要授权: 'border-hold-line',
  有风险: 'border-risk-line',
}

/**
 * 依据清单，主卡底部可展开的那块。
 *
 * 名字是英文的：React 只把首字母大写的函数当组件，中文开头的它认成普通函数，
 * 里面的 `useState` 会被 rules-of-hooks 拦下 —— 不是风格问题，是工具看不见它。
 */
function EvidenceList({ advice }: { advice: Advice }) {
  const [open, setOpen] = useState(false)

  const 六源 = Object.keys(EVIDENCE_SOURCE) as EvidenceSource[]

  // 按来源分组。**同一个来源可以有多条引用** —— 演示数据里口径表就同时命中了
  // K06（不良反应处理）和 K20（投诉与升级），两条都得显示。
  const 按源 = new Map<EvidenceSource, Evidence[]>()
  for (const e of advice.依据) {
    const 组 = 按源.get(e.序号)
    if (组) 组.push(e)
    else 按源.set(e.序号, [e])
  }

  // 计数按「源」，展示按「条」—— 这两个粒度不同，混用会出两种错：
  //   · 按条计数：口径表返两条就报成 2，`命中 + 未命中` 会超过 6
  //   · 按源去重后只渲染一条：K20 那条引用被静默吃掉
  // 所以下面两个清单都从六源这个**封闭集合**切出来（保证命中＋未命中恒等于 6，
  // 且上游漏返回一源时仍能补空位列出来），而渲染时把该源的所有条目都铺开。
  const 命中源 = 六源.filter((序号) => 按源.get(序号)?.some((e) => e.用上))
  const 未命中源 = 六源.filter((序号) => !按源.get(序号)?.some((e) => e.用上))

  return (
    <div className="border-t border-line-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 px-3 py-2 text-body font-medium text-ink-2 hover:bg-canvas"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        依据 · {命中源.length}/{六源.length} 源命中
      </button>

      {open ? (
        <div className="px-3 pb-2.5">
          {/* 第一段：命中来源逐条列出。顺序是六源编号顺序，不是数据顺序；
              同一来源的多条引用都铺开，不合并 */}
          {命中源.flatMap((序号) =>
            (按源.get(序号) ?? [])
              .filter((e) => e.用上)
              .map((e, i) => (
                <div key={`${序号}-${i}`} className="mb-1.5">
                  <p className="text-body text-ink">
                    <span className="mr-1 text-ink-3">{序号}</span>
                    {e.出处}
                  </p>
                  <p className="pl-4 text-note text-ink-3">{e.摘要}</p>
                </div>
              )),
          )}

          {/* 第二段：分隔语。三段顺序固定，规格 §1.4 */}
          <p className="mt-2 text-note leading-relaxed text-ink-4">
            另 {未命中源.length} 源无记录 · 一并列出以示无遗漏
          </p>

          {/* 第三段：未命中的六源清单 */}
          <p className="mt-1 text-note leading-relaxed text-ink-4">
            {未命中源
              .map((序号) => {
                const 说明 = (按源.get(序号) ?? []).map((e) => e.摘要).join('；')
                return `${序号} ${EVIDENCE_SOURCE[序号]}${说明 ? ` · ${说明}` : ''}`
              })
              .join('　')}
          </p>
        </div>
      ) : null}
    </div>
  )
}

/**
 * 已代发清单 —— 本轮 AI 已经以客服名义发出去的话。
 *
 * 名字是英文的，理由同 `EvidenceList`（React 不认中文开头的组件）。
 *
 * # 为什么默认展开，而底下那块依据默认折叠
 *
 * 两块要回答的不是一个问题。依据是**客服想追的时候**才去看的（他得先起疑）；
 * 「有句话已经用你的名义发出去了」是**他必须知道、而且不知道自己不知道**的
 * 那类事 —— 折叠起来就等于没做。它只在真有代发时出现，不会长期占地方。
 *
 * 不展开的代价有具体形状：顾客下一句回「你刚才不是说可以退吗」，
 * 客服这边翻遍右栏找不到自己说过那句。聊天区的绿气泡也标了署名，
 * 但气泡会随着对话滚走（`types/index.ts:417`）。
 *
 * # 为什么用 `ai-*` 那组绿
 *
 * 聊天气泡里的 AI 代发、气泡下面那行署名、`本轮处置` 里的「AI直发」都是这个色。
 * 四处说的是同一件事（这话不是你打的），颜色就该是同一种。
 */
function SentList({ 已代发 }: { 已代发: NonNullable<Advice['已代发']> }) {
  return (
    <div className="border-t border-ai-line bg-ai-soft px-3 py-2">
      <p className="text-note font-medium text-ai-ink">已代发 · 以你的名义</p>

      {已代发.map((条, i) => (
        // 内容当 key 的一部分：同一个会话里两条代发话术撞内容的情况没有，
        // 但下标不能当唯一依据（列表会随轮次整块换）。
        <div key={`${i}-${条.内容}`} className="mt-1.5">
          <p className="rounded border border-line-soft bg-canvas px-2 py-2 text-body leading-relaxed text-ink">
            {条.内容}
          </p>
          {/* 署名原样出，**不加前缀** —— 它自己就写着「Primer 自动发送」，
              和聊天区那行是同一个字符串（`MessageList` 也给它加了 ◆）。 */}
          <p className="mt-1 text-note text-ai-ink-2">◆ {条.署名}</p>
          {/* 这一句引的是哪几条。和底下依据清单一**不是**一回事：
              底下那份是「本轮六源查到了什么」（`N/6` 那个分母），
              这份是「这一句话引了哪几条」。别把两块并成一个
              （`api/证据.py` 的模块文档串专门写了为什么）。 */}
          <p className="mt-0.5 text-note leading-relaxed text-ink-4">
            {条.依据.map((e) => `${e.序号} ${e.出处}`).join('　')}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * 「Primer 建议」主卡 —— 右栏里随情况变的那一块。
 *
 * 一轮可能拆出多条主张、产出不同输出，这里只显示最高态；其余的在输入框下方
 * 的「本轮处置」里逐条可查，免得客服以为 AI 抢了他的活或者漏做了什么。
 */
export default function AdviceCard({
  advice,
  onUseScript,
  onReport,
  onHandover,
  onSendPending,
  报备,
  转交,
  报备态,
  待发句,
}: Props) {
  return (
    <section className={`rounded-md border bg-panel ${描边[advice.形态]}`}>
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-medium text-ink">Primer 建议</h2>
      </header>

      <div className="px-3 pb-3">
        <p className="inline-block rounded-full bg-canvas px-2 py-0.5 text-note text-ink-2">
          AI 判断：{advice.判断}
        </p>

        {/* 需要话术：给出成稿，客服看一眼点一下 */}
        {advice.形态 === '需要话术' ? (
          <div className="mt-2">
            <p className="text-xs font-medium text-ink">{advice.标题}</p>
            {advice.说明.map((line) => (
              <p key={line} className="mt-1 text-body leading-relaxed text-ink-2">
                {line}
              </p>
            ))}
            {advice.话术 ? (
              <p className="mt-2 rounded border border-line-soft bg-canvas px-2 py-2 text-body leading-relaxed text-ink">
                {advice.话术}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onUseScript}
              className="mt-2 w-full rounded bg-brand py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
            >
              采用
            </button>
          </div>
        ) : null}

        {/* 需要授权：事该办但越过我的额度，报备后台审批，顾客无感 */}
        {advice.形态 === '需要授权' ? (
          <div className="mt-2">
            <p className="text-xs font-medium text-hold-ink">{advice.标题}</p>
            {advice.说明.map((line) => (
              <p key={line} className="mt-1 text-body leading-relaxed text-ink-2">
                {line}
              </p>
            ))}

            {报备 ? (
              <>
                <p className="mt-2 rounded border border-hold-line bg-hold-soft py-1.5 text-center text-body text-hold-ink">
                  {报备态 === '等审批'
                    ? '已提交组长审批 · 顾客无感知'
                    : '组长已批准 · 顾客无感知'}
                </p>

                {/* 审批回来了：把要发的那句摆出来，客服看一眼再点。发一句他没看过
                    的话成了盲发 —— 这一下按下去是要算在他头上的。 */}
                {报备态 === '等发送' ? (
                  <>
                    {待发句 ? (
                      <p className="mt-1.5 rounded border border-line-soft bg-canvas px-2 py-2 text-body leading-relaxed text-ink">
                        {待发句.message_text}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-body font-medium text-hold-ink">请答复顾客</p>
                    <p className="mt-0.5 text-note text-ink-4">
                      报备单号 {报备.工单号} · 这句是按审批口径写好的
                    </p>
                    <button
                      type="button"
                      onClick={onSendPending}
                      className="mt-2 w-full rounded bg-hold py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      一键发送
                    </button>
                  </>
                ) : (
                  <div className="mt-1.5 rounded border border-line-soft bg-canvas px-2 py-1.5">
                    <p className="text-body font-medium text-ink-2">
                      {报备态 === '已答复'
                        ? '已答复顾客'
                        : `等待组长审批 · 已过 ${报备.等待分钟} 分钟`}
                    </p>
                    <p className="mt-0.5 text-note text-ink-4">
                      {报备态 === '已答复'
                        ? '答复里承诺的回访由专员接，这轮不用再跟'
                        : '审批回来会提示你答复顾客，别忘记跟进'}
                    </p>
                    <p className="mt-0.5 text-note text-ink-4">报备单号 {报备.工单号}</p>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onReport}
                className="mt-2 w-full rounded bg-hold py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                一键报备
              </button>
            )}
          </div>
        ) : null}

        {/* 有风险：H1–H4 命中，对话交出去 */}
        {advice.形态 === '有风险' ? (
          <div className="mt-2">
            <p className="rounded border border-risk-line bg-risk-soft px-2 py-1.5 text-body font-medium text-risk-ink">
              {advice.风险标签}
            </p>
            {advice.说明.map((line) => (
              <p key={line} className="mt-1 text-body leading-relaxed text-ink-2">
                {line}
              </p>
            ))}
            {advice.话术建议 ? (
              <p className="mt-1.5 text-body leading-relaxed text-ink-2">{advice.话术建议}</p>
            ) : null}

            {转交 ? (
              <div className="mt-2 rounded border border-risk-line bg-risk-soft py-1.5 text-center">
                <p className="text-body text-risk-ink">对话将转出，你不必再跟进</p>
                <p className="mt-0.5 text-note text-risk-ink-2">交接单号 {转交.工单号}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={onHandover}
                className="mt-2 w-full rounded bg-danger py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                立即转交
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* 卡级区块，**和三个形态并排**，不塞进任何一个里：第四步（需要话术）
          和第七步（需要授权）都带 `已代发`，将来转交那一轮也一样 ——
          「AI 替你说了句话」这件事跟这一轮判成哪种输出没关系。 */}
      {advice.已代发?.length ? <SentList 已代发={advice.已代发} /> : null}

      <EvidenceList advice={advice} />
    </section>
  )
}
