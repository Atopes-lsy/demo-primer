/** 已经发生的 AI 答复记录；不生成回复、不触发发送。 */
export default function AutoAdviceCard({ scripts, onArchive, archived }: {
  scripts: string[]; onArchive?: () => void; archived?: boolean
}) {
  return <section className="primer-advice primer-structured" data-tone="auto">
    <header><h2>Primer 建议</h2><span className="primer-judgement">{scripts.length ? '已自动回复' : '无需操作'}</span></header>
    <div className="primer-advice-body">
      <h3 className="primer-advice-title">{scripts.length ? '标准问题已处理，回复已发送' : '本轮无需客服动作'}</h3>
      <ol className="primer-step-flow">
        <li className="primer-step"><span className="primer-step-number" aria-hidden="true">1</span><div><span className="primer-step-label">判断</span><p className="primer-step-judgement">{scripts.length ? 'AI 自动处理 · 无需人工发送' : '没有需要处理的主张'}</p></div></li>
        <li className="primer-step"><span className="primer-step-number" aria-hidden="true">2</span><div><span className="primer-step-label">{scripts.length ? '已发送回复' : '处理说明'}</span><div className="primer-script">{scripts.length ? scripts.map((s, i) => <p key={`${i}-${s}`}>{s}</p>) : '当前无待办回复。'}</div><p className="primer-source-caption">{scripts.length ? 'Primer 自动发送 · 对应回复见聊天记录' : '以本轮判定结果为准'}</p></div></li>
        <li className="primer-step primer-step-execution"><span className="primer-step-number" aria-hidden="true">3</span><div><span className="primer-step-label">处理记录</span>
          {onArchive ? <button type="button" disabled={archived} onClick={onArchive} className="primer-action primer-primary primer-review-archive">{archived ? '已模拟入库 · 未写入后台' : '模拟会话收尾并入库'}</button> : <p className="primer-completion">{scripts.length ? '已答复 · 无需重复发送' : '暂无执行操作'}</p>}
        </div></li>
      </ol>
    </div>
  </section>
}
