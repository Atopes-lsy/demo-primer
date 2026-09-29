import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { EVIDENCE_SOURCE, type Advice, type Evidence, type EvidenceSource } from '../../types'

type Props = {
  advice: Advice
  /** 「采用并发送」：把话术带进输入框，客服可改。 */
  onUseScript: () => void
  /** 「一键报备」：后台走审批，对话还在客服手里。 */
  onReport: () => void
  /** 「立即转交」：对话交出去，客服不再跟进。 */
  onHandover: () => void
  /** 已报备后的等待状态。 */
  报备?: { 等待分钟: number; 工单号: string }
  /** 已转交后的交接单号。 */
  转交?: { 工单号: string }
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
 * 「Primer 建议」主卡 —— 右栏里随情况变的那一块。
 *
 * 一轮可能拆出多条主张、产出不同输出，这里只显示最高态；其余的在输入框下方
 * 的「本轮处置」里逐条可查，免得客服以为 AI 抢了他的活或者漏做了什么。
 */
export default function AdviceCard({ advice, onUseScript, onReport, onHandover, 报备, 转交 }: Props) {
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
              采用并发送
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
                  已提交组长审批 · 顾客无感知
                </p>
                <div className="mt-1.5 rounded border border-line-soft bg-canvas px-2 py-1.5">
                  <p className="text-body font-medium text-ink-2">
                    等待组长审批 · 已过 {报备.等待分钟} 分钟
                  </p>
                  <p className="mt-0.5 text-note text-ink-4">
                    审批回来会提示你答复顾客，别忘记跟进
                  </p>
                  <p className="mt-0.5 text-note text-ink-4">报备单号 {报备.工单号}</p>
                </div>
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

      <EvidenceList advice={advice} />
    </section>
  )
}
