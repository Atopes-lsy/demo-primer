import { useState } from 'react'

/** 只记录计数差值供 CSS 呈现；不计时、不修改真实入库数量。 */
export default function PrecedentCount({ count }: { count: number }) {
  const [snapshot, setSnapshot] = useState({ value: count, previous: count })
  if (snapshot.value !== count) setSnapshot({ value: count, previous: snapshot.value })
  const delta = snapshot.value - snapshot.previous
  return <span key={snapshot.value} className="primer-count-swap" data-changed={delta !== 0}>
    {delta !== 0 && <span aria-hidden="true" className="primer-count-old">{snapshot.previous}</span>}
    <strong className="primer-precedent-number">{snapshot.value}</strong>
    {delta > 0 && <em aria-hidden="true" className="primer-count-delta">+{delta}</em>}
  </span>
}
