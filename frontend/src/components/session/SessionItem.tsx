import type { Session } from '../../types'

/** 头像底色。用昵称做哈希，保证同一个人每次渲染颜色一致。 */
const AVATAR_COLORS = ['#5b8def', '#f2994a', '#27ae60', '#9b51e0', '#eb5757', '#2d9cdb']

function avatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

type Props = {
  session: Session
  active: boolean
  onClick: () => void
}

export default function SessionItem({ session, active, onClick }: Props) {
  const 摘要 = session.摘要 ?? session.消息.at(-1)?.message_text ?? ''
  const 最近时间 = session.最近时间 ?? session.消息.at(-1)?.发送时间.slice(5, 16) ?? ''
  const 头像字 = session.买家昵称.slice(0, 1)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2 border-b border-line-soft px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-brand-soft' : 'hover:bg-canvas'
      }`}
    >
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: avatarColor(session.买家昵称) }}
      >
        {头像字}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-xs font-medium text-ink">{session.买家昵称}</span>
          <span className="shrink-0 text-[11px] text-ink-3">{最近时间}</span>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-ink-3">{摘要}</span>
          {session.未读 ? (
            <span className="shrink-0 rounded-full bg-danger px-1.5 text-[10px] leading-4 text-white">
              {session.未读}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}
