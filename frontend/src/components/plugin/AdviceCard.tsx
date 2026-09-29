import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import type { Advice } from '../../types'

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
  const 用上 = advice.依据.filter((e) => e.用上)
  const 没用上 = advice.依据.filter((e) => !e.用上)

  return (
    <div className="border-t border-line-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 px-3 py-2 text-[11px] font-medium text-ink-2 hover:bg-canvas"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        依据
      </button>

      {open ? (
        <div className="px-3 pb-2.5">
          {用上.map((e) => (
            <div key={e.序号} className="mb-1.5">
              <p className="text-[11px] text-ink">
                <span className="mr-1 text-ink-3">{e.序号}</span>
                {e.出处}
              </p>
              <p className="pl-4 text-[10px] text-ink-3">{e.摘要}</p>
            </div>
          ))}

          {没用上.length > 0 ? (
            <p className="mt-2 text-[10px] leading-relaxed text-ink-4">
              没用上的：
              {没用上.map((e) => `${e.序号} ${e.出处}`).join('　')}
            </p>
          ) : null}

          <p className="mt-1 text-[10px] text-ink-4">（列全是为了证明没有遗漏）</p>
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
        <p className="inline-block rounded-full bg-canvas px-2 py-0.5 text-[10px] text-ink-2">
          AI 判断：{advice.判断}
        </p>

        {/* 需要话术：给出成稿，客服看一眼点一下 */}
        {advice.形态 === '需要话术' ? (
          <div className="mt-2">
            <p className="text-xs font-medium text-ink">{advice.标题}</p>
            {advice.说明.map((line) => (
              <p key={line} className="mt-1 text-[11px] leading-relaxed text-ink-2">
                {line}
              </p>
            ))}
            {advice.话术 ? (
              <p className="mt-2 rounded border border-line-soft bg-canvas px-2 py-2 text-[11px] leading-relaxed text-ink">
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
              <p key={line} className="mt-1 text-[11px] leading-relaxed text-ink-2">
                {line}
              </p>
            ))}

            {报备 ? (
              <>
                <p className="mt-2 rounded border border-hold-line bg-hold-soft py-1.5 text-center text-[11px] text-hold-ink">
                  已提交组长审批 · 顾客无感知
                </p>
                <div className="mt-1.5 rounded border border-line-soft bg-canvas px-2 py-1.5">
                  <p className="text-[11px] font-medium text-ink-2">
                    等待组长审批 · 已过 {报备.等待分钟} 分钟
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-4">
                    审批回来会提示你答复顾客，别忘记跟进
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-4">报备单号 {报备.工单号}</p>
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
            <p className="rounded border border-risk-line bg-risk-soft px-2 py-1.5 text-[11px] font-medium text-risk-ink">
              {advice.风险标签}
            </p>
            {advice.说明.map((line) => (
              <p key={line} className="mt-1 text-[11px] leading-relaxed text-ink-2">
                {line}
              </p>
            ))}
            {advice.话术建议 ? (
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-2">{advice.话术建议}</p>
            ) : null}

            {转交 ? (
              <div className="mt-2 rounded border border-risk-line bg-risk-soft py-1.5 text-center">
                <p className="text-[11px] text-risk-ink">对话将转出，你不必再跟进</p>
                <p className="mt-0.5 text-[10px] text-risk-ink-2">交接单号 {转交.工单号}</p>
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
