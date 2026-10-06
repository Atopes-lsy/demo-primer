import { useState } from 'react'

/** demo 在每次挂载后用 CSS 自动演示 +1；真实模式只响应真实计数变化。 */
export default function PrecedentCount({ count, demo = false }: { count: number; demo?: boolean }) {
  const [snapshot, setSnapshot] = useState({ value: count, previous: count })
  if (snapshot.value !== count) setSnapshot({ value: count, previous: snapshot.value })
  const value = demo ? count + 1 : snapshot.value
  const previous = demo ? count : snapshot.previous
  const delta = value - previous
  return <span key={value} className="primer-count-swap" data-changed={delta !== 0} data-demo={demo}
    aria-label={demo ? `演示：${count} 加一至 ${value}，未写入后台` : undefined}>
    {delta !== 0 && <span aria-hidden="true" className="primer-count-old">{previous}</span>}
    <strong className="primer-precedent-number">{value}</strong>
    {delta > 0 && <em aria-hidden="true" className="primer-count-delta">+{delta}</em>}
  </span>
}
