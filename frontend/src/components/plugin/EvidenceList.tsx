import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import PrecedentCount from './PrecedentCount'
import { EVIDENCE_SOURCE, type Evidence, type EvidenceSource } from '../../types'

/** 与建议卡解耦。undefined = 尚未提供结果；不把缺数据伪装成「无记录」。 */
export default function EvidenceList({ evidence, precedentCount, review = false }: { evidence?: Evidence[]; precedentCount?: number; review?: boolean }) {
  const [open, setOpen] = useState(true)
  const sources = Object.keys(EVIDENCE_SOURCE) as EvidenceSource[]
  const hits = sources.filter((source) => evidence?.some((e) => e.序号 === source && e.用上))
  return (
    <section className="primer-evidence primer-surface-in overflow-hidden rounded-[20px] border border-white/90 bg-panel/90">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-ink-2 hover:bg-canvas/70">
        <span className="text-base font-semibold text-ink">六源依据</span>
        <span key={JSON.stringify(evidence)} className="primer-source-count ml-auto text-body text-ink-3">{evidence ? `${hits.length}/6 源被采用` : '等待结果'}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="border-t border-line-soft px-3 pb-2.5">
        {sources.map((source) => {
          const entries = evidence?.filter((e) => e.序号 === source) ?? []
          const hit = hits.includes(source)
          const status = hit ? '已采用' : evidence === undefined ? '待提供' : entries.length ? '未采用' : '未返回'
          return <details key={`${source}-${JSON.stringify(entries)}`} data-hit={hit} className="primer-evidence-detail">
            <summary className="primer-evidence-row flex min-h-8 cursor-pointer items-center gap-2 border-b border-line-soft text-xs">
              <span className={`size-2 shrink-0 rounded-full ${hit ? 'bg-hold' : 'bg-line'}`} />
              <span className="min-w-0 flex-1 truncate text-ink-2">{EVIDENCE_SOURCE[source]}</span>
              <span className={`shrink-0 text-body ${hit ? 'text-hold-ink' : 'text-ink-3'}`}>{status}</span>
              <ChevronRight size={11} className="primer-source-chevron shrink-0 text-ink-3" />
            </summary>
            <div className="primer-source-detail space-y-2 py-2 text-body leading-relaxed text-ink-2">
              {entries.length ? entries.map((e, i) => <p key={`${e.出处}-${i}`}><strong className="font-medium">{e.出处}</strong><br />{e.摘要}</p>)
                : <p>{evidence === undefined ? '这一轮尚未提供该来源的检查结果。' : '本轮未返回该来源，不能据此断言没有记录。'}</p>}
            </div>
          </details>
        })}
      </div>}
      {precedentCount !== undefined && <p className="primer-precedent" aria-live="polite">
        <span title={review ? '本地演示计数，未写入后台' : undefined}>历史相似对话</span>
        <PrecedentCount count={precedentCount} demo={review} /><span>条</span>
      </p>}
    </section>
  )
}
